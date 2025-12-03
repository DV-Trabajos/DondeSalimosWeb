// PublicidadViewerModal.jsx - Modal para visualizar publicidades estilo Instagram Stories
import { useEffect, useState } from 'react';
import { X, MapPin, Eye } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { incrementarVisualizacion } from '../../services/publicidadesService';

const PublicidadViewerModal = ({ isOpen, publicidad, onClose, onViewOnMap }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Duración de la historia (5 segundos)
  const STORY_DURATION = 5000;

  useEffect(() => {
    if (!isOpen || !publicidad) return;

    // Incrementar visualización cuando se abre
    if (publicidad.iD_Publicidad) {
      incrementarVisualizacion(publicidad.iD_Publicidad)
        .then(() => {
          console.log('Visualización incrementada');
        })
        .catch(err => {
          console.error('Error incrementando visualización:', err);
        });
    }

    // Reiniciar progreso
    setProgress(0);
    setIsPaused(false);

    // Timer para barra de progreso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onClose(); // Auto-cerrar al terminar
          return 100;
        }
        if (isPaused) return prev;
        return prev + (100 / (STORY_DURATION / 50)); // Actualizar cada 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, publicidad, isPaused, onClose]);

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !publicidad) return null;

  const imageUrl = convertBase64ToImage(publicidad.imagen || publicidad.foto);
  const nombreComercio = publicidad.comercio?.nombre || publicidad.comercio || 'Comercio';

  const handleViewOnMap = () => {
    onClose();
    if (onViewOnMap) {
      onViewOnMap(publicidad);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onClose}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contenedor de la historia */}
      <div 
        className="relative w-full h-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de progreso */}
        <div className="absolute top-0 left-0 right-0 z-10 p-2">
          <div className="h-1 bg-gray-600 bg-opacity-50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar del comercio */}
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-800">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={nombreComercio}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Nombre y tiempo */}
            <div>
              <p className="text-white font-semibold text-sm drop-shadow-lg">
                {nombreComercio}
              </p>
              <p className="text-white text-xs opacity-80 drop-shadow-lg">
                Ahora
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Imagen de la publicidad */}
        <div className="flex-1 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={publicidad.descripcion || nombreComercio}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="text-white text-center">
              <p>Sin imagen</p>
            </div>
          )}
        </div>

        {/* Descripción (si existe) */}
        {publicidad.descripcion && (
          <div className="absolute bottom-24 left-0 right-0 px-6">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm leading-relaxed">
                {publicidad.descripcion}
              </p>
            </div>
          </div>
        )}

        {/* Botón "Ver en el mapa" */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleViewOnMap}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <MapPin className="w-5 h-5" />
            <span>Ver comercio</span>
          </button>
        </div>

        {/* Indicador de visualizaciones (opcional) */}
        {publicidad.visualizaciones !== undefined && (
          <div className="absolute top-16 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-semibold">
              {publicidad.visualizaciones}
            </span>
          </div>
        )}
      </div>

      {/* Controles de navegación (tap izquierda/derecha para futuro) */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="flex-1" onClick={(e) => { e.stopPropagation(); /* Anterior */ }} />
        <div className="flex-1" onClick={(e) => { e.stopPropagation(); /* Siguiente */ }} />
      </div>
    </div>
  );
};

export default PublicidadViewerModal;