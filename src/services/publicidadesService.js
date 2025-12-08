// publicidadesService.js - Servicio de publicidades con carga optimizada
import api from './api';

// HELPERS - CONVERSIÓN DE TIEMPO
// Convierte días a formato TimeSpan del backend
// 7 días = "7:00:00", 15 días = "15:00:00", 30 días = "23:00:00"
const diasToTimeSpan = (dias) => {
  // Si ya viene en formato TimeSpan válido, extraer el valor
  if (typeof dias === 'string') {
    // Remover el punto si existe (formato incorrecto)
    if (dias.includes('.')) {
      dias = parseInt(dias.split('.')[0]) || 7;
    } else if (dias.includes(':')) {
      dias = parseInt(dias.split(':')[0]) || 7;
    }
  }
  
  let numDias = parseInt(dias) || 7;

  // 30 días se representa como 23 (workaround)
  if (numDias >= 30) {
    numDias = 23;
  }
  
  // Asegurar que esté en el rango válido (1-23)
  if (numDias < 1) numDias = 7;
  if (numDias > 23) numDias = 23;
  
  return `${numDias}:00:00.000`;
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
  // Si ya viene en formato TimeSpan (string con ":"), usarlo directamente
  // Solo convertir si es un número
  let tiempoTimeSpan = publicidadData.tiempo;

  if (typeof publicidadData.tiempo === 'number') {
    tiempoTimeSpan = diasToTimeSpan(publicidadData.tiempo);
  } else if (typeof publicidadData.tiempo === 'string' && !publicidadData.tiempo.includes('.')) {
    // Si es string pero no tiene milisegundos, agregarlos
    tiempoTimeSpan = publicidadData.tiempo + '.000';
  }
  
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

// ENDPOINTS OPTIMIZADOS (CARGA RÁPIDA)
// Obtiene todas las publicidades SIN imágenes (carga rápida)
export const getAllPublicidadesAdmin = async () => {
  const response = await api.get('/api/Publicidades/listadoAdmin');
  return response.data;
};

// Obtiene las publicidades de un usuario específico
export const getPublicidadesByUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/api/Publicidades/BuscarIdUsuario/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo publicidades del usuario ${usuarioId}:`, error);
    throw error;
  }
};

// Obtiene solo la imagen de una publicidad específica
export const getPublicidadImagen = async (id) => {
  try {
    const response = await api.get(`/api/Publicidades/${id}/imagen`);
    
    if (response.data && response.data.imagen) {
      // Convertir a formato data URL si no lo tiene
      const imagen = response.data.imagen;
      if (typeof imagen === 'string' && !imagen.startsWith('data:')) {
        return `data:image/jpeg;base64,${imagen}`;
      }
      return imagen;
    }
    return null;
  } catch (error) {
    console.error(`Error cargando imagen de publicidad ${id}:`, error);
    return null;
  }
};

// Obtiene la URL directa de la imagen
export const getPublicidadImagenUrl = (id) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://dondesalimos-api.azurewebsites.net';
  return `${baseUrl}/api/Publicidades/${id}/imagen-raw`;
};

// Pre-carga un lote de imágenes en paralelo
export const preloadPublicidadImagenes = async (ids, batchSize = 5) => {
  const imagenesMap = new Map();
  
  // Procesar en lotes para no sobrecargar
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const imagen = await getPublicidadImagen(id);
        return { id, imagen };
      })
    );
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.imagen) {
        imagenesMap.set(result.value.id, result.value.imagen);
      }
    });
  }
  
  return imagenesMap;
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
  // CRUD básico
  getAllPublicidades,
  getPublicidadById,
  searchPublicidadesByComercio,
  createPublicidad,
  updatePublicidad,
  deletePublicidad,
  incrementarVisualizacion,
  
  // Optimizados (carga rápida)
  getAllPublicidadesAdmin,
  getPublicidadesByUsuario,
  getPublicidadImagen,
  getPublicidadImagenUrl,
  preloadPublicidadImagenes,
  
  // Aprobación/Rechazo
  aprobarPublicidad,
  rechazarPublicidad,
  
  // Filtros
  filterPublicidadesActivas,
  filterPublicidadesPendientes,
  filterPublicidadesRechazadas,
  filterPublicidadesSinPagar,
  
  // Utilidades
  calcularFechaExpiracion,
  calcularDiasRestantes,
  formatTimeSpanToDays,
  getPublicidadEstado,
  getPublicidadesStats,
};