// reservasService.js - Servicio completo de reservas con aprobación/rechazo
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// MAPEO DE CAMPOS API <-> FRONTEND
// Convierte una reserva de la API al formato del frontend
const mapReservaFromAPI = (reserva) => {
  if (!reserva) return null;
  
  return {
    iD_Reserva: reserva.iD_Reserva || reserva.ID_Reserva,
    fechaReserva: reserva.fechaReserva,
    tiempoTolerancia: reserva.tiempoTolerancia,
    comensales: reserva.comenzales || reserva.comensales,  // API usa "Comenzales"
    estado: reserva.estado,
    fechaCreacion: reserva.fechaCreacion,
    motivoRechazo: reserva.motivoRechazo,
    iD_Usuario: reserva.iD_Usuario || reserva.ID_Usuario,
    iD_Comercio: reserva.iD_Comercio || reserva.ID_Comercio,
    usuario: reserva.usuario,
    comercio: reserva.comercio,
    aprobada: reserva.estado === true && !reserva.motivoRechazo
  };
};

// Convierte una reserva del frontend al formato de la API
const mapReservaToAPI = (reserva) => {
  const mapped = {
    FechaReserva: reserva.fechaReserva,
    TiempoTolerancia: reserva.tiempoTolerancia || '00:15:00', // Default 15 min
    Comenzales: reserva.comensales,  // API usa "Comenzales"
    Estado: reserva.estado !== undefined ? reserva.estado : false,
    FechaCreacion: reserva.fechaCreacion || new Date().toISOString(),
    MotivoRechazo: reserva.motivoRechazo || null,
    ID_Usuario: reserva.iD_Usuario,
    ID_Comercio: reserva.iD_Comercio
  };
  
  // Solo agregar ID_Reserva si existe (para ediciones)
  if (reserva.iD_Reserva) {
    mapped.ID_Reserva = reserva.iD_Reserva;
  }
  
  return mapped;
};

// OPERACIONS CRUD 
// Obtiene todas las reservas del sistema
// GET: /api/reservas/listado
export const getAllReservas = async () => {
  try {
    const response = await apiGet('/api/reservas/listado');

    if (!response) return [];
    
    // Mapear cada reserva al formato del frontend
    return response.map(mapReservaFromAPI);
  } catch (error) {
    throw error;
  }
};

// Obtiene una reserva por ID
// GET: /api/reservas/buscarIdReserva/{id}
export const getReservaById = async (id) => {
  try {
    const response = await apiGet(`/api/reservas/buscarIdReserva/${id}`);
    return mapReservaFromAPI(response);
  } catch (error) {
    throw error;
  }
};

// Obtiene reservas de un usuario específico
// GET: /api/reservas/usuario/{idUsuario}
export const getReservasByUsuario = async (userId) => {
  try {
    const response = await apiGet(`/api/reservas/usuario/${userId}`);
    
    // Si api.js devolvió null (404), devolver array vacío
    if (response === null) {
      return [];
    }
    
    const reservas = response.map(mapReservaFromAPI);
    return reservas;
  } catch (error) {
    return [];
  }
};

// Alias para getReservasByUsuario (compatibilidad)
export const getReservasByUser = getReservasByUsuario;

// Obtiene reservas de un comercio por nombre
// GET: /api/reservas/buscarNombreComercio/{nombreComercio}
export const getReservasByComercio = async (nombreComercio) => {
  try {
    const response = await apiGet(`/api/reservas/buscarNombreComercio/${nombreComercio}`);
    
    // Si es null (404), devolver array vacío
    if (response === null) {
      return [];
    }
    
    return response.map(mapReservaFromAPI);
  } catch (error) {
    return [];
  }
};

// Obtiene las reservas recibidas en los comercios de un usuario dueño de comercio
// GET: /api/reservas/recibidasUsuario/{usuarioId}
export const getReservasRecibidasByUsuario = async (usuarioId, comercioIds = []) => {
  try {
    // Intentar usar el endpoint optimizado
    const response = await apiGet(`/api/reservas/recibidasUsuario/${usuarioId}`);
    
    if (!response) return [];
    
    // Mapear cada reserva al formato del frontend
    return response.map(mapReservaFromAPI);
  } catch (error) {
    // Si el endpoint no existe (404), usar fallback
    if (error.response?.status === 404 || error.message?.includes('404')) {
      console.warn('Endpoint /recibidas-usuario no existe, usando fallback...');
      
      // Fallback: obtener todas y filtrar
      const allReservas = await getAllReservas();
      
      if (comercioIds.length > 0) {
        return allReservas.filter(r => comercioIds.includes(r.iD_Comercio));
      }
      
      return allReservas;
    }
    
    console.error(`Error obteniendo reservas recibidas del usuario ${usuarioId}:`, error);
    throw error;
  }
};

// Crea una nueva reserva
// POST: /api/reservas/crear
export const createReserva = async (reserva) => {
  try {
    const apiReserva = mapReservaToAPI(reserva);
    const response = await apiPost('/api/reservas/crear', apiReserva);

    return mapReservaFromAPI(response);
  } catch (error) {
    throw error;
  }
};

// Actualiza una reserva existente
// PUT: /api/reservas/actualizar/{id}
export const updateReserva = async (id, reserva) => {
  try {
    const apiReserva = mapReservaToAPI(reserva);
    const response = await apiPut(`/api/reservas/actualizar/${id}`, apiReserva);
    return response;
  } catch (error) {
    throw error;
  }
};

// Elimina una reserva
// DELETE: /api/reservas/eliminar/{id}
export const deleteReserva = async (id) => {
  try {
    const response = await apiDelete(`/api/reservas/eliminar/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// RESERVAS - APROBACIÓN Y RECHAZO
//  Aprueba una reserva (cambia estado a true, limpia motivo rechazo)
export const approveReserva = async (id, reserva) => {
  try {
    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      tiempoTolerancia: reserva.tiempoTolerancia || '00:15:00',
      comensales: reserva.comensales,
      estado: true,
      fechaCreacion: reserva.fechaCreacion,
      motivoRechazo: null  // Limpiar motivo rechazo
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    throw error;
  }
};

// Rechaza una reserva (cambia estado a false con motivo)
export const rejectReserva = async (id, reserva, motivo = '') => {
  try {    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      tiempoTolerancia: reserva.tiempoTolerancia || '00:15:00',
      comensales: reserva.comensales,
      estado: false,
      fechaCreacion: reserva.fechaCreacion,
      motivoRechazo: motivo
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cancela una reserva (por el usuario o admin)
export const cancelReserva = async (id, reserva, motivo = 'Cancelada por el usuario') => {
  try {
    
    const updatedReserva = {
      iD_Reserva: reserva.iD_Reserva,
      iD_Usuario: reserva.iD_Usuario,
      iD_Comercio: reserva.iD_Comercio,
      fechaReserva: reserva.fechaReserva,
      tiempoTolerancia: reserva.tiempoTolerancia || '00:15:00',
      comensales: reserva.comensales,
      estado: false,
      fechaCreacion: reserva.fechaCreacion,
      motivoRechazo: motivo
    };
    
    const response = await updateReserva(id, updatedReserva);
    return response;
  } catch (error) {
    throw error;
  }
};

// FILTROS Y BÚSQUEDAS
// Filtra reservas activas (estado = true)
export const filterReservasActivas = (reservas) => {
  return reservas.filter(r => r.estado === true);
};

// Filtra reservas rechazadas/canceladas (estado = false)
export const filterReservasRechazadas = (reservas) => {
  return reservas.filter(r => r.estado === false);
};

// Filtra reservas por comercio
export const filterReservasByComercioId = (reservas, comercioId) => {
  return reservas.filter(r => r.iD_Comercio === comercioId);
};

// Filtra reservas por usuario
export const filterReservasByUserId = (reservas, userId) => {
  return reservas.filter(r => r.iD_Usuario === userId);
};

// Filtra reservas por estado
export const filterReservasByEstado = (reservas, estado) => {
  if (estado === null) {
    // Pendientes: estado = false y sin motivo de rechazo
    return reservas.filter(r => r.estado === false && !r.motivoRechazo);
  }
  return reservas.filter(r => r.estado === estado);
};

// Obtiene reservas de hoy
export const filterReservasHoy = (reservas) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return reservas.filter(r => {
    const fechaReserva = new Date(r.fechaReserva);
    fechaReserva.setHours(0, 0, 0, 0);
    return fechaReserva.getTime() === hoy.getTime();
  });
};

// Obtiene reservas futuras (desde hoy en adelante)
export const filterReservasFuturas = (reservas) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return reservas.filter(r => {
    const fechaReserva = new Date(r.fechaReserva);
    return fechaReserva >= hoy;
  });
};

// Alias para filterReservasFuturas
export const getFutureReservas = filterReservasFuturas;

// Obtiene reservas pasadas
export const filterReservasPasadas = (reservas) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  return reservas.filter(r => {
    const fechaReserva = new Date(r.fechaReserva);
    return fechaReserva < hoy;
  });
};

// Alias para filterReservasPasadas
export const getPastReservas = filterReservasPasadas;

// ESTADÍSTICAS DE RESERVAS
// Calcula estadísticas generales de reservas
export const getEstadisticasReservas = (reservas) => {
  const activas = filterReservasActivas(reservas);
  const rechazadas = filterReservasRechazadas(reservas);
  const hoy = filterReservasHoy(reservas);
  const futuras = filterReservasFuturas(reservas);
  const pasadas = filterReservasPasadas(reservas);
  
  // Pendientes: estado = false y sin motivo de rechazo
  const pendientes = reservas.filter(r => r.estado === false && !r.motivoRechazo);
  
  return {
    total: reservas.length,
    activas: activas.length,
    rechazadas: rechazadas.length,
    pendientes: pendientes.length,
    hoy: hoy.length,
    futuras: futuras.length,
    pasadas: pasadas.length,
    // Tasa de aprobación
    tasaAprobacion: reservas.length > 0 
      ? ((activas.length / reservas.length) * 100).toFixed(1) 
      : 0
  };
};

// Calcula estadísticas para un comercio específico
export const getEstadisticasComercio = (reservas, comercioId) => {
  const reservasComercio = filterReservasByComercioId(reservas, comercioId);
  return getEstadisticasReservas(reservasComercio);
};

// UTILIDADES
// Formatea el tiempo de tolerancia para mostrar
export const formatTiempoTolerancia = (tiempoTolerancia) => {
  if (!tiempoTolerancia) return 'No especificado';
  
  const parts = tiempoTolerancia.split(':');
  if (parts.length < 2) return tiempoTolerancia;
  
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  
  return tiempoTolerancia;
};

// Verifica si una reserva está pendiente
export const isPendiente = (reserva) => {
  return reserva.estado === false && !reserva.motivoRechazo;
};

// Verifica si una reserva está aprobada
export const isAprobada = (reserva) => {
  return reserva.estado === true;
};

// Verifica si una reserva fue rechazada
export const isRechazada = (reserva) => {
  return reserva.estado === false && !!reserva.motivoRechazo;
};

export default {
  // CRUD
  getAllReservas,
  getReservaById,
  getReservasByUsuario,
  getReservasByUser,
  getReservasByComercio,
  createReserva,
  updateReserva,
  deleteReserva,
  
  // Aprobación/Rechazo
  approveReserva,
  rejectReserva,
  cancelReserva,
  
  // Filtros
  filterReservasActivas,
  filterReservasRechazadas,
  filterReservasByComercioId,
  filterReservasByUserId,
  filterReservasByEstado,
  filterReservasHoy,
  filterReservasFuturas,
  filterReservasPasadas,
  getFutureReservas,
  getPastReservas,
  
  // Estadísticas
  getEstadisticasReservas,
  getEstadisticasComercio,
  
  // Utilidades
  formatTiempoTolerancia,
  isPendiente,
  isAprobada,
  isRechazada,
};