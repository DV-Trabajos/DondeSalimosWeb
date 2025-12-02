// tiposComercioService.js - Servicio para tipos de comercio
import api from './api';

// OPERACIONES CRUD 
// Obtiene todos los tipos de comercio desde la base de datos
// GET: /api/tiposComercio/listado
export const getAllTiposComercio = async () => {
  try {
    const response = await api.get('/api/tiposComercio/listado');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtiene un tipo de comercio por ID
// GET: /api/tiposComercio/buscarIdTipoComercio/{id}
export const getTipoComercioById = async (id) => {
  try {
    const response = await api.get(`/api/tiposComercio/buscarIdTipoComercio/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Busca tipos de comercio por nombre
// GET: /api/tiposComercio/buscarNombreTipoComercio/{tipoComercio}
export const searchTiposByName = async (nombre) => {
  try {
    const response = await api.get(`/api/tiposComercio/buscarNombreTipoComercio/${nombre}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crea un nuevo tipo de comercio
// POST: /api/tiposComercio/crear
export const createTipoComercio = async (tipoComercio) => {
  try {
    const response = await api.post('/api/tiposComercio/crear', tipoComercio);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualiza un tipo de comercio existente
// PUT: /api/tiposComercio/actualizar/{id}
export const updateTipoComercio = async (id, tipoComercio) => {
  try {
    const response = await api.put(`/api/tiposComercio/actualizar/${id}`, tipoComercio);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Elimina un tipo de comercio
// DELETE: /api/tiposComercio/eliminar/{id}
export const deleteTipoComercio = async (id) => {
  try {
    const response = await api.delete(`/api/tiposComercio/eliminar/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// UTILIDADES Y HELPERS
// Construye un mapa de ID -> Descripción desde la lista de tipos
// Útil para mostrar nombres de tipos en lugar de IDs
export const buildTiposComercioMap = (tiposComercio) => {
  if (!tiposComercio || !Array.isArray(tiposComercio)) {
    return {};
  }
  
  const map = {};
  tiposComercio.forEach(tipo => {
    // Usar las claves correctas del modelo del backend
    const id = tipo.iD_TipoComercio || tipo.ID_TipoComercio;
    const descripcion = tipo.descripcion || tipo.Descripcion;
    
    if (id && descripcion) {
      map[id] = descripcion;
    }
  });
  
  return map;
};

// Filtra solo los tipos activos
export const filterActiveTipos = (tiposComercio) => {
  if (!tiposComercio || !Array.isArray(tiposComercio)) {
    return [];
  }
  
  return tiposComercio.filter(tipo => tipo.estado === true || tipo.Estado === true);
};

// Verifica si un tipo de comercio está siendo usado por comercios
export const isTipoEnUso = (tipoId, comercios) => {
  if (!comercios || !Array.isArray(comercios)) {
    return false;
  }
  
  return comercios.some(comercio => 
    comercio.iD_TipoComercio === tipoId || comercio.ID_TipoComercio === tipoId
  );
};

// Exportación por defecto
export default {
  getAllTiposComercio,
  getTipoComercioById,
  searchTiposByName,
  createTipoComercio,
  updateTipoComercio,
  deleteTipoComercio,
  buildTiposComercioMap,
  filterActiveTipos,
  isTipoEnUso
};
