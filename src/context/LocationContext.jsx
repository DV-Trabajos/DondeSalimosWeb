// LocationContext.jsx - Contexto de geolocalización con timeout extendido
import { createContext, useState, useEffect, useCallback } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Solicita permiso y obtiene la ubicación actual
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por tu navegador');
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000, // 30 segundos para dar más tiempo
          maximumAge: 60000, // Permitir usar ubicación cacheada de hasta 1 minuto
        });
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      setLocation(locationData);
      setIsLoading(false);
      setPermissionDenied(false);
      
      return true;
    } catch (err) {
      let errorMessage = 'Error al obtener la ubicación';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permiso de ubicación denegado';
          setPermissionDenied(true);
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Ubicación no disponible';
          break;
        case err.TIMEOUT:
          errorMessage = 'Tiempo de espera agotado';
          break;
        default:
          errorMessage = 'Error desconocido al obtener ubicación';
      }

      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Inicia el seguimiento de ubicación en tiempo real
  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setLocation(locationData);
        setError(null);
      },
      (err) => {
        setError('Error actualizando ubicación');
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // AUMENTADO: 30 segundos
        maximumAge: 60000,
      }
    );

    return watchId;
  }, []);

  // Detiene el seguimiento de ubicación
  const clearWatch = useCallback((watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Establece una ubicación manualmente
  const setManualLocation = useCallback((lat, lng) => {
    const locationData = {
      latitude: lat,
      longitude: lng,
      accuracy: null,
      timestamp: Date.now(),
      manual: true,
    };

    setLocation(locationData);
    setError(null);
  }, []);

  // Limpia la ubicación actual
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Calcula la distancia entre dos puntos en kilómetros
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // en km
  }, []);

  // Verifica si está cerca de una ubicación
  const isNearby = useCallback(
    (targetLat, targetLng, radiusKm = 1) => {
      if (!location) return false;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        targetLat,
        targetLng
      );

      return distance <= radiusKm;
    },
    [location, calculateDistance]
  );

  // Solicitar ubicación al montar el componente
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const value = {
    // Estado
    location,
    error,
    isLoading,
    permissionDenied,

    // Métodos
    requestLocation,
    watchLocation,
    clearWatch,
    setManualLocation,
    clearLocation,
    calculateDistance,
    isNearby,

    // Acceso rápido a coordenadas
    latitude: location?.latitude || null,
    longitude: location?.longitude || null,
    coords:
      location
        ? { lat: location.latitude, lng: location.longitude }
        : null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;