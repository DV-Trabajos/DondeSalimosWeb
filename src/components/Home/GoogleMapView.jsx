// GoogleMapView.jsx - Mapa de Google con marcadores
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../utils/constants';
import { getAllTiposComercio } from '../../services/tiposComercioService';
import { MapPin, Navigation, Loader, MapPinOff, RefreshCw, AlertTriangle } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

// Centro por defecto (Obelisco, CABA)
const defaultCenter = {
  lat: -34.6037,
  lng: -58.3816,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  zoomControlOptions: {
    position: typeof window !== 'undefined' && window.google?.maps?.ControlPosition?.LEFT_BOTTOM,
  },
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  fullscreenControlOptions: {
    position: typeof window !== 'undefined' && window.google?.maps?.ControlPosition?.TOP_LEFT,
  },
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Obtener emoji según tipo de comercio
const getEmojiForTipo = (tipoId, tipoDescripcion) => {
  if (tipoDescripcion) {
    const desc = tipoDescripcion.toLowerCase();
    if (desc.includes('bar')) return '🍺';
    if (desc.includes('boliche') || desc.includes('disco')) return '🪩';
    if (desc.includes('restaurant')) return '🍽️';
    if (desc.includes('cafe') || desc.includes('café')) return '☕';
    if (desc.includes('pub')) return '🍻';
  }
  
  switch (tipoId) {
    case 1: return '🍺';
    case 2: return '🪩';
    case 3: return '🍽️';
    case 4: return '☕';
    case 5: return '🍻';
    default: return '📍';
  }
};

const GoogleMapView = ({
  places = [],
  userLocation = null,
  selectedPlace = null,
  onPlaceClick,
  onMapClick,
  onStoryPress,
  // Props para feedback de ubicación
  locationLoading = false,
  locationError = null,
  locationPermissionDenied = false,
  onRequestLocation = null,
}) => {
  const [map, setMap] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [tiposComercioActivos, setTiposComercioActivos] = useState([]);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Verificar si la ubicación es REAL (no manual/por defecto)
  const isRealLocation = userLocation && 
                         userLocation.latitude && 
                         userLocation.longitude && 
                         !userLocation.manual;

  // Cargar tipos de comercio activos desde la API
  useEffect(() => {
    const loadTiposComercio = async () => {
      try {
        const tipos = await getAllTiposComercio();
        const activos = tipos
          .filter(tipo => tipo.estado === true || tipo.Estado === true)
          .map(tipo => ({
            id: tipo.iD_TipoComercio || tipo.ID_TipoComercio,
            nombre: tipo.descripcion || tipo.Descripcion,
            emoji: getEmojiForTipo(tipo.iD_TipoComercio || tipo.ID_TipoComercio, tipo.descripcion || tipo.Descripcion),
          }));
        setTiposComercioActivos(activos);
      } catch (error) {
        setTiposComercioActivos([
          { id: 1, nombre: 'Bar', emoji: '🍺' },
          { id: 2, nombre: 'Boliche', emoji: '🪩' },
        ]);
      }
    };
    loadTiposComercio();
  }, []);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  // Centrar en ubicación del usuario con zoom apropiado
  useEffect(() => {
    if (!map || hasInitialized) return;

    // Prioridad 1: Si hay ubicación REAL del usuario, centrar ahí
    if (isRealLocation) {
      map.setCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(15);
      setHasInitialized(true);
      return;
    }

    // Prioridad 2: Si hay lugares, usar el primero como referencia
    if (places.length > 0) {
      const firstPlace = places.find(p => p.latitud && p.longitud && p.latitud !== 0);
      if (firstPlace) {
        map.setCenter({
          lat: firstPlace.latitud,
          lng: firstPlace.longitud,
        });
        map.setZoom(14);
        setHasInitialized(true);
        return;
      }
    }

    // Prioridad 3: Usar centro por defecto (Obelisco)
    map.setCenter(defaultCenter);
    map.setZoom(13);
    setHasInitialized(true);
  }, [map, userLocation, places, hasInitialized, isRealLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
    setHasInitialized(false);
  }, []);

  // Centrar en la ubicación del usuario (solo si es real)
  const centerOnUser = useCallback(() => {
    if (map && isRealLocation) {
      map.panTo({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(15);
    }
  }, [map, userLocation, isRealLocation]);

  // Crear marcador simple y limpio
  const createEmojiMarker = (emoji, isSelected, isHovered, isLocal) => {
    const size = isSelected ? 52 : isHovered ? 48 : 44;
    const borderColor = isLocal ? '#9333EA' : '#10B981';
    const borderWidth = isSelected ? 4 : 3;
    const shadowOpacity = isSelected ? 0.4 : 0.2;
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2 + 2}" r="${size/2 - 4}" fill="rgba(0,0,0,${shadowOpacity})"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="white" stroke="${borderColor}" stroke-width="${borderWidth}"/>
        <text x="${size/2}" y="${size/2 + 1}" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
      </svg>
    `;
    
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size/2, size/2),
    };
  };

  // Obtener icono del marcador
  const getMarkerIcon = (place, isSelected, isHovered) => {
    if (!window.google) return null;

    const isLocal = place.isLocal || place.iD_Comercio;
    
    if (isLocal) {
      const tipoId = place.iD_TipoComercio || place.comercioData?.iD_TipoComercio;
      const tipoDesc = place.tipoComercio?.descripcion || place.comercioData?.tipoComercio?.descripcion;
      const emoji = getEmojiForTipo(tipoId, tipoDesc);
      return createEmojiMarker(emoji, isSelected, isHovered, true);
    }
    
    // Google Places
    const types = place.types || [];
    let emoji = '📍';
    
    if (types.includes('night_club')) emoji = '🪩';
    else if (types.includes('bar')) emoji = '🍺';
    else if (types.includes('restaurant')) emoji = '🍽️';
    else if (types.includes('cafe')) emoji = '☕';
    
    return createEmojiMarker(emoji, isSelected, isHovered, false);
  };

  // Renderizar indicador de estado de ubicación
  const renderLocationStatus = () => {
    // Si tiene ubicación REAL, no mostrar nada (el marcador azul ya está visible)
    if (isRealLocation) {
      return null;
    }

    // Permiso denegado
    if (locationPermissionDenied) {
      return (
        <div className="absolute top-4 left-4 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm z-10 max-w-xs shadow-lg">
          <div className="flex items-start gap-3">
            <MapPinOff className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Ubicación denegada</p>
              <p className="text-red-600 text-xs mt-1">
                Para ver tu ubicación real, permití el acceso en tu navegador.
              </p>
              {onRequestLocation && (
                <button
                  onClick={onRequestLocation}
                  className="mt-2 flex items-center gap-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md transition font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Error de ubicación (pero no permiso denegado)
    if (locationError && !locationPermissionDenied) {
      return (
        <div className="absolute top-4 left-4 bg-orange-50 border border-orange-200 px-4 py-3 rounded-lg text-sm z-10 max-w-xs shadow-lg">
          <div className="flex items-start gap-3">
            <MapPinOff className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-orange-800 font-medium">Error de ubicación</p>
              <p className="text-orange-600 text-xs mt-1">{locationError}</p>
              {onRequestLocation && (
                <button
                  onClick={onRequestLocation}
                  className="mt-2 flex items-center gap-1.5 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-md transition font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Cargando ubicación
    if (locationLoading) {
      return (
        <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm z-10 flex items-center gap-3 shadow-lg">
          <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          <div>
            <p className="text-blue-800 font-medium">Obteniendo ubicación...</p>
            <p className="text-blue-600 text-xs">Esto puede tardar hasta 30 segundos</p>
          </div>
        </div>
      );
    }

    // Ubicación manual/por defecto (el marcador azul NO se muestra)
    if (userLocation && userLocation.manual) {
      return (
        <div className="absolute top-4 left-4 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg text-sm z-10 max-w-xs shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">Ubicación aproximada</p>
              <p className="text-amber-600 text-xs mt-1">
                No pudimos obtener tu ubicación. Mostrando zona de CABA.
              </p>
              {onRequestLocation && (
                <button
                  onClick={onRequestLocation}
                  className="mt-2 flex items-center gap-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-md transition font-medium"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Activar mi ubicación
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Sin ubicación y sin estado específico (esperando)
    return null;
  };

  if (loadError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center text-red-600">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Error al cargar el mapa</p>
          <p className="text-sm text-gray-600 mt-1">
            Revisa tu conexión a internet
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        defaultCenter={defaultCenter}
        defaultZoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        onClick={onMapClick}
      >
        {/* Marcador de ubicación del usuario - SOLO si es ubicación REAL */}
        {isRealLocation && (
          <Marker
            position={{
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 3,
              scale: 10,
            }}
            title="Tu ubicación"
            zIndex={1000}
          />
        )}

        {/* Marcadores de lugares */}
        {places.map((place, index) => {
          const lat = place.latitud;
          const lng = place.longitud;
          
          if (!lat || !lng || lat === 0 || lng === 0 || isNaN(lat) || isNaN(lng)) {
            return null;
          }

          const isSelected = selectedPlace?.iD_Comercio === place.iD_Comercio 
            || selectedPlace?.place_id === place.place_id;
          const isHovered = hoveredPlace?.iD_Comercio === place.iD_Comercio
            || hoveredPlace?.place_id === place.place_id;
          const markerKey = place.iD_Comercio 
            ? `local-${place.iD_Comercio}` 
            : `google-${place.place_id || index}`;

          return (
            <Marker
              key={markerKey}
              position={{ lat, lng }}
              icon={getMarkerIcon(place, isSelected, isHovered)}
              title={place.nombre}
              onClick={() => onPlaceClick && onPlaceClick(place)}
              onMouseOver={() => setHoveredPlace(place)}
              onMouseOut={() => setHoveredPlace(null)}
              zIndex={isSelected ? 100 : isHovered ? 50 : 1}
            />
          );
        })}
      </GoogleMap>

      {/* Botón para centrar en ubicación - SOLO si es ubicación REAL */}
      {isRealLocation && (
        <button
          onClick={centerOnUser}
          className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition z-50 group"
          title="Ir a mi ubicación"
        >
          <Navigation className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
        </button>
      )}

      {/* Leyendas */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg text-sm z-10">
        {/* Tu ubicación - mostrar estado */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
          <div className={`w-5 h-5 rounded-full ring-3 ${
            isRealLocation
              ? 'bg-blue-500 ring-blue-200' 
              : 'bg-gray-300 ring-gray-200'
          }`}></div>
          <span className={`font-medium ${
            isRealLocation
              ? 'text-gray-700' 
              : 'text-gray-400'
          }`}>
            Tu ubicación {!isRealLocation && '(no detectada)'}
          </span>
        </div>
        
        {/* Tipos de comercio activos */}
        {tiposComercioActivos.length > 0 && (
          <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
            {tiposComercioActivos.map((tipo) => (
              <div key={tipo.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border-[3px] border-purple-600 flex items-center justify-center text-base shadow-sm">
                  {tipo.emoji}
                </div>
                <span className="text-gray-600">{tipo.nombre}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Diferenciación Locales vs Google */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-[3px] border-purple-600 bg-white"></div>
            <span className="text-xs text-gray-500">Locales ({places.filter(p => p.isLocal).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-[3px] border-green-500 bg-white"></div>
            <span className="text-xs text-gray-500">Google ({places.filter(p => !p.isLocal).length})</span>
          </div>
        </div>
      </div>

      {/* Indicador de estado de ubicación */}
      {renderLocationStatus()}
    </div>
  );
};

export default GoogleMapView;