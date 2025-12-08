// usuariosService.js - Servicio de usuarios con desactivación
import api from './api';

// OPERACIONES CRUD
// Obtiene todos los usuarios del sistema
// GET: /api/usuarios/listado
export const getAllUsuarios = async () => {
  const response = await api.get('/api/Usuarios/listado');
  return response.data;
};

// Obtiene un usuario por ID
// GET: /api/usuarios/buscarIdUsuario/{id}
export const getUsuarioById = async (id) => {
  const response = await api.get(`/api/Usuarios/buscarIdUsuario/${id}`);
  return response.data;
};

// Busca usuarios por nombre
// GET: /api/usuarios/buscarNombreUsuario/{usuario}
export const searchUsuariosByName = async (nombreUsuario) => {
  const response = await api.get(`/api/Usuarios/buscarNombreUsuario/${nombreUsuario}`);
  return response.data;
};

// Busca un usuario por email
// GET: /api/usuarios/buscarEmail/{email}
export const getUsuarioByEmail = async (email) => {
  const response = await api.get(`/api/Usuarios/buscarEmail/${email}`);
  return response.data;
};

// Actualiza un usuario
// PUT: /api/usuarios/actualizar/{id}
export const actualizarUsuario = async (id, usuarioData) => {
  const response = await api.put(`/api/Usuarios/actualizar/${id}`, usuarioData);
  return response.data;
};

// Desactiva un usuario
// PUT: /api/usuarios/desactivar/{id}
export const desactivarUsuario = async (id) => {
  try {
    const response = await api.put(`/api/Usuarios/desactivar/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cambia el estado de un usuario
// PUT: /api/usuarios/cambiarEstado/{id}
export const cambiarEstadoUsuario = async (id, estado) => {
  try {
    const response = await api.put(`/api/Usuarios/cambiarEstado/${id}`, { 
      estado: estado 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Elimina permanentemente un usuario y todas sus relaciones
// DELETE: /api/usuarios/eliminar/{id}
export const eliminarUsuario = async (id) => {
  try {
    const response = await api.delete(`/api/Usuarios/eliminar/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// VERIFICACIÓN DE SESIÓN 
export const verificarSesion = async () => {
  try {
    const response = await api.get('/api/Usuarios/verificarSesion');
    return response.data;
  } catch (error) {
    // Si es 401, el token expiró o es inválido
    if (error.response?.status === 401) {
      return {
        sesionValida: false,
        requiereLogout: true,
        mensaje: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      };
    }
    
    // Si es 404, el usuario fue eliminado
    if (error.response?.status === 404) {
      return {
        sesionValida: false,
        requiereLogout: true,
        mensaje: 'Tu cuenta ya no existe en el sistema.'
      };
    }

    // Para errores de red, no forzar logout (podría ser temporal)
    if (!error.response) {
      console.warn('[verificarSesion] Error de conexión, no se forzará logout');
      return {
        sesionValida: true, // Asumimos válida para no afectar UX
        requiereLogout: false,
        mensaje: null
      };
    }

    // Otros errores del servidor
    throw error;
  }
};

// FUNCIONES DE AUTENTICACIÓN
// Inicia sesión con Google
// POST: /api/usuarios/iniciarSesionConGoogle
export const signInWithGoogle = async (idToken) => {
  const response = await api.post('/api/Usuarios/iniciarSesionConGoogle', { idToken });
  return response.data;
};

// Registra un usuario con Google
// POST: /api/usuarios/registrarConGoogle
export const signUpWithGoogle = async (idToken, rolUsuario = 16) => {
  const response = await api.post('/api/Usuarios/registrarConGoogle', { 
    idToken, 
    rolUsuario 
  });
  return response.data;
};

// UTILIDADES
// Obtiene estadísticas de usuarios
export const getUsersStats = (usuarios) => {
  const total = usuarios.length;
  const activos = usuarios.filter(u => u.estado === true).length;
  const inactivos = usuarios.filter(u => u.estado === false).length;
  
  const porRol = usuarios.reduce((acc, u) => {
    const rolId = u.iD_RolUsuario;
    acc[rolId] = (acc[rolId] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    activos,
    inactivos,
    porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : 0,
    porRol,
  };
};

// Valida si un usuario puede ser desactivado
export const canDesactivarUsuario = (usuario) => {
  // No se puede desactivar si ya está inactivo
  if (usuario.estado === false) {
    return { 
      puede: false, 
      razon: 'El usuario ya está desactivado' 
    };
  }
  
  // No se puede desactivar a sí mismo (esto se valida con el user actual en el componente)
  return { 
    puede: true, 
    razon: null 
  };
};

// Valida si un usuario puede ser eliminado
export const canEliminarUsuario = (usuario, currentUserId) => {
  // No se puede eliminar a sí mismo
  if (usuario.iD_Usuario === currentUserId) {
    return { 
      puede: false, 
      razon: 'No puedes eliminar tu propia cuenta desde el panel de admin' 
    };
  }
  
  return { 
    puede: true, 
    razon: null 
  };
};

export default {
  // CRUD
  getAllUsuarios,
  getUsuarioById,
  searchUsuariosByName,
  getUsuarioByEmail,
  actualizarUsuario,
  desactivarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  
  // Verificación de sesión
  verificarSesion,
  
  // Autenticación
  signInWithGoogle,
  signUpWithGoogle,
  
  // Utilidades
  getUsersStats,
  canDesactivarUsuario,
  canEliminarUsuario,
};