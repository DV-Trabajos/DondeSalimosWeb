// roleHelper.js - Utilidades para manejo de roles de usuario

// IDs de roles en el sistema
export const ROLES = {
  ADMINISTRADOR: 2,
  USUARIO_COMERCIO: 3,
  USUARIO_COMUN: 16,
};

// Descripciones de roles por ID
const ROLE_DESCRIPTIONS = {
  2: 'Administrador',
  3: 'Dueño de Comercio',
  16: 'Usuario',
};

// Descripciones detalladas de roles
const ROLE_DETAILED_DESCRIPTIONS = {
  2: 'Acceso completo al sistema y panel de administración',
  3: 'Puede gestionar comercios, ver reservas y reseñas recibidas',
  16: 'Puede hacer reservas y dejar reseñas en comercios',
};

// Colores para cada rol (para badges)
const ROLE_COLORS = {
  2: 'red',    // Administrador
  3: 'purple', // Dueño de comercio
  16: 'blue',   // Usuario común  
};

// Iconos para cada rol (emoji)
const ROLE_ICONS = {
  2: '👑', // Administrador
  3: '🏪', // Dueño de comercio
  16: '👤', // Usuario común
};

// Obtiene la descripción de un rol por su ID
export const getRoleDescriptionById = (roleId) => {
  return ROLE_DESCRIPTIONS[roleId] || 'Desconocido';
};

// Obtiene la descripción detallada de un rol
export const getRoleDetailedDescription = (roleId) => {
  return ROLE_DETAILED_DESCRIPTIONS[roleId] || 'Sin descripción';
};

// Obtiene el color asociado a un rol
export const getRoleColor = (roleId) => {
  return ROLE_COLORS[roleId] || 'gray';
};

// Obtiene el ícono (emoji) de un rol
export const getRoleIcon = (roleId) => {
  return ROLE_ICONS[roleId] || '❓';
};

// Obtiene las clases de Tailwind para un badge de rol
export const getRoleBadgeClasses = (roleId) => {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-semibold';
  
  switch (roleId) {
    case ROLES.USUARIO_COMUN:
      return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
    case ROLES.USUARIO_COMERCIO:
      return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
    case ROLES.ADMINISTRADOR:
      return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
  }
};

// Verifica si un rol es válido
export const isValidRole = (roleId) => {
  return Object.values(ROLES).includes(roleId);
};

// Verifica si un rol es de usuario común
export const isUsuarioComun = (roleId) => {
  return roleId === ROLES.USUARIO_COMUN;
};

// Verifica si un rol es de dueño de comercio
export const isUsuarioComercio = (roleId) => {
  return roleId === ROLES.USUARIO_COMERCIO;
};

// Verifica si un rol es de administrador
export const isAdministrador = (roleId) => {
  return roleId === ROLES.ADMINISTRADOR;
};

// Obtiene todos los roles disponibles para selección
export const getAllRoles = () => {
  return Object.values(ROLES).map(roleId => ({
    id: roleId,
    nombre: getRoleDescriptionById(roleId),
    descripcion: getRoleDetailedDescription(roleId),
    icon: getRoleIcon(roleId),
    color: getRoleColor(roleId)
  }));
};

// Verifica si un rol tiene permisos de administrador
export const hasAdminPermissions = (roleId) => {
  return roleId === ROLES.ADMINISTRADOR;
};

// Verifica si un rol tiene permisos de administrador
export const hasComercioPermissions = (roleId) => {
  return roleId === ROLES.USUARIO_COMERCIO;
};

// Verifica si un rol puede gestionar comercios
export const canManageComercios = (roleId) => {
  return roleId === ROLES.USUARIO_COMERCIO || roleId === ROLES.ADMINISTRADOR;
};

// Verifica si un rol puede hacer reservas
export const canMakeReservas = (roleId) => {
  // Todos los roles pueden hacer reservas
  return isValidRole(roleId);
};

// Verifica si un rol puede dejar reseñas
export const canMakeResenias = (roleId) => {
  // Solo usuarios comunes y dueños de comercio pueden dejar reseñas
  return roleId === ROLES.USUARIO_COMUN || roleId === ROLES.USUARIO_COMERCIO;
};

// Obtiene el nombre del rol en inglés (para rutas, etc.)
export const getRoleSlug = (roleId) => {
  const slugs = {
    2: 'admin',
    3: 'business',
    16: 'user',   

  };
  return slugs[roleId] || 'unknown';
};

export default {
  ROLES,
  getRoleDescriptionById,
  getRoleDetailedDescription,
  getRoleColor,
  getRoleIcon,
  getRoleBadgeClasses,
  isValidRole,
  isUsuarioComun,
  isUsuarioComercio,
  isAdministrador,
  getAllRoles,
  hasAdminPermissions,
  canManageComercios,
  canMakeReservas,
  canMakeResenias,
  getRoleSlug,
};