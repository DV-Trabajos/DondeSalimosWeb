// Reservas.jsx - Componente de reservas
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, Clock, AlertCircle, Download, Search, 
  Filter, CheckCircle, XCircle, Sparkles, CalendarDays,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Header from '../Shared/Header';
import ReservaCard from './ReservaCard';
import ReservasRecibidas from './ReservasRecibidas';
import ReservasFilters from './ReservasFilters';
import CancelReservaModal from './CancelReservaModal';
import { 
  getAllReservas,
  cancelReserva 
} from '../../services/reservasService';

const Reservas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialTab = location.state?.activeTab || 'mis-reservas';
  const [activeTab, setActiveTab] = useState(initialTab);
  
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
    periodo: 'todos',
    comercio: 'todos'
  });

  // Determinar rol
  const isBarOwner = user?.iD_RolUsuario === 3;
  const isAdmin = user?.iD_RolUsuario === 2;

  // Cargar reservas
  useEffect(() => {
    if (activeTab === 'mis-reservas') {
      cargarMisReservas();
    }
  }, [activeTab, user]);

  // Carga las reservas del usuario como cliente
  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const allReservas = await getAllReservas();
      const reservasUsuario = allReservas.filter(r => r.iD_Usuario === user.iD_Usuario);

      // Ordenar por fecha (más recientes primero)
      const reservasOrdenadas = reservasUsuario.sort((a, b) => 
        new Date(b.fechaReserva) - new Date(a.fechaReserva)
      );

      setReservas(reservasOrdenadas);
    } catch (err) {
      setError('No se pudieron cargar tus reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reservas según los filtros activos
  const reservasFiltradas = useMemo(() => {
    let resultado = [...reservas];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      resultado = resultado.filter(r =>
        r.comercio?.nombre?.toLowerCase().includes(searchLower) ||
        r.nombreCliente?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado !== 'todos') {
      switch (filters.estado) {
        case 'confirmadas':
          resultado = resultado.filter(r => r.estado === true && !r.motivoRechazo);
          break;
        case 'pendientes':
          resultado = resultado.filter(r => r.estado === false && !r.motivoRechazo);
          break;
        case 'canceladas':
          resultado = resultado.filter(r => r.estado === false && r.motivoRechazo);
          break;
      }
    }

    // Filtro por período
    if (filters.periodo !== 'todos') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      switch (filters.periodo) {
        case 'hoy':
          resultado = resultado.filter(r => {
            const fecha = new Date(r.fechaReserva);
            fecha.setHours(0, 0, 0, 0);
            return fecha.getTime() === hoy.getTime();
          });
          break;
        case 'proximas':
          resultado = resultado.filter(r => new Date(r.fechaReserva) >= hoy);
          break;
        case 'pasadas':
          resultado = resultado.filter(r => new Date(r.fechaReserva) < hoy);
          break;
      }
    }

    return resultado;
  }, [reservas, filters]);

  // Calcular estadísticas de mis reservas
  const estadisticasMisReservas = useMemo(() => {
    const total = reservas.length;
    const pendientes = reservas.filter(r => r.estado === false && !r.motivoRechazo).length;
    const confirmadas = reservas.filter(r => r.estado === true && !r.motivoRechazo).length;
    const canceladas = reservas.filter(r => r.motivoRechazo).length;

    return { total, pendientes, confirmadas, canceladas };
  }, [reservas]);

  // "Cancelar Reserva"
  const handleCancelar = (reserva) => {
    setSelectedReserva(reserva);
    setShowCancelModal(true);
  };

  // Confirma la cancelación de la reserva
  const handleCancelConfirm = async (reserva) => {
    try {
      await cancelReserva(reserva.iD_Reserva, reserva, 'Cancelada por el usuario');
      await cargarMisReservas();
      setShowCancelModal(false);
      setSelectedReserva(null);
    } catch (err) {
      alert('Error al cancelar la reserva. Intenta nuevamente.');
    }
  };

  // Maneja cambios en filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Exportar reservas a CSV
  const exportarReservas = () => {
    if (reservasFiltradas.length === 0) {
      alert('No hay reservas para exportar');
      return;
    }

    const headers = ['ID', 'Comercio', 'Fecha', 'Hora', 'Personas', 'Estado'];
    const rows = reservasFiltradas.map(r => [
      r.iD_Reserva,
      r.comercio?.nombre || 'N/A',
      new Date(r.fechaReserva).toLocaleDateString('es-ES'),
      new Date(r.fechaReserva).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      r.comensales || 1,
      r.estado ? (r.motivoRechazo ? 'Rechazada' : 'Confirmada') : (r.motivoRechazo ? 'Cancelada' : 'Pendiente')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mis-reservas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Componente de Stat Card mejorado
  const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor, iconBg }) => (
    <div className={`
      relative overflow-hidden bg-white rounded-2xl p-5 border-2 ${borderColor}
      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
      </div>
      {/* Decoración de fondo */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${bgColor} rounded-full opacity-50`}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mini Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-3">
                <CalendarDays className="w-4 h-4" />
                <span>Gestión de reservas</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'mis-reservas' ? 'Mis Reservas' : 'Reservas Recibidas'}
              </h1>
              <p className="text-gray-300">
                {activeTab === 'mis-reservas' 
                  ? 'Administrá todas tus reservas en un solo lugar'
                  : 'Gestioná las reservas de tus comercios'
                }
              </p>
            </div>

            {(isBarOwner || isAdmin) && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('mis-reservas')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'mis-reservas'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Mis Reservas
                </button>
                <button
                  onClick={() => setActiveTab('reservas-recibidas')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'reservas-recibidas'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Reservas Recibidas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerta de cuenta suspendida */}
      {user && user.estado === false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'mis-reservas' ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Calendar}
                label="Total"
                value={estadisticasMisReservas.total}
                color="text-gray-700"
                bgColor="bg-gray-100"
                borderColor="border-gray-200"
                iconBg="bg-gray-100"
              />
              <StatCard
                icon={Clock}
                label="Pendientes"
                value={estadisticasMisReservas.pendientes}
                color="text-amber-600"
                bgColor="bg-amber-100"
                borderColor="border-amber-200"
                iconBg="bg-amber-100"
              />
              <StatCard
                icon={CheckCircle}
                label="Confirmadas"
                value={estadisticasMisReservas.confirmadas}
                color="text-emerald-600"
                bgColor="bg-emerald-100"
                borderColor="border-emerald-200"
                iconBg="bg-emerald-100"
              />
              <StatCard
                icon={XCircle}
                label="Canceladas"
                value={estadisticasMisReservas.canceladas}
                color="text-red-600"
                bgColor="bg-red-100"
                borderColor="border-red-200"
                iconBg="bg-red-100"
              />
            </div>

            {/* Filtros */}
            <ReservasFilters
              onFilterChange={handleFilterChange}
              activeFilters={filters}
            />

            {/* Botón exportar */}
            {reservasFiltradas.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={exportarReservas}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando reservas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={cargarMisReservas}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Reintentar
                </button>
              </div>
            ) : reservas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No tenés reservas aún
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Explorá los comercios disponibles y hacé tu primera reserva
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  Explorar comercios
                </button>
              </div>
            ) : reservasFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay resultados
                </h3>
                <p className="text-gray-500 mb-6">
                  No encontramos reservas con los filtros seleccionados
                </p>
                <button
                  onClick={() => setFilters({ search: '', estado: 'todos', periodo: 'todos', comercio: 'todos' })}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <>
                {/* Contador de resultados */}
                {reservasFiltradas.length !== reservas.length && (
                  <div className="mb-4 text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-purple-600">{reservasFiltradas.length}</span> de{' '}
                    <span className="font-semibold">{reservas.length}</span> reservas
                  </div>
                )}

                {/* Grid de reservas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reservasFiltradas.map(reserva => (
                    <ReservaCard
                      key={reserva.iD_Reserva}
                      reserva={reserva}
                      isOwner={false}
                      onCancelar={handleCancelar}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Tab de Reservas Recibidas
          <ReservasRecibidas userId={user.iD_Usuario} />
        )}
      </div>

      {/* Modal de Cancelar Reserva */}
      <CancelReservaModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedReserva(null);
        }}
        reserva={selectedReserva}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default Reservas;