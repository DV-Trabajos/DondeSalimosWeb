// MisResenias.jsx - Página de reseñas
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MessageSquare, Search, AlertCircle, 
  Sparkles, TrendingUp, ArrowRight, Filter
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getAllResenias } from '../services/reseniasService';
import { getAllComercios } from '../services/comerciosService';

const MisResenias = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados de datos
  const [resenias, setResenias] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filtroCalificacion, setFiltroCalificacion] = useState('all');
  const [busqueda, setBusqueda] = useState('');
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedio: 0,
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

      // Cargar todos los comercios para poder mostrar nombres
      const comerciosData = await getAllComercios();
      setComercios(comerciosData);

      // Cargar todas las reseñas y filtrar las del usuario actual
      const allResenias = await getAllResenias();
      
      // Filtrar solo reseñas creadas POR este usuario
      const misResenias = allResenias.filter(
        resenia => resenia.iD_Usuario === user.iD_Usuario
      );

      // Ordenar por fecha (más recientes primero)
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
      });
    }

    setEstadisticas(stats);
  };

  // Filtrar reseñas
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
    if (!resenia.estado) {
      return { text: 'Rechazada', color: 'bg-red-100 text-red-700 border border-red-200' };
    }
    return { text: 'Publicada', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
  };

  // Obtener calificación más frecuente
  const getMasComun = () => {
    const entries = Object.entries(estadisticas.porCalificacion);
    const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b), ['0', 0]);
    return max[1] > 0 ? max[0] : '-';
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroCalificacion('all');
    setBusqueda('');
  };

  // Componente de Stat Card
  const StatCard = ({ icon: Icon, label, value, subtitle, color, bgColor, borderColor, iconBg, extra }) => (
    <div className={`
      relative overflow-hidden bg-white rounded-2xl p-5 border-2 ${borderColor}
      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {extra}
          </div>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${bgColor} rounded-full opacity-50`}></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus reseñas...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <Star className="w-4 h-4" />
                <span>Historial de opiniones</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Mis Reseñas
              </h1>
              <p className="text-gray-300">
                Todas las opiniones que compartiste sobre los comercios
              </p>
            </div>
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

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={MessageSquare}
            label="Total"
            value={estadisticas.total}
            subtitle="Reseñas creadas"
            color="text-blue-600"
            bgColor="bg-blue-100"
            borderColor="border-blue-100"
            iconBg="bg-blue-50"
          />
          <StatCard 
            icon={TrendingUp}
            label="Promedio"
            value={estadisticas.promedio.toFixed(1)}
            subtitle="De 5 estrellas"
            color="text-amber-600"
            bgColor="bg-amber-100"
            borderColor="border-amber-100"
            iconBg="bg-amber-50"
            extra={<Star className="w-6 h-6 fill-amber-400 text-amber-400" />}
          />
          <StatCard 
            icon={Star}
            label="Más Común"
            value={getMasComun()}
            subtitle="Calificación frecuente"
            color="text-emerald-600"
            bgColor="bg-emerald-100"
            borderColor="border-emerald-100"
            iconBg="bg-emerald-50"
            extra={getMasComun() !== '-' && <Star className="w-6 h-6 fill-emerald-400 text-emerald-400" />}
          />
        </div>

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
              <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
              <option value="4">⭐⭐⭐⭐ (4 estrellas)</option>
              <option value="3">⭐⭐⭐ (3 estrellas)</option>
              <option value="2">⭐⭐ (2 estrellas)</option>
              <option value="1">⭐ (1 estrella)</option>
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
      </div>
    </div>
  );
};

export default MisResenias;