// MisReservas.jsx - Página para que usuarios vean sus reservas
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, AlertCircle, CheckCircle, XCircle, Clock,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ReservaCard from '../components/Reservations/ReservaCard';
import ReservasFilters from '../components/Reservations/ReservasFilters';
import CancelReservaModal from '../components/Reservations/CancelReservaModal';
import { 
  getAllReservas,
  cancelReserva 
} from '../services/reservasService';
import { getUsuarioByEmail } from '../services/usuariosService';

const MisReservas = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el modal de cancelar
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    periodo: 'todos'
  });

  // Refrescar datos del usuario al cargar (para verificar estado actual de la cuenta)
  useEffect(() => {
    const refreshUserData = async () => {
      if (user?.correo && updateUser) {
        try {
          const updatedUser = await getUsuarioByEmail(user.correo);
          if (updatedUser) {
            updateUser(updatedUser);
          }
        } catch (error) {
          console.error('Error al refrescar usuario:', error);
        }
      }
    };
    
    refreshUserData();
  }, []); // Solo al montar

  // Cargar reservas al montar
  useEffect(() => {
    cargarMisReservas();
  }, [user]);

  // Carga las reservas del usuario como cliente
  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const allReservas = await getAllReservas();
      const reservasUsuario = allReservas.filter(r => r.iD_Usuario === user.iD_Usuario);

      // Ordenar por fecha de reserva: próximas primero (ascendente)
      const reservasOrdenadas = reservasUsuario.sort((a, b) => 
        new Date(a.fechaReserva) - new Date(b.fechaReserva)
      );

      setReservas(reservasOrdenadas);
    } catch (err) {
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Handler de cancelación de reserva
  const handleCancelarReserva = (reserva) => {
    setSelectedReserva(reserva);
    setShowCancelModal(true);
  };

  // Confirmar cancelación
  const confirmarCancelacion = async (reserva) => {
    try {
      // El servicio espera: cancelReserva(id, reserva, motivo)
      await cancelReserva(
        reserva.iD_Reserva, 
        reserva, 
        'Cancelada por el usuario'
      );
      
      // Actualizar lista local
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, estado: false, motivoRechazo: 'Cancelada por el usuario' }
          : r
      ));
      
      setShowCancelModal(false);
      setSelectedReserva(null);
    } catch (err) {
      setError('No se pudo cancelar la reserva. Intenta nuevamente.');
    }
  };

  // Filtrar reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nombreComercio = reserva.comercio?.nombre?.toLowerCase() || '';
        if (!nombreComercio.includes(searchLower)) {
          return false;
        }
      }

      // Filtro por estado
      if (filters.estado !== 'todos') {
        if (filters.estado === 'pendiente' && (reserva.estado !== false || reserva.motivoRechazo)) {
          return false;
        }
        if (filters.estado === 'aprobada' && reserva.estado !== true) {
          return false;
        }
        if (filters.estado === 'rechazada' && (reserva.estado !== false || !reserva.motivoRechazo)) {
          return false;
        }
      }

      // Filtro por periodo
      if (filters.periodo !== 'todos') {
        const fechaReserva = new Date(reserva.fechaReserva);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (filters.periodo === 'futuras' && fechaReserva < hoy) {
          return false;
        }
        if (filters.periodo === 'pasadas' && fechaReserva >= hoy) {
          return false;
        }
      }

      return true;
    });
  }, [reservas, filters]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    return {
      total: reservas.length,
      pendientes: reservas.filter(r => r.estado === false && !r.motivoRechazo).length,
      aprobadas: reservas.filter(r => r.estado === true).length,
      rechazadas: reservas.filter(r => r.estado === false && !!r.motivoRechazo).length,
    };
  }, [reservas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section con estilo de Mis Comercios */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <CalendarDays className="w-5 h-5 text-purple-300" />
            </div>
            <span className="text-purple-300/80 text-sm font-medium">Panel de gestión</span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-white mb-2">
            Mis Reservas
          </h1>
          <p className="text-purple-200/70">
            Administrá todas tus reservas en un solo lugar
          </p>

          {/* Mini Stats en el Hero */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{estadisticas.total}</span>
              <span className="text-purple-300/70 text-sm">reservas</span>
            </div>
            
            {estadisticas.pendientes > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-semibold">{estadisticas.pendientes}</span>
                  <span className="text-purple-300/70 text-sm">pendientes</span>
                </div>
              </>
            )}
            
            {estadisticas.aprobadas > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-semibold">{estadisticas.aprobadas}</span>
                  <span className="text-purple-300/70 text-sm">aprobadas</span>
                </div>
              </>
            )}
            
            {estadisticas.rechazadas > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-white font-semibold">{estadisticas.rechazadas}</span>
                  <span className="text-purple-300/70 text-sm">rechazadas</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20L60 23.3C120 26.7 240 33.3 360 36.7C480 40 600 40 720 36.7C840 33.3 960 26.7 1080 23.3C1200 20 1320 20 1380 20H1440V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V20Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Alerta de cuenta suspendida */}
      {(() => {
        return null;
      })()}
      {user && user.estado === false && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-1">
                  Cuenta temporalmente suspendida
                </h3>
                <p className="text-amber-700 mb-3">
                  Tu cuenta se encuentra desactivada, por lo que no podés realizar nuevas reservas 
                  y tus reservas anteriores no están visibles en este momento.
                </p>
                <p className="text-amber-600 text-sm">
                  Para reactivar tu cuenta, contactá a un administrador o solicitá la reactivación desde tu{' '}
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="font-semibold underline hover:text-amber-800"
                  >
                    perfil
                  </button>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <ReservasFilters
          filters={filters}
          onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
          comercios={[]}
          showComercioFilter={false}
        />

        {/* Lista de reservas */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-md border-2 border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tenés reservas aún</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.estado !== 'todos' || filters.periodo !== 'todos'
                ? 'No se encontraron reservas con los filtros aplicados.'
                : 'Empezá a explorar y reservá tu lugar favorito.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg"
            >
              Explorar lugares
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservasFiltradas.map((reserva) => (
              <ReservaCard
                key={reserva.iD_Reserva}
                reserva={reserva}
                onCancelar={handleCancelarReserva}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de cancelación */}
      <CancelReservaModal
        isOpen={showCancelModal}
        reserva={selectedReserva}
        onConfirm={confirmarCancelacion}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedReserva(null);
        }}
      />
    </div>
  );
};

export default MisReservas;
