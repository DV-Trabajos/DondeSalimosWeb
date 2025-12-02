// pagosService.js - Servicio de pagos con Mercado Pago
import api from './api';

// CONSTANTES DE PRECIOS - Precios de publicidad según duración (en ARS)
const PRECIOS_PUBLICIDAD = {
  7: 45000,    // 1 semana
  15: 75000,   // 15 días
  30: 140000,  // 1 mes
};

// UTILIDADES DE TIEMPO - Convierte TimeSpan del backend a número de días
export const convertirTimeSpanADias = (tiempo) => {
  if (!tiempo) return 7; // Default 7 días
  
  // Si ya es un número, devolverlo
  if (typeof tiempo === 'number') return tiempo;
  
  try {
    // Remover milisegundos si existen
    const normalizado = tiempo.split('.')[0];
    
    // Separar por ":"
    const partes = normalizado.split(':');
    
    if (partes.length > 0) {
      // El primer número representa los días
      const dias = parseInt(partes[0]) || 7;
      return dias;
    }
    
    return 7;
  } catch (error) {
    return 7;
  }
};

// Formatea los días a una etiqueta legible
export const formatearDiasAEtiqueta = (dias) => {
  if (dias === 7) return '7 días (1 semana)';
  if (dias === 15) return '15 días';
  if (dias >= 23 && dias <= 31) return '30 días (1 mes)';
  return `${dias} día${dias !== 1 ? 's' : ''}`;
};

// FUNCIONES DE PAGO - Crea una preferencia de pago en Mercado Pago
export const crearPreferencia = async ({ titulo, precio, publicidadId }) => {
  try {
    
    // Enviar propiedades en PascalCase para C#
    const response = await api.post('/api/Pagos/crear-preferencia', {
      Titulo: titulo,
      Precio: precio,
      PublicidadId: publicidadId,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verifica el estado de un pago
export const verificarPago = async (paymentId, preferenceId = '') => {
  try {    
    const response = await api.post('/api/Pagos/verificar-pago', {
      PaymentId: paymentId,
      PreferenceId: preferenceId,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Calcula el precio de una publicidad según los días
export const calcularPrecioPublicidad = (diasOTiempo) => {
  // Convertir TimeSpan a días si es necesario
  const dias = typeof diasOTiempo === 'string' 
    ? convertirTimeSpanADias(diasOTiempo) 
    : diasOTiempo;
  
  // Si es exactamente uno de los planes
  if (PRECIOS_PUBLICIDAD[dias]) {
    return PRECIOS_PUBLICIDAD[dias];
  }
  
  // Si está en rango de 1 mes (23-31 días)
  if (dias >= 23 && dias <= 31) {
    return PRECIOS_PUBLICIDAD[30];
  }
  
  // Precio por defecto: $6000/día
  return dias * 6000;
};

// Obtiene los planes de precios disponibles
export const getPlanesDisponibles = () => {
  return [
    { dias: 7, label: '7 días (1 semana)', precio: PRECIOS_PUBLICIDAD[7] },
    { dias: 15, label: '15 días', precio: PRECIOS_PUBLICIDAD[15] },
    { dias: 30, label: '30 días (1 mes)', precio: PRECIOS_PUBLICIDAD[30] },
  ];
};

// Abre el checkout de Mercado Pago
export const abrirCheckout = (initPoint) => {
  window.open(initPoint, '_blank');
};

// Procesa el retorno de Mercado Pago desde la URL
export const procesarRetornoMP = (url) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    return {
      collection_id: params.get('collection_id'),
      collection_status: params.get('collection_status'),
      payment_id: params.get('payment_id'),
      status: params.get('status'),
      external_reference: params.get('external_reference'),
      payment_type: params.get('payment_type'),
      merchant_order_id: params.get('merchant_order_id'),
      preference_id: params.get('preference_id'),
      site_id: params.get('site_id'),
      processing_mode: params.get('processing_mode'),
      merchant_account_id: params.get('merchant_account_id'),
    };
  } catch (error) {
    return null;
  }
};

// Formatea un precio en pesos argentinos
export const formatearPrecio = (precio) => {
  if (precio === null || precio === undefined || isNaN(precio)) {
    return '$ 0,00';
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precio);
};

export default {
  crearPreferencia,
  verificarPago,
  calcularPrecioPublicidad,
  abrirCheckout,
  procesarRetornoMP,
  convertirTimeSpanADias,
  formatearDiasAEtiqueta,
  getPlanesDisponibles,
  formatearPrecio,
  PRECIOS_PUBLICIDAD,
};