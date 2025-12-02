// BarStories.jsx - Historias de publicidades estilo Instagram
import { useState, useEffect, useCallback } from 'react';
import { getAllPublicidades } from '../../services/publicidadesService';
import { convertBase64ToImage } from '../../utils/formatters';

const BarStories = ({ onStoryPress }) => {
  const [publicidades, setPublicidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedStories, setViewedStories] = useState(new Set());

  useEffect(() => {
    loadPublicidades();
    loadViewedStories();
  }, []);

  // Cargar historias vistas desde localStorage
  const loadViewedStories = () => {
    try {
      const stored = localStorage.getItem('viewed_publicidades');
      if (stored) {
        setViewedStories(new Set(JSON.parse(stored)));
      }
    } catch (err) {
      console.error('Error cargando historias vistas:', err);
    }
  };

  // Guardar historia vista en localStorage
  const markAsViewed = useCallback((publicidadId) => {
    setViewedStories(prev => {
      const newViewed = new Set(prev);
      newViewed.add(publicidadId);
      
      try {
        localStorage.setItem('viewed_publicidades', JSON.stringify(Array.from(newViewed)));
      } catch (err) {
        console.error('Error guardando historia vista:', err);
      }
      
      return newViewed;
    });
  }, []);

  // Parsear el campo tiempo correctamente
  const parseTiempoDias = (tiempo) => {
    if (!tiempo) return 7; // Default 7 días
    
    // Si es un número, devolverlo directamente
    if (typeof tiempo === 'number') return tiempo;
    
    // Si es string en formato TimeSpan "DD:HH:MM:SS" o "DD.HH:MM:SS"
    if (typeof tiempo === 'string') {
      // Formato: "15:00:00:00" o "15.00:00:00" -> días es el primer número
      const parts = tiempo.split(/[:.]/);
      if (parts.length >= 1) {
        const dias = parseInt(parts[0], 10);
        if (!isNaN(dias) && dias > 0) {
          return dias;
        }
      }
    }
    
    return 7; // Default
  };

  const loadPublicidades = async () => {
    try {
      setIsLoading(true);
      const response = await getAllPublicidades();

      // Filtrar publicidades activas y no expiradas
      const activas = (response || []).filter(pub => {
        try {
          // Debe estar aprobada (estado = true)
          if (pub.estado !== true) {
            return false;
          }

          // Debe estar pagada (pago = true)
          if (pub.pago !== true) {
            return false;
          }

          // Debe tener imagen
          const imagenBase64 = pub.imagen || pub.Imagen || pub.foto || pub.Foto;
          if (!imagenBase64 || imagenBase64.length === 0) {
            return false;
          }

          // Verificar que no esté expirada
          const fechaCreacion = new Date(pub.fechaCreacion || pub.FechaCreacion);
          const dias = parseTiempoDias(pub.tiempo || pub.Tiempo);
          const fechaExpiracion = new Date(fechaCreacion.getTime() + dias * 24 * 60 * 60 * 1000);
          const hoy = new Date();

          if (fechaExpiracion <= hoy) {
            return false;
          }

          return true;
        } catch (err) {
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

  const handleStoryPress = (publicidad) => {
    markAsViewed(publicidad.iD_Publicidad);
    if (onStoryPress) {
      onStoryPress(publicidad);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="py-3 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700/50 animate-pulse" />
              <div className="w-12 h-3 bg-gray-700/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No hay publicidades activas
  if (publicidades.length === 0) {
    return null;
  }

  return (
    <div className="py-3 px-4 bg-transparent">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {publicidades.map((publicidad, index) => {
          const imagenBase64 = publicidad.imagen || publicidad.Imagen || publicidad.foto || publicidad.Foto;
          const imageUrl = imagenBase64 
            ? convertBase64ToImage(imagenBase64)
            : null;

          if (!imageUrl) return null;

          const isViewed = viewedStories.has(publicidad.iD_Publicidad);
          const uniqueKey = `pub-${publicidad.iD_Publicidad}-${index}`;
          
          // Nombre del comercio
          const nombreComercio = publicidad.comercio?.nombre 
            || publicidad.nombreComercio
            || publicidad.comercio 
            || 'Comercio';

          return (
            <button
              key={uniqueKey}
              onClick={() => handleStoryPress(publicidad)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group transition-transform hover:scale-105 focus:outline-none"
            >
              {/* Círculo con borde */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                {/* Borde animado si no está visto */}
                {!isViewed ? (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px] animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-gray-900 p-[3px]">
                      <img
                        src={imageUrl}
                        alt={nombreComercio}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full border-2 border-gray-500 p-[3px]">
                    <img
                      src={imageUrl}
                      alt={nombreComercio}
                      className="w-full h-full rounded-full object-cover opacity-70"
                    />
                  </div>
                )}
              </div>
              
              {/* Nombre del comercio */}
              <span className="text-xs text-white/90 font-medium truncate max-w-[70px] sm:max-w-[80px]">
                {nombreComercio}
              </span>
            </button>
          );
        })}
      </div>

      {/* Estilos para ocultar scrollbar y animación */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BarStories;