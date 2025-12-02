// useDebounce.js - Hook para debounce de valores
import { useState, useEffect } from 'react';

//Hook personalizado para hacer debounce de un valor - Útil para búsquedas en tiempo real y evitar demasiadas peticiones
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes de que se cumpla el delay o cuando el componente se desmonte
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
