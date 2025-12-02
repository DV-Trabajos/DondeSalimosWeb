// cuitValidator.js - Validador de CUIT/CUIL argentino

// Formatea un CUIT/CUIL agregando guiones
export const formatCUIT = (cuit) => {
  if (!cuit) return '';
  
  // Eliminar todo lo que no sea número
  const numeros = cuit.replace(/\D/g, '');
  
  // Si tiene 11 dígitos, formatear
  if (numeros.length === 11) {
    return `${numeros.slice(0, 2)}-${numeros.slice(2, 10)}-${numeros.slice(10)}`;
  }
  
  return numeros;
};

// Elimina el formato de un CUIT/CUIL
export const unformatCUIT = (cuit) => {
  if (!cuit) return '';
  return cuit.replace(/\D/g, '');
};

// Valida el formato y dígito verificador de un CUIT/CUIL
export const validateCUIT = (cuit) => {
  if (!cuit) return false;
  
  // Eliminar formato
  const cuitLimpio = unformatCUIT(cuit);
  
  // Verificar que tenga 11 dígitos
  if (cuitLimpio.length !== 11) {
    return false;
  }
  
  // Verificar que sean solo números
  if (!/^\d+$/.test(cuitLimpio)) {
    return false;
  }
  
  // Calcular dígito verificador
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(cuitLimpio[i]) * multiplicadores[i];
  }
  
  let verificador = 11 - (suma % 11);
  
  if (verificador === 11) verificador = 0;
  if (verificador === 10) verificador = 9;
  
  // Comparar con el último dígito
  return verificador === parseInt(cuitLimpio[10]);
};

// Obtiene el tipo de CUIT según el prefijo
export const getTipoCUIT = (cuit) => {
  if (!cuit) return 'Desconocido';
  
  const cuitLimpio = unformatCUIT(cuit);
  
  if (cuitLimpio.length < 2) return 'Desconocido';
  
  const prefijo = cuitLimpio.slice(0, 2);
  
  const tipos = {
    '20': 'Persona Física Masculino',
    '23': 'Persona Física Masculino',
    '24': 'Persona Física Masculino',
    '27': 'Persona Física Femenino',
    '30': 'Persona Jurídica',
    '33': 'Persona Jurídica',
    '34': 'Persona Jurídica',
  };
  
  return tipos[prefijo] || 'Otro';
};

// Genera un mensaje de error para CUIT inválido
export const getErrorCUIT = (cuit) => {
  if (!cuit) return 'El CUIT es requerido';
  
  const cuitLimpio = unformatCUIT(cuit);
  
  if (cuitLimpio.length === 0) return 'El CUIT es requerido';
  
  if (cuitLimpio.length !== 11) {
    return 'El CUIT debe tener 11 dígitos';
  }
  
  if (!/^\d+$/.test(cuitLimpio)) {
    return 'El CUIT solo debe contener números';
  }
  
  if (!validateCUIT(cuit)) {
    return 'El CUIT ingresado no es válido';
  }
  
  return null;
};

// Formatea mientras el usuario escribe
export const formatCUITOnType = (value, previousValue = '') => {
  // Eliminar todo lo que no sea número
  let numeros = value.replace(/\D/g, '');
  
  // Limitar a 11 dígitos
  if (numeros.length > 11) {
    numeros = numeros.slice(0, 11);
  }
  
  // Formatear según la cantidad de dígitos
  if (numeros.length <= 2) {
    return numeros;
  } else if (numeros.length <= 10) {
    return `${numeros.slice(0, 2)}-${numeros.slice(2)}`;
  } else {
    return `${numeros.slice(0, 2)}-${numeros.slice(2, 10)}-${numeros.slice(10)}`;
  }
};

export default {
  formatCUIT,
  unformatCUIT,
  validateCUIT,
  getTipoCUIT,
  getErrorCUIT,
  formatCUITOnType,
};
