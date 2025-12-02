// NotificationContext.jsx - Contexto global de notificaciones
import { createContext, useState, useCallback, useContext } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Agregar notificación al historial
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Max 50 notificaciones
    setUnreadCount(prev => prev + 1);

    // Guardar en localStorage
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = [newNotification, ...stored].slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(updated));

    return newNotification.id;
  }, []);

  // Mostrar toast (notificación temporal)
  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type, // success, error, warning, info
      duration,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remover después de la duración
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, duration);

    return toast.id;
  }, []);

  // Mostrar notificación con toast
  const notify = useCallback((title, message, type = 'info', persistent = true) => {
    // Mostrar toast temporal
    showToast(message, type);

    // Si es persistente, agregar al historial
    if (persistent) {
      addNotification({ title, message, type });
    }
  }, [showToast, addNotification]);

  // Notificaciones predefinidas
  const notifySuccess = useCallback((title, message) => {
    notify(title, message, 'success', true);
  }, [notify]);

  const notifyError = useCallback((title, message) => {
    notify(title, message, 'error', true);
  }, [notify]);

  const notifyWarning = useCallback((title, message) => {
    notify(title, message, 'warning', true);
  }, [notify]);

  const notifyInfo = useCallback((title, message) => {
    notify(title, message, 'info', true);
  }, [notify]);

  // Marcar notificación como leída
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Actualizar localStorage
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = stored.map(n => n.id === notificationId ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = stored.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });

    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = stored.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(updated));
  }, []);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  }, []);

  // Remover toast manualmente
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Cargar notificaciones de localStorage al iniciar
  const loadStoredNotifications = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(stored);
    setUnreadCount(stored.filter(n => !n.read).length);
  }, []);

  // Cargar al montar
  useState(() => {
    loadStoredNotifications();
  }, []);

  const value = {
    // Estado
    notifications,
    toasts,
    unreadCount,

    // Métodos
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    showToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeToast,
    clearAll,
    loadStoredNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
