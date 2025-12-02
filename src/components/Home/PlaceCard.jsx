// PlaceCard.jsx - Tarjeta individual de lugar
import { useState } from 'react';
import { MapPin, Star, Phone, ImageOff } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

const PlaceCard = ({ place, onClick, distance }) => {
  const [imageError, setImageError] = useState(false);

  // Obtener URL de imagen
  const getImageUrl = () => {
    // Si ya hubo error, no intentar cargar
    if (imageError) return null;

    // Comercios locales con foto en base64
    if (place.isLocal && place.foto && !place.foto.startsWith('http')) {
      return convertBase64ToImage(place.foto);
    }

    // Comercios locales con foto URL
    if (place.isLocal && place.foto && place.foto.startsWith('http')) {
      return place.foto;
    }

    // Google Places - NO cargar sus fotos (dan error 404)
    // Directamente mostrar placeholder
    if (!place.isLocal) {
      return null;
    }

    return null;
  };

  const imageUrl = getImageUrl();

  // Formatear distancia
  const formatDistance = (meters) => {
    if (!meters) return null;
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Determinar si está abierto
  const isOpen = place.opening_hours?.open_now ?? place.isOpen;

  return (
    <div
      onClick={() => onClick && onClick(place)}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      {/* Imagen o Placeholder */}
      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={place.nombre || place.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          // Placeholder cuando no hay imagen
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              {place.isLocal ? (
                <MapPin className="w-8 h-8 text-pink-400" />
              ) : (
                <ImageOff className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {place.isLocal ? 'Local registrado' : 'Google Maps'}
            </span>
          </div>
        )}

        {/* Badge de estado */}
        {place.isLocal && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-pink-500 text-white text-xs font-semibold rounded-full shadow-sm">
              ⭐ Local
            </span>
          </div>
        )}

        {/* Badge abierto/cerrado */}
        {isOpen !== undefined && (
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
              isOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {place.nombre || place.name}
        </h3>

        {/* Dirección */}
        <div className="flex items-start gap-2 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-2">
            {place.direccion || place.vicinity || place.formatted_address || 'Dirección no disponible'}
          </span>
        </div>

        {/* Rating y distancia */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-gray-800">
              {place.rating || place.calificacionPromedio || 'N/A'}
            </span>
            {place.user_ratings_total && (
              <span className="text-xs text-gray-400">
                ({place.user_ratings_total})
              </span>
            )}
          </div>
          
          {distance && (
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {formatDistance(distance)}
            </span>
          )}
        </div>

        {/* Teléfono si existe */}
        {place.telefono && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{place.telefono}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
