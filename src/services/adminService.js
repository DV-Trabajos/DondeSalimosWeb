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

// Helper para formatear comercio al formato que espera la API (PascalCase)
const formatComercioForAPI = (comercio, estado, motivoRechazo = null) => {
  return {
    ID_Comercio: comercio.iD_Comercio || comercio.ID_Comercio,
    Nombre: comercio.nombre || comercio.Nombre,
    Direccion: comercio.direccion || comercio.Direccion,
    Telefono: comercio.telefono || comercio.Telefono || '',
    Correo: comercio.correo || comercio.Correo,
    NroDocumento: comercio.nroDocumento || comercio.NroDocumento || '',
    TipoDocumento: comercio.tipoDocumento || comercio.TipoDocumento || 'CUIT',
    ID_TipoComercio: comercio.iD_TipoComercio || comercio.ID_TipoComercio,
    Capacidad: comercio.capacidad || comercio.Capacidad || 0,
    Mesas: comercio.mesas || comercio.Mesas || 0,
    GeneroMusical: comercio.generoMusical || comercio.GeneroMusical || '',
    HoraIngreso: comercio.horaIngreso || comercio.HoraIngreso || '00:00:00',
    HoraCierre: comercio.horaCierre || comercio.HoraCierre || '00:00:00',
    Foto: comercio.foto || comercio.Foto || null,
    Estado: estado,
    MotivoRechazo: motivoRechazo,
    ID_Usuario: comercio.iD_Usuario || comercio.ID_Usuario,
  };
};

export const aprobarComercio = async (id, comercioData) => {
  const formattedData = formatComercioForAPI(comercioData, true, null);
  const response = await api.put(`/api/Comercios/actualizar/${id}`, formattedData);
  return response.data;
};

export const rechazarComercio = async (id, comercioData, motivo) => {
  const formattedData = formatComercioForAPI(comercioData, false, motivo);
  const response = await api.put(`/api/Comercios/actualizar/${id}`, formattedData);
  return response.data;
};

// PUBLICIDADES
export const getAllPublicidades = async () => {
  const response = await api.get('/api/Publicidades/listado');
  return response.data;
};

// Cambiar estado de publicidad (aprobar/rechazar)
// PUT: api/publicidades/cambiar-estado/{id}
export const cambiarEstadoPublicidad = async (id, estado, motivoRechazo = null) => {
  const response = await api.put(`/api/Publicidades/cambiar-estado/${id}`, {
    Estado: estado,
    MotivoRechazo: motivoRechazo
  });
  return response.data;
};

// Helpers para mantener compatibilidad
export const aprobarPublicidad = async (id) => {
  return cambiarEstadoPublicidad(id, true);
};

export const rechazarPublicidad = async (id, pubData, motivo) => {
  return cambiarEstadoPublicidad(id, false, motivo);
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