// MisResenias.jsx - Página de reseñas
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MessageSquare, Search, AlertCircle, 
  Sparkles, TrendingUp, ArrowRight, Filter, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getAllResenias } from '../services/reseniasService';
import { getAllComercios } from '../services/comerciosService';

const MisResenias = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [resenias, setResenias] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filtroCalificacion, setFiltroCalificacion] = useState('all');
  const [busqueda, setBusqueda] = useState('');
  
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedio: 0,
    publicadas: 0,
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

      const comerciosData = await getAllComercios();
      setComercios(comerciosData);

      const allResenias = await getAllResenias();
      
      const misResenias = allResenias.filter(
        resenia => resenia.iD_Usuario === user.iD_Usuario
      );

      const reseniasOrdenadas = misResenias.sort((a, b) => 
        new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      );

      setResenias(reseniasOrdenadas);
    } catch (err) {
      setError('No se pudieron cargar tus reseñas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = () => {
    const stats = {
      total: resenias.length,
      promedio: 0,
      publicadas: 0,
      pendientes: 0,
      rechazadas: 0,
      porCalificacion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (resenias.length > 0) {
      const suma = resenias.reduce((acc, r) => acc + (r.calificacion || r.puntuacion || 0), 0);
      stats.promedio = suma / resenias.length;

      resenias.forEach(r => {
        const cal = r.calificacion || r.puntuacion || 0;
        if (cal >= 1 && cal <= 5) {
          stats.porCalificacion[cal]++;
        }

        if (r.estado === true) {
          stats.publicadas++;
        } else if (r.motivoRechazo) {
          stats.rechazadas++;
        } else {
          stats.pendientes++;
        }
      });
    }

    setEstadisticas(stats);
  };

  const reseniasFiltradas = resenias.filter(resenia => {
    const calificacion = resenia.calificacion || resenia.puntuacion || 0;
    if (filtroCalificacion !== 'all' && calificacion !== parseInt(filtroCalificacion)) {
      return false;
    }

    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      const comentario = (resenia.comentario || '').toLowerCase();
      const comercio = getNombreComercio(resenia.iD_Comercio).toLowerCase();
      return comentario.includes(searchLower) || comercio.includes(searchLower);
    }

    return true;
  });

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
      return { text: 'Publicada', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
    }
    if (resenia.motivoRechazo) {
      return { text: 'Rechazada', color: 'bg-red-100 text-red-700 border border-red-200' };
    }
    return { text: 'Pendiente', color: 'bg-amber-100 text-amber-700 border border-amber-200' };
  };

  const limpiarFiltros = () => {
    setFiltroCalificacion('all');
    setBusqueda('');
  };

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
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <Star className="w-5 h-5 text-purple-300" />
            </div>
            <span className="text-purple-300/80 text-sm font-medium">Panel de gestión</span>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Mis Reseñas
          </h1>
          <p className="text-purple-200/70">
            Todas las opiniones que compartiste sobre los comercios
          </p>

          {/* Mini Stats en el Hero */}
          <div className="mt-8 inline-flex flex-wrap items-center gap-4 md:gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{estadisticas.total}</span>
              <span className="text-purple-300/70 text-sm">reseñas</span>
            </div>
            
            {estadisticas.publicadas > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-semibold">{estadisticas.publicadas}</span>
                  <span className="text-purple-300/70 text-sm">publicadas</span>
                </div>
              </>
            )}
            
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

            {estadisticas.promedio > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">{estadisticas.promedio.toFixed(1)}</span>
                  <span className="text-purple-300/70 text-sm">promedio</span>
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
                  Tu cuenta se encuentra desactivada, por lo que no podés crear nuevas reseñas 
                  y tus reseñas anteriores no están visibles en este momento.
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
        {loading ? (
          /* Estado de carga */
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tus reseñas...</p>
            </div>
          </div>
        ) : error ? (
          /* Estado de error */
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          /* Contenido normal */
          <>
            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Filtro por calificación */}
                <select
                  value={filtroCalificacion}
                  onChange={(e) => setFiltroCalificacion(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-700"
                >
                  <option value="all">Todas las calificaciones</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </select>

                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por texto o comercio..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Filtros activos */}
              {(filtroCalificacion !== 'all' || busqueda) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Filtros activos:</span>
                  <div className="flex gap-2 flex-wrap">
                    {filtroCalificacion !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {filtroCalificacion} estrellas
                        <button onClick={() => setFiltroCalificacion('all')} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                    {busqueda && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        "{busqueda}"
                        <button onClick={() => setBusqueda('')} className="hover:text-purple-900">×</button>
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={limpiarFiltros}
                    className="ml-auto text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            {/* Lista de reseñas */}
            {resenias.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No tenés reseñas aún
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  ¡Visitá un comercio y compartí tu experiencia con la comunidad!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/25"
                >
                  Explorar lugares
                  <ArrowRight className="w-5 h-5" />
                </button>
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
                    const calificacion = resenia.calificacion || resenia.puntuacion || 0;
                    const estadoLabel = getEstadoLabel(resenia);
                    
                    return (
                      <div
                        key={resenia.iD_Resenia}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        {/* Header de la reseña */}
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {getNombreComercio(resenia.iD_Comercio)}
                              </h3>
                              <div className="flex items-center gap-3">
                                {renderStars(calificacion)}
                                <span className="text-sm text-gray-400">
                                  {formatearFecha(resenia.fechaCreacion)}
                                </span>
                              </div>
                            </div>

                            {/* Estado */}
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${estadoLabel.color}`}>
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
                          <div className="px-5 pb-5">
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
  );
};

export default MisResenias;