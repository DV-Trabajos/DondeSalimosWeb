// useNotification.js - Hook para notificaciones
import { useContext } from 'react';
import NotificationContext from '../context/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }

  const {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    showToast,
  } = context;

  // Shortcuts para uso común
  const success = (message, duration = 5000) => {
    showToast(message, 'success', duration);
  };

  const error = (message, duration = 5000) => {
    showToast(message, 'error', duration);
  };

  const warning = (message, duration = 5000) => {
    showToast(message, 'warning', duration);
  };

  const info = (message, duration = 5000) => {
    showToast(message, 'info', duration);
  };

  // Métodos para casos comunes
  const apiError = (error, defaultMessage = 'Ocurrió un error') => {
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    showToast(message, 'error', 6000);
  };

  const apiSuccess = (message = 'Operación exitosa') => {
    showToast(message, 'success', 4000);
  };

  const confirm = (message) => {
    return window.confirm(message);
  };

  const prompt = (message, defaultValue = '') => {
    return window.prompt(message, defaultValue);
  };

  return {
    // Métodos del contexto
    ...context,
    
    // Shortcuts simplificados
    success,
    error,
    warning,
    info,
    
    // Helpers para API
    apiError,
    apiSuccess,
    
    // Helpers de navegador
    confirm,
    prompt,
  };
};

export default useNotification;
