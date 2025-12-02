// AuthContext.jsx - Context de autenticación con manejo mejorado de errores de API
import { createContext, useState, useEffect, useCallback } from 'react';
import { signInWithGoogle, signUpWithGoogle, getUserProfile } from '../services/authService';
import { storeJwtToken, getJwtToken, clearJwtToken } from '../services/api';
import { ROLES, STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isBarOwner: false,
    isApproved: false,
  });

  //Carga el usuario desde localStorage al montar
  useEffect(() => {
    loadUser();
  }, []);

  //Carga el usuario guardado en localStorage
  const loadUser = useCallback(async () => {
    try {
      const token = getJwtToken();
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        updateAuthState(userData);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  //Actualiza el estado de autenticación con los datos del usuario
  const updateAuthState = useCallback((userData) => {
    const isAdmin = userData?.iD_RolUsuario === ROLES.ADMINISTRADOR;
    const isBarOwner = userData?.iD_RolUsuario === ROLES.USUARIO_COMERCIO;

    setState({
      user: userData,
      isAuthenticated: !!userData,
      isLoading: false,
      isAdmin,
      isBarOwner,
      isApproved: userData?.estado || false,
    });

    // Guardar en localStorage
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }, []);

  //Extrae el mensaje de error de diferentes formatos de respuesta de la API
  const extractErrorMessage = (error) => {

    // 1. Si el error tiene response.data (respuesta de Axios)
    if (error.response?.data) {
      const data = error.response.data;
      
      // Intenta obtener el mensaje de diferentes propiedades comunes
      const message = data.mensaje || 
                     data.message || 
                     data.error || 
                     data.Message ||
                     data.Mensaje;
      
      if (message) {
        return message;
      }
      
      // Si data es un string, devolverlo
      if (typeof data === 'string') {
        return data;
      }
    }

    // 2. Si el error tiene un mensaje directo
    if (error.message) {
      return error.message;
    }

    // 3. Mensaje por defecto
    return 'Error en la autenticación. Por favor, intenta nuevamente.';
  };

  //Login con Google 
  const loginWithGoogle = async (idToken) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signInWithGoogle(idToken);

      // Guardar JWT token (ya se guarda en authService, pero por si acaso)
      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      // Actualizar estado con usuario
      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));

      // Extraer el mensaje de error de la API
      const errorMessage = extractErrorMessage(error);

      // Caso especial: Usuario no registrado (400)
      if (error.response?.status === 400) {
        return {
          success: false,
          needsRegistration: true,
          message: errorMessage,
        };
      }

      // Caso especial: Error de red o servidor
      if (!error.response) {
        return {
          success: false,
          needsRegistration: false,
          message: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
        };
      }

      // Para otros errores, devolver el mensaje extraído
      return {
        success: false,
        needsRegistration: false,
        message: errorMessage,
      };
    }
  };

  //Registro con Google
  const registerWithGoogle = async (idToken, rolUsuario = ROLES.USUARIO_COMUN) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signUpWithGoogle(idToken, rolUsuario);

      // Guardar JWT token
      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      // Actualizar estado con usuario
      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));

      // Extraer el mensaje de error de la API
      const errorMessage = extractErrorMessage(error);

      // Caso especial: Usuario ya existe
      if (error.response?.status === 400 || error.response?.status === 409) {
        return {
          success: false,
          alreadyRegistered: true,
          message: errorMessage,
        };
      }

      // Caso especial: Error de red o servidor
      if (!error.response) {
        throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }

      // Para otros errores, lanzar con el mensaje extraído
      throw new Error(errorMessage);
    }
  };

  //Logout
  const logout = useCallback(() => {
    clearJwtToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_TOKEN);

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
      isBarOwner: false,
      isApproved: false,
    });
    
  }, []);

  //Actualiza los datos del usuario
  const updateUser = useCallback((newUserData) => {
    updateAuthState(newUserData);
  }, [updateAuthState]);

  //Verifica si el usuario tiene un rol específico
  const hasRole = useCallback((roleId) => {
    return state.user?.iD_RolUsuario === roleId;
  }, [state.user]);

  //Verifica si el usuario está autenticado
  const checkAuth = useCallback(() => {
    const token = getJwtToken();
    return !!token && state.isAuthenticated;
  }, [state.isAuthenticated]);

  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    isBarOwner: state.isBarOwner,
    isApproved: state.isApproved,

    // Métodos
    loginWithGoogle,
    registerWithGoogle,
    logout,
    updateUser,
    hasRole,
    checkAuth,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;