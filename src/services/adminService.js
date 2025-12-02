// adminService.js - Servicio para panel de administración
import api from './api';

// USUARIOS
export const getAllUsuarios = async () => {
  const response = await api.get('/api/Usuarios/listado');
  return response.data;
};

export const getUsuarioById = async (id) => {
  const response = await api.get(`/api/Usuarios/buscarIdUsuario/${id}`);
  return response.data;
};

export const actualizarUsuario = async (id, data) => {
  const response = await api.put(`/api/Usuarios/actualizar/${id}`, data);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await api.delete(`/api/Usuarios/eliminar/${id}`);
  return response.data;
};

// COMERCIOS
export const getAllComercios = async () => {
  const response = await api.get('/api/Comercios/listado');
  return response.data;
};

export const aprobarComercio = async (id, comercioData) => {
  const updatedData = { ...comercioData, estado: true, motivoRechazo: null };
  const response = await api.put(`/api/Comercios/actualizar/${id}`, updatedData);
  return response.data;
};

export const rechazarComercio = async (id, comercioData, motivo) => {
  const updatedData = { ...comercioData, estado: false, motivoRechazo: motivo };
  const response = await api.put(`/api/Comercios/actualizar/${id}`, updatedData);
  return response.data;
};

// PUBLICIDADES
export const getAllPublicidades = async () => {
  const response = await api.get('/api/Publicidades/listado');
  return response.data;
};

export const aprobarPublicidad = async (id, pubData) => {
  const updatedData = { ...pubData, estado: true, motivoRechazo: null };
  const response = await api.put(`/api/Publicidades/actualizar/${id}`, updatedData);
  return response.data;
};

export const rechazarPublicidad = async (id, pubData, motivo) => {
  const updatedData = { ...pubData, estado: false, motivoRechazo: motivo };
  const response = await api.put(`/api/Publicidades/actualizar/${id}`, updatedData);
  return response.data;
};

// RESEÑAS
export const getAllResenias = async () => {
  const response = await api.get('/api/Resenias/listado');
  return response.data;
};

export const deleteResenia = async (id) => {
  const response = await api.delete(`/api/Resenias/eliminar/${id}`);
  return response.data;
};

// ESTADÍSTICAS
export const getAdminStats = async () => {
  try {
    const [usuarios, comercios, publicidades, resenias] = await Promise.all([
      getAllUsuarios(),
      getAllComercios(),
      getAllPublicidades(),
      getAllResenias(),
    ]);

    const comerciosPendientes = comercios.filter(c => !c.estado && !c.motivoRechazo);
    const publicidadesPendientes = publicidades.filter(p => !p.estado && !p.motivoRechazo);

    return {
      totalUsuarios: usuarios.length,
      totalComercios: comercios.length,
      comerciosAprobados: comercios.filter(c => c.estado).length,
      comerciosPendientes: comerciosPendientes.length,
      totalPublicidades: publicidades.length,
      publicidadesPendientes: publicidadesPendientes.length,
      totalResenias: resenias.length,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

export default {
  getAllUsuarios,
  getUsuarioById,
  actualizarUsuario,
  eliminarUsuario,
  getAllComercios,
  aprobarComercio,
  rechazarComercio,
  getAllPublicidades,
  aprobarPublicidad,
  rechazarPublicidad,
  getAllResenias,
  deleteResenia,
  getAdminStats,
};
