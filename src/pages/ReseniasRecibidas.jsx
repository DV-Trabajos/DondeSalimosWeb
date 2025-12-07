// ReseniasRecibidas.jsx - Página de reseñas recibidas para dueños de comercio
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MessageSquare, Search, AlertCircle, Store,
  Sparkles, TrendingUp, ArrowRight, Filter, Calendar,
  User, ThumbsUp, ThumbsDown, ChevronDown, BarChart3,
  MessageCircle, Award, Clock, Plus, CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getAllResenias } from '../services/reseniasService';
import { getComerciosByUsuario } from '../services/comerciosService';

const ReseniasRecibidas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados de datos
  const [resenias, setResenias] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filtroComercio, setFiltroComercio] = useState('all');
  const [filtroCalificacion, setFiltroCalificacion] = useState('all');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [busqueda, setBusqueda] = useState('');
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedio: 0,
    aprobadas: 0,
    pendientes: 0,
    rechazadas: 0,
    porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    if (user?.iD_Usuario) {
      cargarDatos();
    }
  }, [user]);

  useEffect(() => {
    calcularEstadisticas();
  }, [resenias]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar comercios del usuario
      const userComercios = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(userComercios);

      if (userComercios.length === 0) {
        setResenias([]);
        setLoading(false);
        return;
      }

      // Obtener IDs de los comercios del usuario
      const comercioIds = userComercios.map(c => c.iD_Comercio);

      // Cargar todas las reseñas y filtrar las de sus comercios
      const allResenias = await getAllResenias();
      const reseniasRecibidas = allResenias.filter(
        resenia => comercioIds.includes(resenia.iD_Comercio)
      );

      // Ordenar por fecha (más recientes primero)
      const reseniasOrdenadas = reseniasRecibidas.sort((a, b) => 
        new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      );

      setResenias(reseniasOrdenadas);
    } catch (err) {
      console.error('Error cargando reseñas recibidas:', err);
      setError('No se pudieron cargar las reseñas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const stats = {
      total: resenias.length,
      promedio: 0,
      aprobadas: 0,
      pendientes: 0,
      rechazadas: 0,
      porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (resenias.length > 0) {
      const suma = resenias.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
      stats.promedio = suma / resenias.length;

      resenias.forEach(r => {
        const cal = r.puntuacion || 0;
        if (cal >= 1 && cal <= 5) {
          stats.porCalificacion[cal]++;
        }

        // Contar por estado
        if (r.estado === true) {
          stats.aprobadas++;
        } else if (r.motivoRechazo) {
          stats.rechazadas++;
        } else {
          stats.pendientes++;
        }
      });
    }

    setEstadisticas(stats);
  };

  // Filtrar reseñas
  const reseniasFiltradas = useMemo(() => {
    return resenias.filter(resenia => {
      // Filtro por comercio
      if (filtroComercio !== 'all' && resenia.iD_Comercio !== parseInt(filtroComercio)) {
        return false;
      }

      // Filtro por calificación
      const calificacion = resenia.puntuacion || 0;
      if (filtroCalificacion !== 'all' && calificacion !== parseInt(filtroCalificacion)) {
        return false;
      }

      // Filtro por estado
      if (filtroEstado !== 'all') {
        if (filtroEstado === 'aprobada' && resenia.estado !== true) return false;
        if (filtroEstado === 'pendiente' && (resenia.estado === true || resenia.motivoRechazo)) return false;
        if (filtroEstado === 'rechazada' && !resenia.motivoRechazo) return false;
      }

      // Filtro por búsqueda
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        const comentario = (resenia.comentario || '').toLowerCase();
        const usuario = (resenia.usuario?.nombreUsuario || '').toLowerCase();
        const comercio = getNombreComercio(resenia.iD_Comercio).toLowerCase();
        return comentario.includes(searchLower) || 
               usuario.includes(searchLower) || 
               comercio.includes(searchLower);
      }

      return true;
    });
  }, [resenias, filtroComercio, filtroCalificacion, filtroEstado, busqueda]);

  const limpiarFiltros = () => {
    setFiltroComercio('all');
    setFiltroCalificacion('all');
    setFiltroEstado('all');
    setBusqueda('');
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - date;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getNombreComercio = (idComercio) => {
    const comercio = comercios.find(c => c.iD_Comercio === idComercio);
    return comercio?.nombre || 'Comercio';
  };

  const getEstadoLabel = (resenia) => {
    if (resenia.estado === true) {
      return { 
        text: 'Publicada', 
        color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        icon: ThumbsUp
      };
    }
    if (resenia.motivoRechazo) {
      return { 
        text: 'Rechazada', 
        color: 'bg-red-100 text-red-700 border border-red-200',
        icon: ThumbsDown
      };
    }
    return { 
      text: 'Pendiente', 
      color: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: Clock
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mini Hero */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {/* Badge con icono */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-purple-300 text-sm font-medium">Opiniones de clientes</span>
              </div>
              
              {/* Título */}
              <h1 className="text-4xl font-bold text-white mb-2">
                Reseñas Recibidas
              </h1>
              <p className="text-purple-200/70">
                Gestioná las opiniones de tus clientes
              </p>

              {/* Stats */}
              {!loading && comercios.length > 0 && (
                <div className="mt-4 inline-flex flex-wrap items-center gap-4 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-semibold">{estadisticas.total}</span>
                    <span className="text-purple-300/70 text-sm">reseñas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-semibold">{estadisticas.aprobadas}</span>
                    <span className="text-purple-300/70 text-sm">publicadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-semibold">{estadisticas.pendientes}</span>
                    <span className="text-purple-300/70 text-sm">pendientes</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V60Z" fill="#F9FAFB"/>
          </svg>
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
                  Tu cuenta se encuentra desactivada. Las reseñas de tus comercios no están visibles públicamente.
                </p>
                <p className="text-amber-600 text-sm">
                  Para reactivar tu cuenta, contactá a un administrador desde tu{' '}
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
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando reseñas...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Error al cargar</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={cargarDatos}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
              >
                Reintentar
              </button>
            </div>
          ) : comercios.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tenés comercios registrados
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Registrá tu primer comercio para empezar a recibir reseñas de tus clientes.
              </p>
              <button
                onClick={() => navigate('/mis-comercios')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/25"
              >
                Registrar comercio
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              {/* Filtros */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                  {/* Búsqueda */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por usuario, comercio o comentario..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                      />
                    </div>
                  </div>

                  {/* Filtro por comercio */}
                  <div className="relative min-w-[180px]">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={filtroComercio}
                      onChange={(e) => setFiltroComercio(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition appearance-none bg-white"
                    >
                      <option value="all">Todos los comercios</option>
                      {comercios.map(comercio => (
                        <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                          {comercio.nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Filtro por calificación */}
                  <div className="relative min-w-[160px]">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={filtroCalificacion}
                      onChange={(e) => setFiltroCalificacion(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition appearance-none bg-white"
                    >
                      <option value="all">Todas las estrellas</option>
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Filtro por estado */}
                  <div className="relative min-w-[150px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition appearance-none bg-white"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="aprobada">✅ Publicadas</option>
                      <option value="pendiente">⏳ Pendientes</option>
                      <option value="rechazada">❌ Rechazadas</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Limpiar filtros */}
                  {(busqueda || filtroComercio !== 'all' || filtroCalificacion !== 'all' || filtroEstado !== 'all') && (
                    <button
                      onClick={limpiarFiltros}
                      className="px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Distribución de calificaciones */}
              {resenias.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Distribución de calificaciones
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = estadisticas.porCalificacion[stars];
                      const percentage = estadisticas.total > 0 
                        ? (count / estadisticas.total) * 100 
                        : 0;
                      
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-20">
                            <span className="text-sm font-medium text-gray-700">{stars}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de reseñas */}
              {resenias.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Aún no tenés reseñas
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Cuando tus clientes dejen reseñas en tus comercios, las verás acá.
                  </p>
                </div>
              ) : reseniasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No hay resultados
                  </h3>
                  <p className="text-gray-500 mb-6">
                    No encontramos reseñas con los filtros seleccionados
                  </p>
                  <button
                    onClick={limpiarFiltros}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <>
                  {/* Contador de resultados */}
                  {reseniasFiltradas.length !== resenias.length && (
                    <div className="mb-4 text-sm text-gray-600">
                      Mostrando <span className="font-semibold text-purple-600">{reseniasFiltradas.length}</span> de{' '}
                      <span className="font-semibold">{resenias.length}</span> reseñas
                    </div>
                  )}

                  {/* Grid de reseñas */}
                  <div className="space-y-4">
                    {reseniasFiltradas.map((resenia) => {
                      const calificacion = resenia.puntuacion || 0;
                      const estadoLabel = getEstadoLabel(resenia);
                      const EstadoIcon = estadoLabel.icon;
                      
                      return (
                        <div
                          key={resenia.iD_Resenia}
                          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                        >
                          {/* Header de la reseña */}
                          <div className="p-5 border-b border-gray-100">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                {/* Avatar del usuario */}
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-lg">
                                    {resenia.usuario?.nombreUsuario?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold text-gray-900">
                                      {resenia.usuario?.nombreUsuario || 'Usuario'}
                                    </h3>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">
                                      {formatearFecha(resenia.fechaCreacion)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {renderStars(calificacion)}
                                    <span className="text-sm text-gray-400">en</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                                      <Store className="w-3.5 h-3.5" />
                                      {getNombreComercio(resenia.iD_Comercio)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Estado */}
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${estadoLabel.color}`}>
                                <EstadoIcon className="w-3.5 h-3.5" />
                                {estadoLabel.text}
                              </span>
                            </div>
                          </div>

                          {/* Comentario */}
                          <div className="p-5 bg-gray-50/50">
                            <p className="text-gray-700 leading-relaxed">
                              {resenia.comentario || 'Sin comentario'}
                            </p>
                          </div>

                          {/* Motivo de rechazo (si existe) */}
                          {resenia.motivoRechazo && (
                            <div className="px-5 pb-5 bg-gray-50/50">
                              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-800">
                                  <span className="font-semibold">Motivo de rechazo:</span> {resenia.motivoRechazo}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Contador final */}
                  <div className="mt-6 text-center text-sm text-gray-500">
                    Mostrando {reseniasFiltradas.length} de {resenias.length} reseñas
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReseniasRecibidas;