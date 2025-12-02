// api.js - Cliente Axios
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, MENSAJES } from '../utils/constants';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Función para convertir respuestas a camelCase (solo respuestas)
const toCamelCase = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

// Funciones de manejo de JWT
export const storeJwtToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
  } catch (error) {
    console.error('Error almacenando token:', error);
  }
};

export const getJwtToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  } catch (error) {
    return null;
  }
};

export const clearJwtToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
  } catch (error) {
    console.error('Error limpiando token:', error);
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error limpiando storage:', error);
  }
};

// Interceptor Request - SOLO agregar JWT
api.interceptors.request.use(
  (config) => {
    // Agregar JWT si existe
    const token = getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response - Transformar a camelCase + Manejo de errores
api.interceptors.response.use(
  (response) => {
    // Solo transformar respuestas a camelCase
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 404 NO es error crítico
      if (status === 404) {
        error.isNotFound = true;
        error.message = 'Recurso no encontrado';
        return Promise.reject(error);
      }
      
      // Otros errores
      switch (status) {
        case 401:
          clearJwtToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          error.message = MENSAJES?.ERROR_AUTENTICACION || 'Error de autenticación';
          break;
          
        case 403:
          error.message = 'No tienes permisos para realizar esta acción.';
          break;
          
        case 400:
          error.message = data?.mensaje || data?.message || data || 'Datos inválidos';
          break;
          
        case 500:
          error.message = 'Error en el servidor. Intenta nuevamente.';
          break;
          
        default:
          error.message = data?.mensaje || data?.message || 'Error desconocido';
      }
    } else if (error.request) {
      error.message = MENSAJES?.ERROR_CONEXION || 'Error de conexión';
    } else {
      error.message = 'Error desconocido';
    }
    
    return Promise.reject(error);
  }
);

// FUNCIONES AUXILIARES
// GET request
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    if (error.isNotFound) {
      return null;
    }
    throw error;
  }
};

// POST request
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PUT request
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// DELETE request
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// PATCH request
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exportar
export default api;

export {
  api,
  get as apiGet,
  post as apiPost,
  put as apiPut,
  del as apiDelete,
  patch as apiPatch,
};