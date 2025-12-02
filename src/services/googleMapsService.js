// googleMapsService.js - Búsquedas múltiples + más resultados
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Solo excluir lugares no relacionados
const EXCLUDED_KEYWORDS = [
  'hotel', 'hostel', 'motel', 'resort', 'hospedaje', 'alojamiento',
  'hospital', 'clinica', 'clínica', 'farmacia',
  'supermercado', 'carniceria', 'verduleria',
  'estacion de servicio', 'gas station',
  'gimnasio', 'gym', 'fitness'
];

// Solo tipos no deseados
const EXCLUDED_TYPES = [
  'lodging', 'hotel', 'motel',
  'hospital', 'health', 'doctor', 'pharmacy',
  'gas_station',
  'grocery_or_supermarket', 'supermarket'
];

// Verifica si un lugar debe ser excluido
const shouldExcludePlace = (place) => {
  const name = (place.name || '').toLowerCase();
  const types = place.types || [];
  
  // Excluir por nombre solo si es claramente otro tipo de negocio
  for (const keyword of EXCLUDED_KEYWORDS) {
    if (name.includes(keyword)) {
      return true;
    }
  }
  
  // Excluir por tipo solo si es claramente otro tipo de negocio
  for (const type of EXCLUDED_TYPES) {
    if (types.includes(type)) {
      return true;
    }
  }
  
  return false;
};

// Hace una búsqueda individual
const singleSearch = async (lat, lng, radius, type, keyword = '') => {
  try {
    let url = `${API_BASE_URL}/api/GooglePlaces/nearby?lat=${lat}&lng=${lng}&type=${type}&radius=${radius}`;
    
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK') {
      return data.results || [];
    }
    
    return [];
  } catch (error) {
    console.warn(`⚠️ Error buscando ${type}:`, error.message);
    return [];
  }
};

// Busca lugares cercanos con MÚLTIPLES búsquedas
export const nearbySearch = async (
  lat,
  lng,
  radius = 15000,
  type = 'bar',
  keyword = ''
) => {
  try {
    // HACER MÚLTIPLES BÚSQUEDAS en paralelo
    const searches = [
      // Búsqueda principal por tipo "bar"
      singleSearch(lat, lng, radius, 'bar', ''),
      // Búsqueda por tipo "night_club"
      singleSearch(lat, lng, radius, 'night_club', ''),
      // Búsqueda por keyword "cervecería"
      singleSearch(lat, lng, radius, 'bar', 'cerveceria'),
      // Búsqueda por keyword "pub"
      singleSearch(lat, lng, radius, 'bar', 'pub'),
    ];
    
    // Ejecutar todas las búsquedas en paralelo
    const results = await Promise.all(searches);
    
    // Combinar todos los resultados
    const allPlaces = results.flat();
    
    // ELIMINAR DUPLICADOS por place_id
    const uniquePlaces = [];
    const seenIds = new Set();
    
    for (const place of allPlaces) {
      if (place.place_id && !seenIds.has(place.place_id)) {
        seenIds.add(place.place_id);
        uniquePlaces.push(place);
      }
    }
    
    // FILTRAR lugares no deseados
    const filteredResults = uniquePlaces.filter(place => !shouldExcludePlace(place));
    
    return filteredResults;
    
  } catch (error) {
    return [];
  }
};

// Obtiene detalles de un lugar por place_id
export const getPlaceDetails = async (placeId) => {
  try {
    const url = `${API_BASE_URL}/api/GooglePlaces/details/${placeId}`;
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK') {
      return data.result;
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Obtiene URL de foto de Google Place
export const getPhotoUrl = (photoReference, maxWidth = 400) => {
  if (!photoReference) return null;
  return `${API_BASE_URL}/api/GooglePlaces/photo?photoReference=${photoReference}&maxWidth=${maxWidth}`;
};

// Determina el tipo de comercio de forma más inteligente
const determinarTipoComercio = (googlePlace) => {
  const types = googlePlace.types || [];
  const name = (googlePlace.name || '').toLowerCase();
  
  // Prioridad 1: Si es night_club -> Boliche (2)
  if (types.includes('night_club')) {
    return 2;
  }
  
  // Prioridad 2: Si el nombre sugiere boliche/disco
  if (name.includes('disco') || name.includes('club') || name.includes('boliche')) {
    return 2;
  }
  
  // Default: Bar (1)
  return 1;
};

// Normaliza un lugar de Google Places al formato de comercio local
export const normalizeGooglePlace = (googlePlace) => {
  const lat = googlePlace.geometry?.location?.lat;
  const lng = googlePlace.geometry?.location?.lng;
  
  if (!lat || !lng) {
    console.warn(`Lugar sin coordenadas: ${googlePlace.name}`);
  }
  
  const types = googlePlace.types || [];
  
  return {
    // IDs y metadata
    iD_Comercio: null,
    place_id: googlePlace.place_id,
    source: 'google',
    isLocal: false,
    
    // Información básica
    nombre: googlePlace.name,
    direccion: googlePlace.vicinity || googlePlace.formatted_address,
    
    // Coordenadas
    latitud: lat,
    longitud: lng,
    
    // Clasificación
    rating: googlePlace.rating,
    calificacionPromedio: googlePlace.rating,
    user_ratings_total: googlePlace.user_ratings_total,
    
    // Tipo
    types: types,
    iD_TipoComercio: determinarTipoComercio(googlePlace),
    
    // Horarios
    opening_hours: googlePlace.opening_hours,
    isOpen: googlePlace.opening_hours?.open_now,
    
    // Fotos - NO cargar de Google (dan error 404)
    photos: googlePlace.photos,
    foto: null, // No intentar cargar fotos de Google
    
    // Estado
    estado: true,
    
    // Campos adicionales (null para lugares de Google)
    telefono: null,
    correo: null,
    descripcion: null,
    generoMusical: null,
    capacidad: null,
    mesas: null,
  };
};

export default {
  nearbySearch,
  getPlaceDetails,
  getPhotoUrl,
  normalizeGooglePlace,
};