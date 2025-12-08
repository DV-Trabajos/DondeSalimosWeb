// src/services/comerciosService.js - Servicio completo de comercios
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// COMERCIOS - CRUD BÁSICO
// Obtiene todos los comercios
export const getAllComercios = async () => {
  try {
    const response = await apiGet('/api/comercios/listado');
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtiene un comercio por ID
export const getComercioById = async (id) => {
  try {
    const response = await apiGet(`/api/comercios/buscarIdComercio/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Busca comercios por nombre
export const searchComerciosByName = async (nombre) => {
  try {
    const response = await apiGet(`/api/comercios/buscarNombreComercio/${nombre}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Obtiene comercios de un usuario específico
export const getComerciosByUsuario = async (userId) => {
  try {
    const response = await apiGet(`/api/comercios/buscarComerciosPorUsuario/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Crea un nuevo comercio
export const createComercio = async (comercio) => {
  try {
    const response = await apiPost('/api/comercios/crear', comercio);
    return response;
  } catch (error) {
    throw error;
  }
};

// Actualiza un comercio existente
export const updateComercio = async (id, comercio) => {
  try {
    const response = await apiPut(`/api/comercios/actualizar/${id}`, comercio);
    return response;
  } catch (error) {
    throw error;
  }
};

// Elimina un comercio
export const deleteComercio = async (id) => {
  try {
    const response = await apiDelete(`/api/comercios/eliminar/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// FILTROS Y UTILIDADES
// Filtra comercios aprobados
export const filterApprovedComercios = (comercios) => {
  return comercios.filter(c => c.estado === true);
};

// FUNCIÓN AUXILIAR: Determina qué emoji se mostraría para un lugar
const getEmojiForPlace = (place) => {
  // COMERCIOS LOCALES
  if (place.isLocal || place.iD_Comercio) {
    const tipoId = place.iD_TipoComercio || place.comercioData?.iD_TipoComercio;
    const tipoDesc = place.tipoComercio?.descripcion || place.comercioData?.tipoComercio?.descripcion;
    
    if (tipoDesc) {
      const desc = tipoDesc.toLowerCase();
      if (desc.includes('bar')) return '🍺';
      if (desc.includes('boliche') || desc.includes('disco')) return '🪩';
      if (desc.includes('restaurant')) return '🍽️';
      if (desc.includes('cafe') || desc.includes('café')) return '☕';
      if (desc.includes('pub')) return '🍻';
    }
    
    switch (tipoId) {
      case 1: return '🍺'; // Bar
      case 2: return '🪩'; // Boliche
      case 3: return '🍽️'; // Restaurante
      case 4: return '☕'; // Café
      case 5: return '🍻'; // Pub
      default: return '📍';
    }
  }
  
  // LUGARES DE GOOGLE
  const types = place.types || [];
  
  // Lógica EXACTA de GoogleMapView.jsx - líneas 122-127
  if (types.includes('bar')) return '🍺';
  else if (types.includes('night_club')) return '🪩';
  else if (types.includes('restaurant')) return '🍽️';
  else if (types.includes('cafe')) return '☕';
  
  return '📍';
};

// FILTRO BASADO EN ÍCONO
export const filterComerciosByType = (comercios, tipoId) => {
  // Si no hay filtro o es 'all', retornar todos
  if (!tipoId || tipoId === 'all') return comercios;
  
  const tipoIdNum = parseInt(tipoId);
  
  // Mapeo de tipo a emoji esperado
  const tipoToEmoji = {
    1: '🍺', // Bar
    2: '🪩', // Boliche
    3: '🍽️', // Restaurante
    4: '☕', // Café
    5: '🍻', // Pub
  };
  
  const expectedEmoji = tipoToEmoji[tipoIdNum];
  
  if (!expectedEmoji) {
    return comercios;
  }
  
  // FILTRAR: Solo incluir lugares cuyo emoji coincida con el esperado
  return comercios.filter(place => {
    const placeEmoji = getEmojiForPlace(place);
    return placeEmoji === expectedEmoji;
  });
};

// Calcula distancia entre dos puntos
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
};

// Ordena comercios por distancia a un punto
export const sortComerciosByDistance = (comercios, userLat, userLng) => {
  if (!userLat || !userLng) return comercios;
  
  return comercios
    .map(comercio => ({
      ...comercio,
      distance: comercio.latitud && comercio.longitud
        ? calculateDistance(userLat, userLng, comercio.latitud, comercio.longitud)
        : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Geocodifica una dirección usando Google Geocoding API
export const geocodeAddress = async (address) => {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!address || !GOOGLE_MAPS_API_KEY) {
    throw new Error('Dirección o API Key faltante');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No se encontraron resultados para esta dirección.');
    } else if (data.status === 'REQUEST_DENIED') {
      throw new Error('Error de API Key. Contacta al administrador.');
    } else {
      throw new Error(`Error al geocodificar: ${data.status}`);
    }
  } catch (error) {
    throw error;
  }
};

// Valida si las coordenadas están dentro de un rango válido
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

// Export default para compatibilidad
export default {
  getAllComercios,
  getComercioById,
  searchComerciosByName,
  getComerciosByUsuario,
  createComercio,
  updateComercio,
  deleteComercio,
  filterApprovedComercios,
  filterComerciosByType,
  calculateDistance,
  sortComerciosByDistance,
  geocodeAddress,
  validateCoordinates,
};