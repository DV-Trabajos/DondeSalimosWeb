// formatters.js - Funciones de formateo y utilidades

// Formatea una fecha en formato legible
export const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    const date = new Date(fecha);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('es-AR', opciones);
  } catch (error) {
    return 'Fecha inválida';
  }
};

// Formatea solo la hora de una fecha
export const formatearHora = (fecha) => {
  if (!fecha) return '--:--';
  
  try {
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    return '--:--';
  }
};

// Formatea una fecha en formato corto
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return '--/--/----';
  
  try {
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
      return '--/--/----';
    }

    return date.toLocaleDateString('es-AR');
  } catch (error) {
    return '--/--/----';
  }
};

// Formatea fecha y hora juntas
export const formatearFechaHora = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  try {
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    const fechaStr = date.toLocaleDateString('es-AR');
    const horaStr = date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    return `${fechaStr} ${horaStr}`;
  } catch (error) {
    return 'Fecha inválida';
  }
};

// Convierte un TimeSpan del backend (formato "DD:HH:MM:SS" o "DD:HH:MM") a días
export const formatTimeSpanToDays = (timeSpan) => {
  if (!timeSpan) return 0;
  
  try {
    // Remover milisegundos si existen (ej: "15:00:00.000" -> "15:00:00")
    const normalizedTime = timeSpan.split('.')[0];
    
    // Dividir por ":"
    const parts = normalizedTime.split(':');
    
    if (parts.length > 0) {
      // El primer número es siempre los días
      const days = parseInt(parts[0]) || 0;
      return days;
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
};

// Convierte días a etiqueta legible 
export const formatTimeSpanToLabel = (timeSpan) => {
  const dias = formatTimeSpanToDays(timeSpan);
  
  if (dias === 7) return '1 Semana';
  if (dias === 15) return '15 Días';
  if (dias >= 23 && dias <= 31) return '1 Mes';
  
  return `${dias} ${dias === 1 ? 'Día' : 'Días'}`;
};

// Formatea un número de teléfono
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  // Remover caracteres no numéricos
  const cleaned = telefono.replace(/\D/g, '');
  
  // Formato argentino: 11-1234-5678 o (011) 1234-5678
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  
  return telefono;
};

// Formatea un precio en pesos argentinos
export const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined) return '$0,00';
  
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(precio);
  } catch (error) {
    return `$${precio}`;
  }
};

// Capitaliza la primera letra de cada palabra
export const capitalizarTexto = (texto) => {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Trunca un texto a una longitud específica
export const truncarTexto = (texto, longitud = 50) => {
  if (!texto) return '';
  if (texto.length <= longitud) return texto;
  
  return texto.substring(0, longitud) + '...';
};

// Convierte una imagen a Base64
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se proporcionó ningún archivo'));
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida'));
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('La imagen no debe superar los 5MB'));
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      // Remover el prefijo data:image/...;base64,
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Convierte una cadena Base64 a una URL de imagen visualizable
export const convertBase64ToImage = (base64String, mimeType = 'image/jpeg') => {
  if (!base64String) {
    return '';
  }

  try {
    // Si ya es una URL de datos completa, devolverla tal cual
    if (base64String.startsWith('data:image')) {
      return base64String;
    }

    // Si es una URL HTTP/HTTPS, devolverla tal cual
    if (base64String.startsWith('http://') || base64String.startsWith('https://')) {
      return base64String;
    }

    // Construir la URL de datos con el Base64
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    return '';
  }
};

// Formatea un CUIT en formato XX-XXXXXXXX-X
export const formatearCUIT = (cuit) => {
  if (!cuit) return '';
  
  // Remover caracteres no numéricos
  const cleaned = cuit.replace(/\D/g, '');
  
  // Formato: XX-XXXXXXXX-X
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
  }
  
  return cuit;
};

// Formatea el tiempo para input type="time"
export const formatTimeForInput = (time) => {
  if (!time) return '';
  
  // Si ya está en formato HH:MM, devolver tal cual
  if (time.length === 5 && time.includes(':')) {
    return time;
  }
  
  // Si está en formato HH:MM:SS, remover los segundos
  if (time.length === 8 && time.split(':').length === 3) {
    return time.substring(0, 5);
  }
  
  return time;
};

// Calcula tiempo relativo (hace X tiempo)
export const tiempoRelativo = (fecha) => {
  if (!fecha) return '';
  
  try {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    
    return formatearFechaCorta(fecha);
  } catch (error) {
    return '';
  }
};

// Valida y formatea un email
export const validarEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Formatea un número con separador de miles
export const formatearNumero = (numero) => {
  if (numero === null || numero === undefined) return '0';
  
  return new Intl.NumberFormat('es-AR').format(numero);
};

// Obtiene las iniciales de un nombre
export const obtenerIniciales = (nombre) => {
  if (!nombre) return '??';
  
  const palabras = nombre.trim().split(' ');
  if (palabras.length === 1) {
    return palabras[0].charAt(0).toUpperCase();
  }
  
  return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
};

// Formatea una dirección para mostrar
export const formatearDireccion = (direccion) => {
  if (!direccion) return '';
  
  if (typeof direccion === 'string') return direccion;
  
  const partes = [];
  
  if (direccion.calle) partes.push(direccion.calle);
  if (direccion.numero) partes.push(direccion.numero);
  if (direccion.piso) partes.push(`Piso ${direccion.piso}`);
  if (direccion.depto) partes.push(`Depto ${direccion.depto}`);
  if (direccion.ciudad) partes.push(direccion.ciudad);
  
  return partes.join(', ');
};

// Estos alias permiten usar nombres en inglés
// manteniendo las funciones originales en español
export const formatDate = formatearFecha;
export const formatTime = formatearHora;
export const formatShortDate = formatearFechaCorta;
export const formatDateTime = formatearFechaHora;
export const formatPhoneNumber = formatearTelefono;
export const formatPrice = formatearPrecio;
export const capitalizeText = capitalizarTexto;
export const truncateText = truncarTexto;
export const formatCUIT = formatearCUIT;
export const relativeTime = tiempoRelativo;
export const validateEmail = validarEmail;
export const formatNumber = formatearNumero;
export const getInitials = obtenerIniciales;
export const formatAddress = formatearDireccion;

// Exportar todas las funciones por defecto también
export default {
  // Funciones en español (originales)
  formatearFecha,
  formatearHora,
  formatearFechaCorta,
  formatearFechaHora,
  formatTimeSpanToDays,
  formatTimeSpanToLabel,
  formatearTelefono,
  formatearPrecio,
  capitalizarTexto,
  truncarTexto,
  convertImageToBase64,
  convertBase64ToImage,
  formatearCUIT,
  formatTimeForInput,
  tiempoRelativo,
  validarEmail,
  formatearNumero,
  obtenerIniciales,
  formatearDireccion,
  
  // Alias en inglés (compatibilidad)
  formatDate,
  formatTime,
  formatShortDate,
  formatDateTime,
  formatPhoneNumber,
  formatPrice,
  capitalizeText,
  truncateText,
  formatCUIT,
  relativeTime,
  validateEmail,
  formatNumber,
  getInitials,
  formatAddress,
};
