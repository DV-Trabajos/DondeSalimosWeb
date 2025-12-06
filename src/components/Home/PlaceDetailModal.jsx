// PlaceDetailModal.jsx - Modal para detalle de los comercios en el mapa
import { useState, useEffect, useRef } from 'react';
import { 
  X, Star, MapPin, Phone, Mail, Users, Music, Calendar, Share2, Clock, ExternalLink
} from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';
import { getReseniasByComercio } from '../../services/reseniasService';
import { useAuth } from '../../hooks/useAuth';

const PlaceDetailModal = ({
  place,
  isOpen,
  onClose,
  onOpenReserva,
  onOpenReview,
}) => {
  // Obtener información del usuario para verificar si es admin o dueño de comercio
  const { isAdmin, isBarOwner } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Prevenir llamadas múltiples
  const loadedComercioRef = useRef(null);

  useEffect(() => {
    if (isOpen && place?.iD_Comercio) {
      if (loadedComercioRef.current !== place.iD_Comercio) {
        loadedComercioRef.current = place.iD_Comercio;
        loadReviews();
      }
    } else {
      loadedComercioRef.current = null;
      setReviews([]);
      setAverageRating(0);
      setShowAllReviews(false);
    }
  }, [isOpen, place?.iD_Comercio]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const data = await getReseniasByComercio(place.iD_Comercio);
      setReviews(data);
      
      if (data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.calificacion, 0) / data.length;
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      setReviews([]);
      setAverageRating(0);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReservation = () => {
    onOpenReserva && onOpenReserva(place);
  };

  const handleReview = () => {
    onOpenReview && onOpenReview(place);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: place.nombre,
          text: `Mirá este lugar: ${place.nombre}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.log('No se pudo compartir');
    }
  };

  const handleOpenMaps = () => {
    const lat = place.latitud;
    const lng = place.longitud;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (!isOpen || !place) return null;

  // Manejo de imágenes
  const getImageUrl = () => {
    if (place.isLocal && place.foto && !place.foto.startsWith('http')) {
      return convertBase64ToImage(place.foto);
    }
    if (!place.isLocal && place.foto && place.foto.startsWith('http')) {
      return place.foto;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con imagen */}
        <div className="relative h-64 flex-shrink-0 bg-gradient-to-br from-pink-500 to-purple-600">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={place.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-10 h-10" />
                </div>
                <p className="text-lg font-medium opacity-80">Sin imagen disponible</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Botón compartir */}
          <button
            onClick={handleShare}
            className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>

          {/* Badge de tipo */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              place.isLocal 
                ? 'bg-pink-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {place.isLocal ? '⭐ Local registrado' : '📍 Google Maps'}
            </span>
          </div>

          {/* Info en el header */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-1">{place.nombre}</h2>
            <div className="flex items-center gap-3">
              {averageRating > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium text-sm">{averageRating.toFixed(1)}</span>
                  <span className="text-white/70 text-xs">({reviews.length})</span>
                </div>
              )}
              {place.isOpen !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  place.isOpen 
                    ? 'bg-green-500/80 text-white' 
                    : 'bg-red-500/80 text-white'
                }`}>
                  {place.isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Dirección con botón de mapa */}
          {place.direccion && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-gray-900 font-medium">{place.direccion}</p>
              </div>
              <button
                onClick={handleOpenMaps}
                className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                title="Abrir en Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Grid de información */}
          <div className="grid grid-cols-2 gap-3">
            {place.telefono && (
              <a 
                href={`tel:${place.telefono}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <Phone className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-medium text-purple-600">{place.telefono}</p>
                </div>
              </a>
            )}

            {place.capacidad && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Capacidad</p>
                  <p className="text-sm font-medium text-gray-900">{place.capacidad} personas</p>
                </div>
              </div>
            )}

            {place.horaApertura && place.horaCierre && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Horario</p>
                  <p className="text-sm font-medium text-gray-900">
                    {place.horaApertura.slice(0, 5)} - {place.horaCierre.slice(0, 5)}
                  </p>
                </div>
              </div>
            )}

            {place.tipoMusica && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl col-span-2">
                <Music className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Música</p>
                  <p className="text-sm font-medium text-gray-900">{place.tipoMusica}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reseñas */}
          {place.isLocal && reviews.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Reseñas ({reviews.length})
              </h3>
              
              {isLoadingReviews ? (
                <div className="text-center py-4 text-gray-500">Cargando reseñas...</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {displayedReviews.map((review, index) => (
                      <div 
                        key={review.iD_Resenia || index} 
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {review.usuario?.nombreUsuario?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {review.usuario?.nombreUsuario || 'Usuario'}
                              </p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: review.calificacion }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.fecha).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.comentario}</p>
                      </div>
                    ))}
                  </div>
                  
                  {reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full mt-3 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                    >
                      {showAllReviews ? 'Ver menos' : `Ver todas las reseñas (${reviews.length})`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Info para lugares de Google */}
          {!place.isLocal && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Este es un lugar de Google Maps. Las reservas y reseñas solo están disponibles para comercios registrados en nuestra plataforma.
              </p>
            </div>
          )}
        </div>

        {/* Footer con botones - Solo para comercios locales y usuarios */}
        {place.isLocal && !isAdmin && !isBarOwner && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={handleReservation}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:opacity-90 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition"
              >
                <Calendar className="w-5 h-5" />
                HACER RESERVA
              </button>
              <button
                onClick={handleReview}
                className="flex-1 border-2 border-purple-500 text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 font-semibold flex items-center justify-center gap-2 transition"
              >
                <Star className="w-5 h-5" />
                Reseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailModal;