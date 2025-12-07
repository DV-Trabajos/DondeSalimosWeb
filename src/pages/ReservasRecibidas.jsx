// ReservasRecibidas.jsx - Reservas recibidas al comercio
import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Clock, Filter, Search, CheckCircle, XCircle, 
  AlertCircle, CalendarCheck, History, Store, CalendarDays
} from 'lucide-react';
import { isToday, isTomorrow, isPast } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ReservaCard from '../components/Reservations/ReservaCard';
import ConfirmApproveModal from '../components/Reservations/ConfirmApproveModal';
import RejectReservaModal from '../components/Reservations/RejectReservaModal';
import { useNotification } from '../hooks/useNotification';
import { 
  getAllReservas,
  approveReserva,
  rejectReserva,
  filterReservasFuturas,
  filterReservasPasadas
} from '../services/reservasService';
import { getComerciosByUsuario } from '../services/comerciosService';

const ReservasRecibidas = () => {
  const { user } = useAuth();
  const { success, error: showError, warning } = useNotification();
  
  // Estados principales
  const [reservas, setReservas] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [processingReserva, setProcessingReserva] = useState(false);
  
  // Estado para sub-tabs (Activas / Historial)
  const [activeSubTab, setActiveSubTab] = useState('activas');
  
  // Estados para modales
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejectingPastReservation, setIsRejectingPastReservation] = useState(false);
  
  // Estados de filtros
  const [filtroComercio, setFiltroComercio] = useState('all');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [filtroFecha, setFiltroFecha] = useState('all');
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos
  useEffect(() => {
    cargarDatos();
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const comerciosData = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(comerciosData);

      if (comerciosData.length === 0) {
        setReservas([]);
        setLoading(false);
        return;
      }

      const allReservas = await getAllReservas();
      const comercioIds = comerciosData.map(c => c.iD_Comercio);
      
      const reservasRecibidas = allReservas.filter(
        reserva => comercioIds.includes(reserva.iD_Comercio)
      );
      
      // Ordenar por fecha de reserva: próximas primero (ascendente)
      const reservasOrdenadas = reservasRecibidas.sort((a, b) => 
        new Date(a.fechaReserva) - new Date(b.fechaReserva)
      );

      setReservas(reservasOrdenadas);

    } catch (err) {
      setError('No se pudieron cargar las reservas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Separar reservas en activas y pasadas con ordenamiento correcto
  const reservasActivas = useMemo(() => {
    const activas = filterReservasFuturas(reservas);
    // más próximas primero
    return activas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva));
  }, [reservas]);

  const reservasPasadas = useMemo(() => {
    const pasadas = filterReservasPasadas(reservas);
    // más recientes primero (descendente)
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
      hoy: reservasActivas.filter(r => isToday(new Date(r.fechaReserva))).length
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

  // Determinar qué estadísticas mostrar según el sub-tab
  const estadisticas = activeSubTab === 'activas' ? estadisticasActivas : estadisticasHistorial;

  // Actualizar banner en el header con las estadísticas reales
  useEffect(() => {
    const bannerContainer = document.getElementById('reservas-recibidas-stats');
    if (!bannerContainer) return;

    const bannerHTML = `
      <div class="inline-flex flex-wrap items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span class="text-white font-semibold">${estadisticas.total}</span>
          <span class="text-purple-300/70 text-sm">${activeSubTab === 'activas' ? 'activas' : 'en historial'}</span>
        </div>
        
        ${estadisticas.pendientes > 0 ? `
        <div class="w-px h-6 bg-white/20"></div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 ${activeSubTab === 'historial' ? 'text-orange-400' : 'text-amber-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="text-white font-semibold">${estadisticas.pendientes}</span>
          <span class="text-purple-300/70 text-sm">${activeSubTab === 'historial' ? 'sin resolver' : 'pendientes'}</span>
        </div>
        ` : ''}
        
        ${estadisticas.aprobadas > 0 ? `
        <div class="w-px h-6 bg-white/20"></div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          <span class="text-white font-semibold">${estadisticas.aprobadas}</span>
          <span class="text-purple-300/70 text-sm">aprobadas</span>
        </div>
        ` : ''}
        
        ${estadisticas.rechazadas > 0 ? `
        <div class="w-px h-6 bg-white/20"></div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span class="text-white font-semibold">${estadisticas.rechazadas}</span>
          <span class="text-purple-300/70 text-sm">rechazadas</span>
        </div>
        ` : ''}
        
        ${activeSubTab === 'activas' && estadisticas.hoy > 0 ? `
        <div class="w-px h-6 bg-white/20"></div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <span class="text-white font-semibold">${estadisticas.hoy}</span>
          <span class="text-purple-300/70 text-sm">hoy</span>
        </div>
        ` : ''}
      </div>
    `;
    
    bannerContainer.innerHTML = bannerHTML;
  }, [estadisticas, activeSubTab]);

  // Handlers de acciones
  const handleAprobar = (reserva) => {
    setSelectedReserva(reserva);
    setShowApproveModal(true);
  };

  const handleRechazar = (reserva) => {
    const reservaDate = new Date(reserva.fechaReserva);
    const now = new Date();
    const isPastReservation = reservaDate < now;
    
    setSelectedReserva(reserva);
    setIsRejectingPastReservation(isPastReservation);
    setShowRejectModal(true);
  };

  const confirmarAprobacion = async (reserva) => {
    try {
      setProcessingReserva(true);
      await approveReserva(reserva.iD_Reserva, reserva);
      
      setReservas(reservas.map(r => 
        r.iD_Reserva === reserva.iD_Reserva 
          ? { ...r, estado: true, motivoRechazo: null }
          : r
      ));
      
      success('Reserva aprobada exitosamente');
      setShowApproveModal(false);
      setSelectedReserva(null);
    } catch (err) {
      showError('No se pudo aprobar la reserva. Intenta nuevamente.');
    } finally {
      setProcessingReserva(false);
    }
  };

  const confirmarRechazo = async (reserva, motivo) => {
    try {
      setProcessingReserva(true);
      // Usar la reserva pasada por parámetro o la del estado
      const reservaToUse = reserva || selectedReserva;
      await rejectReserva(reservaToUse.iD_Reserva, reservaToUse, motivo);
      
      setReservas(reservas.map(r => 
        r.iD_Reserva === reservaToUse.iD_Reserva 
          ? { ...r, estado: false, motivoRechazo: motivo }
          : r
      ));
      
      warning('Reserva rechazada');
      setShowRejectModal(false);
      setSelectedReserva(null);
      setIsRejectingPastReservation(false);
    } catch (err) {
      showError('No se pudo rechazar la reserva. Intenta nuevamente.');
    } finally {
      setProcessingReserva(false);
    }
  };

  // Aplicar filtros
  const reservasFiltradas = useMemo(() => {
    return reservasToShow.filter(reserva => {
      // Filtro por comercio
      if (filtroComercio !== 'all' && reserva.iD_Comercio !== parseInt(filtroComercio)) {
        return false;
      }

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
        const nombreUsuario = reserva.usuario?.nombreUsuario?.toLowerCase() || '';
        const nombreComercio = comercios.find(c => c.iD_Comercio === reserva.iD_Comercio)?.nombre?.toLowerCase() || '';
        
        if (!nombreUsuario.includes(searchLower) && !nombreComercio.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [reservasToShow, filtroComercio, filtroEstado, filtroFecha, busqueda, comercios, activeSubTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section con banner de estadísticas */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Store className="w-4 h-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Panel de gestión</span>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Reservas Recibidas
          </h1>
          <p className="text-purple-200/70">
            Gestioná las reservas de tus comercios
          </p>

          {/* Banner de estadísticas dinámico */}
          <div id="reservas-recibidas-stats" className="mt-8">
            <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-300" />
                <span className="text-purple-300/70 text-sm">Cargando estadísticas...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decorativa */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 20L60 23.3C120 26.7 240 33.3 360 36.7C480 40 600 40 720 36.7C840 33.3 960 26.7 1080 23.3C1200 20 1320 20 1380 20H1440V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V20Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Estados de carga, error y sin comercios */}
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
              onClick={cargarDatos}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : comercios.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No tienes comercios registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Necesitas registrar un comercio para recibir reservas.
            </p>
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

            {/* Banner si hay filtro de comercio */}
            {filtroComercio !== 'all' && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900">
                        Filtrando por: {comercios.find(c => c.iD_Comercio === parseInt(filtroComercio))?.nombre}
                      </p>
                      <p className="text-sm text-purple-700">
                        Puedes cambiar el filtro abajo para ver otros comercios
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiltroComercio('all')}
                    className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                  >
                    Ver todas
                  </button>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtros</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtro por comercio */}
                {comercios.length > 1 && (
                  <select
                    value={filtroComercio}
                    onChange={(e) => setFiltroComercio(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Todos los comercios</option>
                    {comercios.map(comercio => (
                      <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                        {comercio.nombre}
                      </option>
                    ))}
                  </select>
                )}

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
                    placeholder="Buscar cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botón de limpiar filtros */}
              {(busqueda || filtroEstado !== 'all' || filtroFecha !== 'all' || filtroComercio !== 'all') && (
                <button
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('all');
                    setFiltroFecha('all');
                    setFiltroComercio('all');
                  }}
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
                    ? 'No hay reservas activas' 
                    : 'No hay reservas en el historial'}
                </h3>
                <p className="text-gray-500">
                  {(busqueda || filtroEstado !== 'all' || filtroFecha !== 'all' || filtroComercio !== 'all')
                    ? 'Intenta ajustar los filtros para ver más resultados.'
                    : activeSubTab === 'activas'
                      ? 'Cuando recibas nuevas reservas, aparecerán aquí.'
                      : 'Las reservas pasadas se mostrarán aquí.'}
                </p>
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
                  {reservasFiltradas.map(reserva => (
                    <ReservaCard
                      key={reserva.iD_Reserva}
                      reserva={reserva}
                      isOwner={true}
                      comercioNombre={comercios.find(c => c.iD_Comercio === reserva.iD_Comercio)?.nombre}
                      onAprobar={handleAprobar}
                      onRechazar={handleRechazar}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <ConfirmApproveModal
        isOpen={showApproveModal}
        reserva={selectedReserva}
        onConfirm={confirmarAprobacion}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedReserva(null);
        }}
        isLoading={processingReserva}
      />

      <RejectReservaModal
        isOpen={showRejectModal}
        reserva={selectedReserva}
        onConfirm={confirmarRechazo}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedReserva(null);
          setIsRejectingPastReservation(false);
        }}
        isLoading={processingReserva}
        isPastReservation={isRejectingPastReservation}
      />
    </div>
  );
};

export default ReservasRecibidas;