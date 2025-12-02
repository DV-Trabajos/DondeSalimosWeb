// reseniasService.js - SIMPLIFICADO (api.js maneja 404)
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// RESEÑAS - OPERACIONES CRUD
// Obtiene todas las reseñas del sistem
export const getAllResenias = async () => {
  try {
    const response = await apiGet('/api/resenias/listado');
    return response || [];
  } catch (error) {
    console.error('❌ Error en getAllResenias:', error);
    throw error;
  }
};

// Alias para getAllResenias
export const getResenias = getAllResenias;

// Obtiene reseñas de un comercio específico por ID
export const getReseniasByComercio = async (comercioId) => {
  try {
    
    const response = await apiGet(`/api/Resenias/buscarIdComercio/${comercioId}`);
    
    // Si devolvió null (404), significa que no hay reseñas
    if (response === null) {
      return [];
    }
    
    // Filtrar solo reseñas activas
    const activeReviews = response.filter(r => r.estado === true);
    
    return activeReviews;
  } catch (error) {
    // Solo llega aquí si es error real (500, 401, etc)
    throw error;
  }
};

// Obtiene reseñas de un comercio por nombre
export const getReseniasByNombreComercio = async (nombreComercio) => {
  try {
    const response = await apiGet(`/api/Resenias/buscarNombreComercio/${nombreComercio}`);
    
    if (response === null) {
      return [];
    }
    
    return response.filter(r => r.estado === true);
  } catch (error) {
    throw error;
  }
};

// Obtiene una reseña específica por ID
export const getReseniaById = async (id) => {
  try {
    const response = await apiGet(`/api/Resenias/buscarIdResenia/${id}`);
    return response; // null si no existe
  } catch (error) {
    throw error;
  }
};

// Crea una nueva reseña
export const createResenia = async (reseniaData) => {
  try {    
    const response = await apiPost('/api/Resenias/crear', reseniaData);

    return response;
  } catch (error) {
    throw error;
  }
};

// Actualiza una reseña existente
export const updateResenia = async (id, reseniaData) => {
  try {
    const response = await apiPut(`/api/Resenias/actualizar/${id}`, reseniaData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Elimina una reseña
export const deleteResenia = async (id) => {
  try {
    const response = await apiDelete(`/api/Resenias/eliminar/${id}`);

    return response;
  } catch (error) {
    throw error;
  }
};

// Calcula el rating promedio de un comercio
export const getAverageRating = async (comercioId) => {
  try {
    const resenias = await getReseniasByComercio(comercioId);
    
    if (resenias.length === 0) {
      return 0;
    }
    
    const sum = resenias.reduce((acc, r) => acc + r.calificacion, 0);
    const avg = sum / resenias.length;
    
    return parseFloat(avg.toFixed(1));
  } catch (error) {
    return 0;
  }
};

// Obtiene estadísticas de reseñas de un comercio
export const getReseniaStats = async (comercioId) => {
  try {
    const resenias = await getReseniasByComercio(comercioId);
    
    if (resenias.length === 0) {
      return {
        total: 0,
        promedio: 0,
        porEstrellas: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const porEstrellas = resenias.reduce((acc, r) => {
      acc[r.calificacion] = (acc[r.calificacion] || 0) + 1;
      return acc;
    }, {});
    
    const promedio = await getAverageRating(comercioId);
    
    return {
      total: resenias.length,
      promedio,
      porEstrellas: {
        1: porEstrellas[1] || 0,
        2: porEstrellas[2] || 0,
        3: porEstrellas[3] || 0,
        4: porEstrellas[4] || 0,
        5: porEstrellas[5] || 0,
      }
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getAllResenias,
  getResenias,
  getReseniasByComercio,
  getReseniasByNombreComercio,
  getReseniaById,
  createResenia,
  updateResenia,
  deleteResenia,
  getAverageRating,
  getReseniaStats,
};