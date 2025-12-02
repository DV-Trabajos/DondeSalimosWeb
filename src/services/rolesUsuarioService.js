// rolesUsuarioService.js - Servicio para roles de usuario
import api from './api';

// OPERACIONES CRUD
// Obtiene todos los roles de usuario desde la base de datos
// GET: /api/rolesUsuario/listado
export const getAllRoles = async () => {
  try {
    const response = await api.get('/api/rolesUsuario/listado');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtiene un rol por ID
// GET: /api/rolesUsuario/buscarIdRolUsuario/{id}
export const getRolById = async (id) => {
  try {
    const response = await api.get(`/api/rolesUsuario/buscarIdRolUsuario/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Busca roles por nombre/descripción
// GET: /api/rolesUsuario/buscarNombreRolUsuario/{rolUsuario}
export const searchRolesByName = async (nombre) => {
  try {
    const response = await api.get(`/api/rolesUsuario/buscarNombreRolUsuario/${nombre}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crea un nuevo rol de usuario
// POST: /api/rolesUsuario/crear
export const createRol = async (rol) => {
  try {
    const response = await api.post('/api/rolesUsuario/crear', rol);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualiza un rol existente
// PUT: /api/rolesUsuario/actualizar/{id}
export const updateRol = async (id, rol) => {
  try {
    const response = await api.put(`/api/rolesUsuario/actualizar/${id}`, rol);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Elimina un rol de usuario
// DELETE: /api/rolesUsuario/eliminar/{id}
export const deleteRol = async (id) => {
  try {
    const response = await api.delete(`/api/rolesUsuario/eliminar/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// UTILIDADES Y HELPERS
// Obtiene la descripción de un rol por su ID
export const getRoleDescription = (roleId) => {
  const descriptions = {
    2: 'Administrador',
    3: 'Usuario Comercio',
    16: 'Usuario'
  };
  return descriptions[roleId] || 'Desconocido';
};

// Obtiene el ícono emoji asociado a un rol
export const getRoleIcon = (roleId) => {
  const icons = {
    2: '👑',   // Administrador
    3: '🏪',   // Usuario Comercio
    16: '👤'   // Usuario común
  };
  return icons[roleId] || '👤';
};

// Obtiene el color asociado a un rol (para badges)
export const getRoleColor = (roleId) => {
  const colors = {
    2: 'purple',  // Administrador
    3: 'green',   // Usuario Comercio
    16: 'blue'    // Usuario común
  };
  return colors[roleId] || 'gray';
};

// Obtiene las clases CSS para badge de un rol
export const getRoleBadgeClasses = (roleId) => {
  const classes = {
    2: 'bg-purple-100 text-purple-800',
    3: 'bg-green-100 text-green-800',
    16: 'bg-blue-100 text-blue-800'
  };
  return classes[roleId] || 'bg-gray-100 text-gray-800';
};

// Verifica si un rol es un rol del sistema (no se puede eliminar)
// Los roles del sistema son: Administrador (2), Usuario Comercio (3), Usuario (16)
export const isSystemRole = (roleId) => {
  const systemRoles = [2, 3, 16];
  return systemRoles.includes(roleId);
};

// Verifica si un rol está siendo usado por usuarios
export const isRolEnUso = (rolId, usuarios) => {
  if (!usuarios || !Array.isArray(usuarios)) {
    return false;
  }
  
  return usuarios.some(usuario => 
    usuario.iD_RolUsuario === rolId || usuario.ID_RolUsuario === rolId
  );
};

// Construye un mapa de ID -> Descripción desde la lista de roles
export const buildRolesMap = (roles) => {
  if (!roles || !Array.isArray(roles)) {
    return {};
  }
  
  const map = {};
  roles.forEach(rol => {
    const id = rol.iD_RolUsuario || rol.ID_RolUsuario;
    const descripcion = rol.descripcion || rol.Descripcion;
    
    if (id && descripcion) {
      map[id] = descripcion;
    }
  });
  
  return map;
};

// Obtiene información completa de un rol con íconos y colores
export const getRoleInfo = (roleId) => {
  return {
    id: roleId,
    descripcion: getRoleDescription(roleId),
    icon: getRoleIcon(roleId),
    color: getRoleColor(roleId),
    badgeClasses: getRoleBadgeClasses(roleId),
    isSystem: isSystemRole(roleId)
  };
};

// Exportación por defecto
export default {
  getAllRoles,
  getRolById,
  searchRolesByName,
  createRol,
  updateRol,
  deleteRol,
  getRoleDescription,
  getRoleIcon,
  getRoleColor,
  getRoleBadgeClasses,
  isSystemRole,
  isRolEnUso,
  buildRolesMap,
  getRoleInfo
};
