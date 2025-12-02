// useLocation.js - Hook para acceder al contexto de ubicación
import { useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

//Hook personalizado para acceder al contexto de ubicación
export const useLocation = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocation debe ser usado dentro de un LocationProvider');
  }

  return context;
};

export default useLocation;
