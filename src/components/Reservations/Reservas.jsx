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
    } catch (error) {
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
                  ? 'Consultá y gestioná todas tus reservas en un solo lugar'
                  : 'Administrá las reservas de tus comercios'}
              </p>
            </div>
            
            {/* Botón Exportar */}
            <button
              onClick={exportarReservas}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 34C1200 36 1320 36 1380 36L1440 36V60H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs para dueños de comercio */}
        {(isBarOwner || isAdmin) && (
          <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
            <button
              onClick={() => setActiveTab('mis-reservas')}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                ${activeTab === 'mis-reservas'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Calendar className="w-4 h-4" />
              Mis Reservas
            </button>
            <button
              onClick={() => setActiveTab('recibidas')}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                ${activeTab === 'recibidas'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Users className="w-4 h-4" />
              Reservas Recibidas
            </button>
          </div>
        )}

        {/* Contenido según tab activo */}
        {activeTab === 'mis-reservas' ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                icon={CalendarDays}
                label="Total"
                value={estadisticasMisReservas.total}
                color="text-blue-600"
                bgColor="bg-blue-100"
                borderColor="border-blue-100"
                iconBg="bg-blue-50"
              />
              <StatCard 
                icon={Clock}
                label="Pendientes"
                value={estadisticasMisReservas.pendientes}
                color="text-amber-600"
                bgColor="bg-amber-100"
                borderColor="border-amber-100"
                iconBg="bg-amber-50"
              />
              <StatCard 
                icon={CheckCircle}
                label="Confirmadas"
                value={estadisticasMisReservas.confirmadas}
                color="text-emerald-600"
                bgColor="bg-emerald-100"
                borderColor="border-emerald-100"
                iconBg="bg-emerald-50"
              />
              <StatCard 
                icon={XCircle}
                label="Canceladas"
                value={estadisticasMisReservas.canceladas}
                color="text-red-500"
                bgColor="bg-red-100"
                borderColor="border-red-100"
                iconBg="bg-red-50"
              />
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, comercio..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
                
                {/* Filtros rápidos */}
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-700"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="confirmadas">Confirmadas</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="canceladas">Canceladas</option>
                  </select>
                  
                  <select
                    value={filters.periodo}
                    onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-700"
                  >
                    <option value="todos">Todos los períodos</option>
                    <option value="hoy">Hoy</option>
                    <option value="proximas">Próximas</option>
                    <option value="pasadas">Pasadas</option>
                  </select>
                </div>
              </div>

              {/* Filtros activos */}
              {(filters.search || filters.estado !== 'todos' || filters.periodo !== 'todos') && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Filtros activos:</span>
                  <div className="flex gap-2 flex-wrap">
                    {filters.search && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Búsqueda: "{filters.search}"
                        <button onClick={() => setFilters({ ...filters, search: '' })} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                    {filters.estado !== 'todos' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Estado: {filters.estado}
                        <button onClick={() => setFilters({ ...filters, estado: 'todos' })} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                    {filters.periodo !== 'todos' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        Período: {filters.periodo}
                        <button onClick={() => setFilters({ ...filters, periodo: 'todos' })} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setFilters({ search: '', estado: 'todos', periodo: 'todos', comercio: 'todos' })}
                    className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            {/* Lista de Mis Reservas */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando tus reservas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={cargarMisReservas}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
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
                  Comenzá a explorar lugares increíbles y hacé tu primera reserva
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/25"
                >
                  Explorar lugares
                  <ArrowRight className="w-5 h-5" />
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