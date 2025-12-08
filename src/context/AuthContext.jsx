// AuthContext.jsx - Context de autenticación con verificación periódica de sesión
import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { signInWithGoogle, signUpWithGoogle, getUserProfile } from '../services/authService';
import { storeJwtToken, getJwtToken, clearJwtToken } from '../services/api';
import { verificarSesion } from '../services/usuariosService';
import { ROLES, STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext();

// Intervalo de verificación de sesión (5 minutos en milisegundos)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  // ESTADOS
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
    isBarOwner: false,
    isApproved: false,
    lastSessionCheck: null,
  });

  // Ref para evitar múltiples verificaciones simultáneas
  const isCheckingSession = useRef(false);

  // FUNCIONES AUXILIARES
  // Extrae el mensaje de error de diferentes formatos de respuesta de la API
  const extractErrorMessage = useCallback((error) => {
    if (error.response?.data) {
      const data = error.response.data;
      const message = data.mensaje || data.message || data.error || data.Message || data.Mensaje;
      if (message) return message;
      if (typeof data === 'string') return data;
    }
    if (error.message) return error.message;
    return 'Error en la autenticación. Por favor, intenta nuevamente.';
  }, []);

  // Actualiza el estado de autenticación con los datos del usuario
  const updateAuthState = useCallback((userData) => {
    const isAdmin = userData?.iD_RolUsuario === ROLES.ADMINISTRADOR;
    const isBarOwner = userData?.iD_RolUsuario === ROLES.USUARIO_COMERCIO;

    setState(prev => ({
      ...prev,
      user: userData,
      isAuthenticated: !!userData,
      isLoading: false,
      isAdmin,
      isBarOwner,
      isApproved: userData?.estado || false,
    }));

    // Guardar en localStorage
    if (userData) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }, []);

  // Logout - definido antes de checkSessionStatus porque lo usa
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
      lastSessionCheck: null,
    });
  }, []);

  // VERIFICACIÓN DE SESIÓN
  // Verifica el estado de la sesión con el backend
  const checkSessionStatus = useCallback(async (showAlert = true) => {
    // Evitar verificaciones simultáneas
    if (isCheckingSession.current) {
      return;
    }

    // Solo verificar si hay usuario autenticado - Usamos el state actual directamente
    const currentState = state;
    if (!currentState.isAuthenticated || !currentState.user) {
      return;
    }

    isCheckingSession.current = true;

    try {
      const result = await verificarSesion();

      // Si requiere logout, cerrar sesión
      if (result.requiereLogout) {
        console.warn('[AuthContext] Sesión invalidada por el servidor:', result.mensaje);
        logout();
        
        if (showAlert && result.mensaje) {
          setTimeout(() => {
            alert(result.mensaje);
          }, 100);
        }
        return;
      }

      // Si la sesión es válida, verificar si hay cambios en el usuario
      if (result.sesionValida && result.usuario) {
        const serverUser = result.usuario;
        const localUser = currentState.user;

        // Detectar cambios en rol o estado
        const rolCambio = serverUser.iD_RolUsuario !== localUser.iD_RolUsuario;
        const estadoCambio = serverUser.estado !== localUser.estado;
        const nombreCambio = serverUser.nombreUsuario !== localUser.nombreUsuario;

        if (rolCambio || estadoCambio || nombreCambio) {
          updateAuthState({ ...localUser, ...serverUser });
        }

        setState(prev => ({ ...prev, lastSessionCheck: new Date() }));
      }
    } catch (error) {
      console.error('[AuthContext] Error verificando sesión:', error);
    } finally {
      isCheckingSession.current = false;
    }
  }, [state.isAuthenticated, state.user, logout, updateAuthState]);

  // CARGA INICIAL DE USUARIO
  // Carga el usuario guardado en localStorage
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
  }, [updateAuthState]);

  // EFFECTS - Todos al final, después de las funciones
  // Effect: Cargar usuario al montar
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Effect: Verificación periódica de sesión
  useEffect(() => {
    if (!state.isAuthenticated) {
      return;
    }

    // Verificar después de un pequeño delay inicial
    const initialCheckTimeout = setTimeout(() => {
      checkSessionStatus(false);
    }, 2000);

    // Configurar intervalo de verificación
    const intervalId = setInterval(() => {
      checkSessionStatus(true);
    }, SESSION_CHECK_INTERVAL);

    return () => {
      clearTimeout(initialCheckTimeout);
      clearInterval(intervalId);
    };
  }, [state.isAuthenticated, checkSessionStatus]);

  // Effect: Verificar cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      if (state.isAuthenticated) {
        setTimeout(() => checkSessionStatus(true), 500);
      }
    };

    const handleOnline = () => {
      if (state.isAuthenticated) {
        checkSessionStatus(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [state.isAuthenticated, checkSessionStatus]);

  // MÉTODOS DE AUTENTICACIÓN
  // Login con Google 
  const loginWithGoogle = async (idToken) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signInWithGoogle(idToken);

      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = extractErrorMessage(error);

      if (error.response?.status === 400) {
        return {
          success: false,
          needsRegistration: true,
          message: errorMessage,
        };
      }

      if (!error.response) {
        return {
          success: false,
          needsRegistration: false,
          message: 'Error de conexión. Verifica tu internet e intenta nuevamente.',
        };
      }

      return {
        success: false,
        needsRegistration: false,
        message: errorMessage,
      };
    }
  };

  // Registro con Google
  const registerWithGoogle = async (idToken, rolUsuario = ROLES.USUARIO_COMUN) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await signUpWithGoogle(idToken, rolUsuario);

      if (response.jwtToken) {
        storeJwtToken(response.jwtToken);
      }

      if (response.usuario) {
        updateAuthState(response.usuario);
        return { success: true, user: response.usuario };
      }

      throw new Error('No se recibió información del usuario');

    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = extractErrorMessage(error);

      if (error.response?.status === 400 || error.response?.status === 409) {
        return {
          success: false,
          alreadyRegistered: true,
          message: errorMessage,
        };
      }

      if (!error.response) {
        throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
      }

      throw new Error(errorMessage);
    }
  };

  // Actualiza los datos del usuario
  const updateUser = useCallback((newUserData) => {
    updateAuthState(newUserData);
  }, [updateAuthState]);

  // Verifica si el usuario tiene un rol específico
  const hasRole = useCallback((roleId) => {
    return state.user?.iD_RolUsuario === roleId;
  }, [state.user]);

  // Verifica si el usuario está autenticado
  const checkAuth = useCallback(() => {
    const token = getJwtToken();
    return !!token && state.isAuthenticated;
  }, [state.isAuthenticated]);
  
  // PROVIDER VALUE
  const value = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isAdmin: state.isAdmin,
    isBarOwner: state.isBarOwner,
    isApproved: state.isApproved,
    lastSessionCheck: state.lastSessionCheck,

    // Métodos
    loginWithGoogle,
    registerWithGoogle,
    logout,
    updateUser,
    hasRole,
    checkAuth,
    loadUser,
    checkSessionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;