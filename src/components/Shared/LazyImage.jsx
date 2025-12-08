// LazyImage.jsx - Componente para carga diferida de imágenes
import { useState, useEffect, useRef } from 'react';
import { ImageOff } from 'lucide-react';

// Componente que carga imágenes de forma diferida (lazy loading)
const LazyImage = ({ 
  src,
  loadImage,
  alt = 'Imagen',
  className = '',
  imageClassName = '',
  placeholder = null,
  errorComponent = null,
  eager = false,
  onClick = null,
}) => {
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(eager);
  const containerRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (eager || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Cargar 100px antes de que sea visible
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [eager]);

  // Cargar imagen cuando sea visible
  useEffect(() => {
    if (!isVisible) return;

    const fetchImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        let imageSrc = null;

        // Si hay función loadImage, usarla
        if (loadImage && typeof loadImage === 'function') {
          imageSrc = await loadImage();
        } else if (src) {
          imageSrc = src;
        }

        if (imageSrc) {
          setImageData(imageSrc);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [isVisible, src, loadImage]);

  // Skeleton de carga
  const renderSkeleton = () => {
    if (placeholder) return placeholder;

    return (
      <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-bounce" />
      </div>
    );
  };

  // Componente de error
  const renderError = () => {
    if (errorComponent) return errorComponent;

    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
        <ImageOff className="w-8 h-8 mb-1" />
        <span className="text-xs">Sin imagen</span>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Loading state */}
      {isLoading && !hasError && renderSkeleton()}

      {/* Error state */}
      {hasError && !isLoading && renderError()}

      {/* Imagen cargada */}
      {imageData && !isLoading && !hasError && (
        <img
          src={imageData}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageClassName}`}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;