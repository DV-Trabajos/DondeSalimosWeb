// comerciosService.js - Servicio completo de comercios con carga optimizada
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import api from './api';

// CRUD BÁSICO
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

// ENDPOINTS OPTIMIZADOS
// Obtiene todos los comercios SIN fotos (carga rápida)
export const getAllComerciosAdmin = async () => {
  try {
    const response = await api.get('/api/Comercios/listadoAdmin');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtiene solo la foto de un comercio específico
export const getComercioImagen = async (id) => {
  try {
    const response = await api.get(`/api/Comercios/${id}/imagen`);
    
    if (response.data && response.data.foto) {
      // Convertir a formato data URL si no lo tiene
      const foto = response.data.foto;
      if (typeof foto === 'string' && !foto.startsWith('data:')) {
        return `data:image/jpeg;base64,${foto}`;
      }
      return foto;
    }
    return null;
  } catch (error) {
    console.error(`Error cargando imagen de comercio ${id}:`, error);
    return null;
  }
};

// Obtiene la URL directa de la imagen
export const getComercioImagenUrl = (id) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://dondesalimos-api.azurewebsites.net';
  return `${baseUrl}/api/Comercios/${id}/imagen-raw`;
};

// Pre-carga un lote de imágenes de comercios en paralelo
export const preloadComercioImagenes = async (ids, batchSize = 5) => {
  const imagenesMap = new Map();
  
  // Procesar en lotes para no sobrecargar
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const imagen = await getComercioImagen(id);
        return { id, imagen };
      })
    );
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.imagen) {
        imagenesMap.set(result.value.id, result.value.imagen);
      }
    });
  }
  
  return imagenesMap;
};

// FILTROS
// Filtra comercios aprobados
export const filterApprovedComercios = (comercios) => {
  return comercios.filter(comercio => comercio.estado === true);
};

// Filtra comercios por tipo
export const filterComerciosByType = (comercios, tipoId) => {
  if (!tipoId) return comercios;
  return comercios.filter(comercio => 
    comercio.iD_TipoComercio === tipoId || comercio.ID_TipoComercio === tipoId
  );
};

// Filtra comercios pendientes de aprobación
export const filterComerciosPendientes = (comercios) => {
  return comercios.filter(comercio => !comercio.estado && !comercio.motivoRechazo);
};

// Filtra comercios rechazados
export const filterComerciosRechazados = (comercios) => {
  return comercios.filter(comercio => !comercio.estado && comercio.motivoRechazo);
};

// UTILIDADES DE GEOLOCALIZACIÓN
// Calcula la distancia entre dos puntos (fórmula Haversine)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

// Ordena comercios por distancia desde una ubicación
export const sortComerciosByDistance = (comercios, userLat, userLng) => {
  return [...comercios]
    .map(comercio => ({
      ...comercio,
      distance: calculateDistance(
        userLat,
        userLng,
        comercio.latitud || comercio.Latitud,
        comercio.longitud || comercio.Longitud
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Geocodifica una dirección usando Google Geocoding API
export const geocodeAddress = async (direccion) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const encodedAddress = encodeURIComponent(direccion);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: data.results[0].formatted_address,
      };
    } else if (data.status === 'ZERO_RESULTS') {
      throw new Error('No se encontró la dirección. Verifica que esté escrita correctamente.');
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

// ESTADÍSTICAS
// Obtiene estadísticas de comercios
export const getComerciosStats = (comercios) => {
  const aprobados = comercios.filter(c => c.estado === true);
  const pendientes = comercios.filter(c => !c.estado && !c.motivoRechazo);
  const rechazados = comercios.filter(c => !c.estado && c.motivoRechazo);
  
  return {
    total: comercios.length,
    aprobados: aprobados.length,
    pendientes: pendientes.length,
    rechazados: rechazados.length,
  };
};

// EXPORT DEFAULT
export default {
  // CRUD básico
  getAllComercios,
  getComercioById,
  searchComerciosByName,
  getComerciosByUsuario,
  createComercio,
  updateComercio,
  deleteComercio,
  
  // Optimizados (carga rápida)
  getAllComerciosAdmin,
  getComercioImagen,
  getComercioImagenUrl,
  preloadComercioImagenes,
  
  // Filtros
  filterApprovedComercios,
  filterComerciosByType,
  filterComerciosPendientes,
  filterComerciosRechazados,
  
  // Geolocalización
  calculateDistance,
  sortComerciosByDistance,
  geocodeAddress,
  validateCoordinates,
  
  // Estadísticas
  getComerciosStats,
};