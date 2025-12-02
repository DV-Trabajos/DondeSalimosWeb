// publicidadesService.js - Servicio de publicidades
import api from './api';

// HELPERS
// Convierte días a formato TimeSpan del backend C#
const diasToTimeSpan = (dias) => {
  let numDias = parseInt(dias) || 7;
  
  // 30 días se representa como 23 (máximo permitido por TimeSpan horas)
  if (numDias >= 30) {
    numDias = 23;
  }
  
  return `${numDias}:00:00`;
};

// Convierte TimeSpan del backend a días
export const formatTimeSpanToDays = (tiempo) => {
  if (!tiempo) return 7;
  if (typeof tiempo === 'number') {
    // Si es 23, devolver 30
    return tiempo === 23 ? 30 : tiempo;
  }
  
  const str = String(tiempo);
  let dias = 7;
  
  // Formato "15.00:00:00" (días.horas:minutos:segundos)
  if (str.includes('.')) {
    dias = parseInt(str.split('.')[0]) || 7;
  } else {
    // Formato "15:00:00" (horas:minutos:segundos) - el primer número son los "días"
    const partes = str.split(':');
    if (partes.length > 0) {
      dias = parseInt(partes[0]) || 7;
    }
  }
  
  // Workaround: 23 significa 30 días
  return dias === 23 ? 30 : dias;
};

// OPERACIONES CRUD
// Obtiene todas las publicidades
// GET: api/publicidades/listado
export const getAllPublicidades = async () => {
  const response = await api.get('/api/Publicidades/listado');
  return response.data;
};

// Obtiene una publicidad por ID
// GET: api/publicidades/buscarIdPublicidad/{id}
export const getPublicidadById = async (id) => {
  const response = await api.get(`/api/Publicidades/buscarIdPublicidad/${id}`);
  return response.data;
};

// Busca publicidades por nombre de comercio
// GET: api/publicidades/buscarNombreComercio/{comercio}
export const searchPublicidadesByComercio = async (nombreComercio) => {
  const response = await api.get(`/api/Publicidades/buscarNombreComercio/${nombreComercio}`);
  return response.data;
};

// Crea una nueva publicidad
// POST: api/publicidades/crear
export const createPublicidad = async (publicidadData) => {
  // Convertir días a TimeSpan
  const tiempoTimeSpan = diasToTimeSpan(publicidadData.tiempo);
  
  // El backend espera campos en PascalCase
  const dataToSend = {
    Descripcion: publicidadData.descripcion || '',
    Visualizaciones: 0,
    Tiempo: tiempoTimeSpan,  // TimeSpan: "7:00:00", "15:00:00", "23:00:00" (23=30días)
    Imagen: publicidadData.imagen || null,  // null si no hay imagen, no string vacío
    Estado: false,           // Pendiente de aprobación
    Pago: false,             // Pendiente de pago
    FechaCreacion: new Date().toISOString(),
    ID_Comercio: parseInt(publicidadData.iD_Comercio),
    MotivoRechazo: null,
  };

  const response = await api.post('/api/Publicidades/crear', dataToSend);
  return response.data;
};

// Actualiza una publicidad
// PUT: api/publicidades/actualizar/{id}
export const updatePublicidad = async (id, publicidadData) => {
  // Convertir tiempo si es necesario
  let tiempo = publicidadData.tiempo;
  if (typeof tiempo === 'number') {
    tiempo = diasToTimeSpan(tiempo);
  }

  const dataToSend = {
    ID_Publicidad: parseInt(id),
    Descripcion: publicidadData.descripcion || publicidadData.Descripcion || '',
    Visualizaciones: publicidadData.visualizaciones || publicidadData.Visualizaciones || 0,
    Tiempo: tiempo,
    Imagen: publicidadData.imagen || publicidadData.Imagen || '',
    Estado: publicidadData.estado ?? publicidadData.Estado ?? false,
    Pago: publicidadData.pago ?? publicidadData.Pago ?? false,
    FechaCreacion: publicidadData.fechaCreacion || publicidadData.FechaCreacion || new Date().toISOString(),
    ID_Comercio: parseInt(publicidadData.iD_Comercio || publicidadData.ID_Comercio),
    MotivoRechazo: publicidadData.motivoRechazo || publicidadData.MotivoRechazo || null,
  };

  const response = await api.put(`/api/Publicidades/actualizar/${id}`, dataToSend);
  return response.data;
};

// Elimina una publicidad
// DELETE: api/publicidades/eliminar/{id}
export const deletePublicidad = async (id) => {
  const response = await api.delete(`/api/Publicidades/eliminar/${id}`);
  return response.data;
};

// Incrementa las visualizaciones
// PUT: api/publicidades/incrementar-visualizacion/{id}
export const incrementarVisualizacion = async (id) => {
  const response = await api.put(`/api/Publicidades/incrementar-visualizacion/${id}`);
  return response.data;
};

// APROBACIÓN/RECHAZO (Admin)
// Aprueba una publicidad
export const aprobarPublicidad = async (id, publicidadData) => {
  return updatePublicidad(id, {
    ...publicidadData,
    estado: true,
    motivoRechazo: null,
  });
};

// Rechaza una publicidad con motivo
export const rechazarPublicidad = async (id, publicidadData, motivo) => {
  return updatePublicidad(id, {
    ...publicidadData,
    estado: false,
    motivoRechazo: motivo,
  });
};

// FILTROS
export const filterPublicidadesActivas = (publicidades) => {
  const now = new Date();
  return publicidades.filter(pub => {
    if (!pub.estado || !pub.pago) return false;
    const fechaExp = calcularFechaExpiracion(pub);
    return fechaExp > now;
  });
};

export const filterPublicidadesPendientes = (publicidades) => {
  return publicidades.filter(pub => !pub.estado && !pub.motivoRechazo);
};

export const filterPublicidadesRechazadas = (publicidades) => {
  return publicidades.filter(pub => !pub.estado && pub.motivoRechazo);
};

export const filterPublicidadesSinPagar = (publicidades) => {
  return publicidades.filter(pub => pub.estado && !pub.pago);
};

// UTILIDADES
export const calcularFechaExpiracion = (publicidad) => {
  const fechaCreacion = new Date(publicidad.fechaCreacion || publicidad.FechaCreacion);
  const dias = formatTimeSpanToDays(publicidad.tiempo || publicidad.Tiempo);
  fechaCreacion.setDate(fechaCreacion.getDate() + dias);
  return fechaCreacion;
};

export const calcularDiasRestantes = (publicidad) => {
  const fechaExp = calcularFechaExpiracion(publicidad);
  const diffTime = fechaExp - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getPublicidadEstado = (publicidad) => {
  if (!publicidad.estado && publicidad.motivoRechazo) {
    return { estado: 'rechazada', color: 'red', texto: 'Rechazada' };
  }
  if (!publicidad.estado) {
    return { estado: 'pendiente', color: 'yellow', texto: 'Pendiente' };
  }
  if (!publicidad.pago) {
    return { estado: 'sinPagar', color: 'orange', texto: 'Sin pagar' };
  }
  const dias = calcularDiasRestantes(publicidad);
  if (dias <= 0) {
    return { estado: 'expirada', color: 'gray', texto: 'Expirada' };
  }
  if (dias <= 2) {
    return { estado: 'porExpirar', color: 'orange', texto: `${dias} día(s)` };
  }
  return { estado: 'activa', color: 'green', texto: `${dias} días` };
};

export const getPublicidadesStats = (publicidades) => {
  const activas = filterPublicidadesActivas(publicidades);
  const pendientes = filterPublicidadesPendientes(publicidades);
  const rechazadas = filterPublicidadesRechazadas(publicidades);
  const sinPagar = filterPublicidadesSinPagar(publicidades);
  const totalVistas = publicidades.reduce((sum, p) => sum + (p.visualizaciones || p.Visualizaciones || 0), 0);
  
  return {
    total: publicidades.length,
    activas: activas.length,
    pendientes: pendientes.length,
    rechazadas: rechazadas.length,
    sinPagar: sinPagar.length,
    totalVisualizaciones: totalVistas,
  };
};

export default {
  getAllPublicidades,
  getPublicidadById,
  searchPublicidadesByComercio,
  createPublicidad,
  updatePublicidad,
  deletePublicidad,
  incrementarVisualizacion,
  aprobarPublicidad,
  rechazarPublicidad,
  filterPublicidadesActivas,
  filterPublicidadesPendientes,
  filterPublicidadesRechazadas,
  filterPublicidadesSinPagar,
  calcularFechaExpiracion,
  calcularDiasRestantes,
  formatTimeSpanToDays,
  getPublicidadEstado,
  getPublicidadesStats,
};