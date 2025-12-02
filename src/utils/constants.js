// constants.js - Constantes de la aplicación

// URLs de la API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7283';

// Google OAuth
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Google Maps
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Roles de Usuario
export const ROLES = {
  USUARIO_COMUN: 16,
  USUARIO_COMERCIO: 3,
  ADMINISTRADOR: 2,
};

// Descripciones de roles (para enviar al backend en registro)
export const ROLE_DESCRIPTIONS = {
  USUARIO_COMUN: 'Usuario',
  ADMINISTRADOR: 'Administrador',
  USUARIO_COMERCIO: 'Comercio',
};

// Estados genéricos
export const ESTADOS = {
  ACTIVO: true,
  INACTIVO: false,
};

// Estados de comercio con descripciones
export const COMERCIO_ESTADOS = {
  PENDIENTE: { value: false, label: 'Pendiente de aprobación', color: 'yellow' },
  APROBADO: { value: true, label: 'Aprobado', color: 'green' },
  RECHAZADO: { value: 'rechazado', label: 'Rechazado', color: 'red' },
};

// Tipos de comercio (respaldo si falla la API)
export const TIPOS_COMERCIO = {
  BAR: 1,
  RESTAURANTE: 2,
  BOLICHE: 3,
  CAFE: 4,
  PUB: 5,
};

// Descripciones de tipos de comercio
export const TIPOS_COMERCIO_DESCRIPCION = {
  1: 'Bar',
  2: 'Restaurante',
  3: 'Boliche',
  4: 'Café',
  5: 'Pub',
};

// Tipos de comercio para filtros
export const TIPOS_COMERCIO_FILTER = [
  { value: '', label: 'Todos los tipos' },
  { value: '1', label: 'Bar' },
  { value: '2', label: 'Boliche' },
  { value: '3', label: 'Restaurante' },
];

// Géneros musicales disponibles
export const GENEROS_MUSICALES = [
  // Electrónica
  { id: 'techno', label: 'Techno', categoria: 'Electrónica' },
  { id: 'house', label: 'House', categoria: 'Electrónica' },
  { id: 'trance', label: 'Trance', categoria: 'Electrónica' },
  { id: 'dubstep', label: 'Dubstep', categoria: 'Electrónica' },
  { id: 'drum_and_bass', label: 'Drum & Bass', categoria: 'Electrónica' },
  
  // Latino
  { id: 'salsa', label: 'Salsa', categoria: 'Latino' },
  { id: 'reggaeton', label: 'Reggaetón', categoria: 'Latino' },
  { id: 'bachata', label: 'Bachata', categoria: 'Latino' },
  { id: 'merengue', label: 'Merengue', categoria: 'Latino' },
  { id: 'cumbia', label: 'Cumbia', categoria: 'Latino' },
  { id: 'cachengue', label: 'Cachengue', categoria: 'Latino' },
  { id: 'trap_latino', label: 'Trap Latino', categoria: 'Latino' },
  
  // Rock
  { id: 'rock', label: 'Rock', categoria: 'Rock' },
  { id: 'punk', label: 'Punk', categoria: 'Rock' },
  { id: 'alternativo', label: 'Alternativo', categoria: 'Rock' },
  { id: 'indie_rock', label: 'Indie Rock', categoria: 'Rock' },
  { id: 'hard_rock', label: 'Hard Rock', categoria: 'Rock' },
  { id: 'metal', label: 'Metal', categoria: 'Rock' },
  
  // Urbano
  { id: 'hip_hop', label: 'Hip Hop', categoria: 'Urbano' },
  { id: 'rap', label: 'Rap', categoria: 'Urbano' },
  { id: 'rnb', label: 'R&B', categoria: 'Urbano' },
  
  // Otros
  { id: 'jazz', label: 'Jazz', categoria: 'Otros' },
  { id: 'blues', label: 'Blues', categoria: 'Otros' },
  { id: 'pop', label: 'Pop', categoria: 'Otros' },
  { id: 'folklore', label: 'Folklore', categoria: 'Otros' },
  { id: 'tango', label: 'Tango', categoria: 'Otros' },
  { id: 'dark', label: 'Dark/Gótico', categoria: 'Otros' },
];

// Géneros agrupados por categoría
export const GENEROS_POR_CATEGORIA = {
  'Electrónica': ['techno', 'house', 'trance', 'dubstep', 'drum_and_bass'],
  'Latino': ['salsa', 'reggaeton', 'bachata', 'merengue', 'cumbia', 'cachengue', 'trap_latino'],
  'Rock': ['rock', 'punk', 'alternativo', 'indie_rock', 'hard_rock', 'metal'],
  'Urbano': ['hip_hop', 'rap', 'rnb'],
  'Otros': ['jazz', 'blues', 'pop', 'folklore', 'tango', 'dark'],
};

// Estados de Reserva
export const RESERVA_ESTADOS = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
};

// Storage Keys
export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwtToken',
  USER_DATA: 'userData',
  GOOGLE_TOKEN: 'googleToken',
};

// Mensajes
export const MENSAJES = {
  ERROR_GENERICO: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
  ERROR_CONEXION: 'Error de conexión. Verifica tu internet.',
  ERROR_AUTENTICACION: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  EXITO_GENERICO: 'Operación exitosa.',
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  MIS_COMERCIOS: '/mis-comercios',
  BAR_MANAGEMENT: '/mis-comercios',
  MIS_PUBLICIDADES: '/mis-publicidades',
  MIS_RESERVAS: '/mis-reservas',
  ADMIN_PANEL: '/admin',
  RESERVATIONS: '/reservations',
  NOT_FOUND: '*',
};

// Configuración de búsqueda de lugares
export const SEARCH_CONFIG = {
  DEFAULT_RADIUS: 5000, // 5km
  MAX_RADIUS: 50000, // 50km
  DEFAULT_TYPE: 'bar',
};

// Formatos de fecha
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Validaciones
export const VALIDATIONS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 100,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  CUIT_LENGTH: 11,
  TELEFONO_MIN_LENGTH: 10,
  TELEFONO_MAX_LENGTH: 15,
};

// Paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export default {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_MAPS_API_KEY,
  ROLES,
  ROLE_DESCRIPTIONS,
  ESTADOS,
  COMERCIO_ESTADOS,
  TIPOS_COMERCIO,
  TIPOS_COMERCIO_DESCRIPCION,
  TIPOS_COMERCIO_FILTER,
  GENEROS_MUSICALES,
  GENEROS_POR_CATEGORIA,
  RESERVA_ESTADOS,
  STORAGE_KEYS,
  MENSAJES,
  ROUTES,
  SEARCH_CONFIG,
  DATE_FORMATS,
  VALIDATIONS,
  PAGINATION,
};