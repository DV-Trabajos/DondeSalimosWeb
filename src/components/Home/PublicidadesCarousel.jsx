// PublicidadesCarousel.jsx - Carrusel profesional de publicidades activas
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Megaphone, MapPin, Clock, Eye, X } from 'lucide-react';
import { getAllPublicidades } from '../../services/publicidadesService';
import { convertBase64ToImage } from '../../utils/formatters';

const PublicidadesCarousel = ({ onVerEnMapa }) => {
  const [publicidades, setPublicidades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadPublicidades();
  }, []);

  // Auto-scroll cada 5 segundos
  useEffect(() => {
    if (publicidades.length > 1 && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % publicidades.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [publicidades.length, isPaused]);

  // Parsear el campo tiempo correctamente
  const parseTiempoDias = (tiempo) => {
    if (!tiempo) return 7;
    if (typeof tiempo === 'number') return tiempo;
    if (typeof tiempo === 'string') {
      const parts = tiempo.split(/[:.]/);
      if (parts.length >= 1) {
        const dias = parseInt(parts[0], 10);
        if (!isNaN(dias) && dias > 0) return dias;
      }
    }
    return 7;
  };

  const loadPublicidades = async () => {
    try {
      setIsLoading(true);
      const response = await getAllPublicidades();
      
      const activas = (response || []).filter(pub => {
        try {
          if (pub.estado !== true) return false;
          if (pub.pago !== true) return false;
          
          const imagenBase64 = pub.imagen || pub.Imagen || pub.foto || pub.Foto;
          if (!imagenBase64 || imagenBase64.length === 0) return false;

          const fechaCreacion = new Date(pub.fechaCreacion || pub.FechaCreacion);
          const dias = parseTiempoDias(pub.tiempo || pub.Tiempo);
          const fechaExpiracion = new Date(fechaCreacion.getTime() + dias * 24 * 60 * 60 * 1000);
          
          return fechaExpiracion > new Date();
        } catch {
          return false;
        }
      });

      setPublicidades(activas);
    } catch (err) {
      setPublicidades([]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrev = () => {
    setCurrentIndex(prev => prev === 0 ? publicidades.length - 1 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % publicidades.length);
  };

  const handleVerEnMapa = (publicidad) => {
    setSelectedPublicidad(null);
    if (onVerEnMapa && publicidad.iD_Comercio) {
      onVerEnMapa(publicidad);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-white/20 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-white/20 rounded w-1/3"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // No hay publicidades
  if (publicidades.length === 0) {
    return null;
  }

  const current = publicidades[currentIndex];
  const imagenBase64 = current?.imagen || current?.Imagen || current?.foto || current?.Foto;
  const imageUrl = imagenBase64 ? convertBase64ToImage(imagenBase64) : null;
  const nombreComercio = current?.comercio?.nombre || current?.nombreComercio || 'Comercio';

  return (
    <>
      {/* Carrusel Principal */}
      <div 
        className="relative bg-gradient-to-r from-purple-900 via-pink-800 to-purple-900 rounded-2xl overflow-hidden shadow-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Badge de publicidad */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
            <Megaphone className="w-3 h-3" />
            PROMOCIONES
          </span>
          {publicidades.length > 1 && (
            <span className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white/80">
              {currentIndex + 1} / {publicidades.length}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row">
          {/* Imagen */}
          <div 
            className="relative w-full sm:w-2/5 h-48 sm:h-56 cursor-pointer group"
            onClick={() => setSelectedPublicidad(current)}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={nombreComercio}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-purple-800 flex items-center justify-center">
                <Megaphone className="w-16 h-16 text-white/30" />
              </div>
            )}
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium">
                Ver promoción
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {nombreComercio}
            </h3>
            
            <p className="text-white/80 text-sm sm:text-base mb-4 line-clamp-2">
              {current?.descripcion || 'Promoción especial disponible'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-xs sm:text-sm mb-4">
              {current?.comercio?.direccion && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{current.comercio.direccion}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{current?.visualizaciones || 0} vistas</span>
              </div>
            </div>

            <button
              onClick={() => handleVerEnMapa(current)}
              className="self-start bg-white text-purple-900 px-6 py-2 rounded-full font-semibold text-sm hover:bg-purple-100 transition-colors shadow-lg"
            >
              Ver publicidad
            </button>
          </div>
        </div>

        {/* Controles de navegación */}
        {publicidades.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Indicadores de progreso */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {publicidades.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Barra de progreso animada */}
        {publicidades.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 animate-progress"
              style={{ animationDuration: '5s' }}
            />
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {selectedPublicidad && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPublicidad(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Imagen grande */}
            <div className="relative h-64 sm:h-80">
              {convertBase64ToImage(selectedPublicidad.imagen || selectedPublicidad.Imagen) ? (
                <img
                  src={convertBase64ToImage(selectedPublicidad.imagen || selectedPublicidad.Imagen)}
                  alt={selectedPublicidad.comercio?.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Megaphone className="w-20 h-20 text-white/50" />
                </div>
              )}
              
              {/* Botón cerrar */}
              <button
                onClick={() => setSelectedPublicidad(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg">
                  🎉 PROMOCIÓN ESPECIAL
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedPublicidad.comercio?.nombre || 'Comercio'}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {selectedPublicidad.descripcion || 'Promoción especial disponible en este comercio.'}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                {selectedPublicidad.comercio?.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{selectedPublicidad.comercio.direccion}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span>{selectedPublicidad.visualizaciones || 0} personas vieron esta promo</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleVerEnMapa(selectedPublicidad)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  Ver Publicidad
                </button>
                <button
                  onClick={() => setSelectedPublicidad(null)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para la animación de progreso */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </>
  );
};

export default PublicidadesCarousel;
