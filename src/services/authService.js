// authService.js - Servicio de autenticación
import { apiPost, apiGet, storeJwtToken, clearJwtToken } from './api';

// Inicia sesión con Google
export const signInWithGoogle = async (idToken) => {
  try {
    const response = await apiPost('/api/usuarios/iniciarSesionConGoogle', {
      idToken,
    });

    // Guardar el JWT en localStorage
    if (response.jwtToken) {
      storeJwtToken(response.jwtToken);
    } else {
      console.warn('No se recibió JWT del backend');
    }
    
    // También guardar datos del usuario si es necesario
    if (response.usuario) {
      localStorage.setItem('userData', JSON.stringify(response.usuario));
    }
    
    return response;
  } catch (error) {
    console.error('Error en signInWithGoogle:', error);
    throw error;
  }
};

// Registra un nuevo usuario con Google
export const signUpWithGoogle = async (idToken, rolUsuario = 16) => {
  try {
    const response = await apiPost('/api/usuarios/registrarseConGoogle', {
      idToken,
      rolUsuario,
    });
    
    // Guardar el JWT en localStorage
    if (response.jwtToken) {
      storeJwtToken(response.jwtToken);
    } else {
      console.warn('No se recibió JWT del backend');
    }
    
    // También guardar datos del usuario
    if (response.usuario) {
      localStorage.setItem('userData', JSON.stringify(response.usuario));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Cierra sesión del usuario
export const signOut = () => {
  try {
    clearJwtToken();
    localStorage.removeItem('userData');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

// Obtiene el perfil del usuario actual
export const getUserProfile = async (userId) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarIdUsuario/${userId}`);
    return response;
  } catch (error) {
    console.error('Error en getUserProfile:', error);
    throw error;
  }
};

// Obtiene un usuario por email
export const getUserByEmail = async (email) => {
  try {
    const response = await apiGet(`/api/usuarios/buscarEmail/${email}`);
    return response;
  } catch (error) {
    console.error('Error en getUserByEmail:', error);
    throw error;
  }
};

// Verifica si un usuario existe
export const checkUserExists = async (email) => {
  try {
    await getUserByEmail(email);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

// Obtiene el usuario actual desde localStorage
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// Verifica si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('jwtToken');
  return !!token;
};

export default {
  signInWithGoogle,
  signUpWithGoogle,
  signOut,
  getUserProfile,
  getUserByEmail,
  checkUserExists,
  getCurrentUser,
  isAuthenticated,
};