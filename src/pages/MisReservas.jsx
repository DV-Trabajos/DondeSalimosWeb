// MisReservas.jsx - Página para que usuarios vean sus reservas
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, AlertCircle, CheckCircle, XCircle, Clock,
  CalendarDays, CalendarCheck, History, Search, Filter
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ReservaCard from '../components/Reservations/ReservaCard';
import CancelReservaModal from '../components/Reservations/CancelReservaModal';
import { 
  getAllReservas,
  cancelReserva,
  filterReservasFuturas,
  filterReservasPasadas
} from '../services/reservasService';
import { getUsuarioByEmail } from '../services/usuariosService';

const MisReservas = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para sub-tabs (Activas / Historial)
  const [activeSubTab, setActiveSubTab] = useState('activas');
  
  // Estados para el modal de cancelar
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  
  // Estados de filtros (estilo dropdown)
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [filtroFecha, setFiltroFecha] = useState('all');
  const [busqueda, setBusqueda] = useState('');

  // Refrescar datos del usuario al cargar
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
  }, []);

  // Cargar reservas al montar
  useEffect(() => {
    cargarMisReservas();
  }, [user]);

  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const allReservas = await getAllReservas();
      const reservasUsuario = allReservas.filter(r => r.iD_Usuario === user.iD_Usuario);

      setReservas(reservasUsuario);
    } catch (err) {
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Separar reservas en activas y pasadas
  const reservasActivas = useMemo(() => {
    const activas = filterReservasFuturas(reservas);
    // Más próximas primero (ascendente)
    return activas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva));
  }, [reservas]);

  const reservasPasadas = useMemo(() => {
    const pasadas = filterReservasPasadas(reservas);
    // Más recientes primero (descendente)
    return pasadas.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
  }, [reservas]);

  // Determinar qué lista usar según el sub-tab activo
  const reservasToShow = activeSubTab === 'activas' ? reservasActivas : reservasPasadas;

  // Estadísticas separadas por vista
  const estadisticasActivas = useMemo(() => {
    return {
      total: reservasActivas.length,
      pendientes: reservasActivas.filter(r => r.estado === false && !r.motivoRechazo).length,
      aprobadas: reservasActivas.filter(r => r.estado === true).length,
      rechazadas: reservasActivas.filter(r => r.estado === false && !!r.motivoRechazo).length,
    };
  }, [reservasActivas]);

  const estadisticasHistorial = useMemo(() => {
    return {
      total: reservasPasadas.length,
      aprobadas: reservasPasadas.filter(r => r.estado === true).length,
      rechazadas: reservasPasadas.filter(r => r.estado === false && !!r.motivoRechazo).length,
      pendientes: reservasPasadas.filter(r => r.estado === false && !r.motivoRechazo).length
    };
  }, [reservasPasadas]);

  // Determinar qué estadísticas mostrar
  const estadisticas = activeSubTab === 'activas' ? estadisticasActivas : estadisticasHistorial;

  // Handler de cancelación
  const handleCancelarReserva = (reserva) => {
    setSelectedReserva(reserva);
    setShowCancelModal(true);
  };

  const confirmarCancelacion = async (reserva) => {
    try {
      await cancelReserva(
        reserva.iD_Reserva, 
        reserva, 
        'Cancelada por el usuario'
      );
      
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

  // Helper para verificar si es hoy
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Helper para verificar si es mañana
  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getFullYear() === tomorrow.getFullYear();
  };

  // Aplicar filtros
  const reservasFiltradas = useMemo(() => {
    return reservasToShow.filter(reserva => {
      // Filtro por estado
      if (filtroEstado !== 'all') {
        if (filtroEstado === 'pendiente' && (reserva.estado !== false || reserva.motivoRechazo)) {
          return false;
        }
        if (filtroEstado === 'aprobada' && reserva.estado !== true) {
          return false;
        }
        if (filtroEstado === 'rechazada' && (reserva.estado !== false || !reserva.motivoRechazo)) {
          return false;
        }
      }

      // Filtro por fecha - Solo en vista activas
      if (activeSubTab === 'activas' && filtroFecha !== 'all') {
        const fechaReserva = new Date(reserva.fechaReserva);
        if (filtroFecha === 'hoy' && !isToday(fechaReserva)) {
          return false;
        }
        if (filtroFecha === 'mañana' && !isTomorrow(fechaReserva)) {
          return false;
        }
      }

      // Filtro por búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        const nombreComercio = reserva.comercio?.nombre?.toLowerCase() || '';
        if (!nombreComercio.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [reservasToShow, filtroEstado, filtroFecha, busqueda, activeSubTab]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroEstado('all');
    setFiltroFecha('all');
    setBusqueda('');
  };

  const hayFiltrosActivos = busqueda || filtroEstado !== 'all' || filtroFecha !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Mis Reservas
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl">
            Administrá todas tus reservas en un solo lugar
          </p>

          {/* Mini Stats en el Hero */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{estadisticas.total}</span>
              <span className="text-purple-300/70 text-sm">{activeSubTab === 'activas' ? 'activas' : 'en historial'}</span>
            </div>
            
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

        {/* Wave decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20L60 23.3C120 26.7 240 33.3 360 36.7C480 40 600 40 720 36.7C840 33.3 960 26.7 1080 23.3C1200 20 1320 20 1380 20H1440V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V20Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Alerta de cuenta suspendida */}
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
      <div className="container mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-800">{error}</p>
            <button 
              onClick={cargarMisReservas}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* Sub-tabs para Activas / Historial */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSubTab('activas')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeSubTab === 'activas'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CalendarCheck className="w-5 h-5" />
                  Reservas Activas
                  {estadisticasActivas.total > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeSubTab === 'activas'
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {estadisticasActivas.total}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveSubTab('historial')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeSubTab === 'historial'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <History className="w-5 h-5" />
                  Historial
                  {estadisticasHistorial.total > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeSubTab === 'historial'
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {estadisticasHistorial.total}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtros</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por estado */}
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobada">Aprobadas</option>
                  <option value="rechazada">Rechazadas</option>
                </select>

                {/* Filtro por fecha - Solo visible en "Activas" */}
                {activeSubTab === 'activas' && (
                  <select
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="hoy">Hoy</option>
                    <option value="mañana">Mañana</option>
                  </select>
                )}

                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar comercio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botón de limpiar filtros */}
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Lista de reservas */}
            {reservasFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {activeSubTab === 'activas' 
                    ? 'No tenés reservas activas' 
                    : 'No hay reservas en el historial'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hayFiltrosActivos
                    ? 'Intentá ajustar los filtros para ver más resultados.'
                    : activeSubTab === 'activas'
                      ? 'Cuando hagas una reserva, aparecerá aquí.'
                      : 'Las reservas pasadas se mostrarán aquí.'}
                </p>
                {!hayFiltrosActivos && activeSubTab === 'activas' && (
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg"
                  >
                    Explorar lugares
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Contador de resultados */}
                {reservasFiltradas.length !== reservasToShow.length && (
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-purple-600">{reservasFiltradas.length}</span> de{' '}
                    <span className="font-semibold">{reservasToShow.length}</span> reservas
                  </div>
                )}

                {/* Grid de reservas */}
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
              </>
            )}
          </>
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