// adminStatsService.js - Servicio con estadísticas detalladas y análisis de tendencias
import { 
  getAllUsuarios, 
  getAllComercios, 
  getAllPublicidades, 
  getAllResenias 
} from './adminService';
import { getAllReservas } from './reservasService';

//Obtiene estadísticas completas del sistema
export const getDetailedAdminStats = async () => {
  try {
    const [usuarios, comercios, publicidades, resenias, reservas] = await Promise.all([
      getAllUsuarios(),
      getAllComercios(),
      getAllPublicidades(),
      getAllResenias(),
      getAllReservas().catch(() => []) // Si falla, devuelve array vacío
    ]);

    // ESTADÍSTICAS DE USUARIOS
    const usuariosActivos = usuarios.filter(u => u.estado === true);
    const usuariosInactivos = usuarios.filter(u => u.estado === false);
    const usuariosPorRol = {
      comunes: usuarios.filter(u => u.iD_RolUsuario === 1).length,
      admin: usuarios.filter(u => u.iD_RolUsuario === 2).length,
      comercios: usuarios.filter(u => u.iD_RolUsuario === 3).length,
    };

    // ESTADÍSTICAS DE COMERCIOS
    const comerciosAprobados = comercios.filter(c => c.estado === true);
    const comerciosPendientes = comercios.filter(c => !c.estado && !c.motivoRechazo);
    const comerciosRechazados = comercios.filter(c => !c.estado && c.motivoRechazo);
    
    const comerciosPorTipo = comercios.reduce((acc, c) => {
      const tipo = c.iD_TipoComercio || 'Sin tipo';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    // ESTADÍSTICAS DE PUBLICIDADES
    const publicidadesActivas = publicidades.filter(p => p.estado === true);
    const publicidadesPendientes = publicidades.filter(p => !p.estado && !p.motivoRechazo);
    const publicidadesRechazadas = publicidades.filter(p => !p.estado && p.motivoRechazo);
    const totalVisualizaciones = publicidades.reduce((sum, p) => sum + (p.visualizaciones || 0), 0);

    // ESTADÍSTICAS DE RESEÑAS
    const promedioCalificacion = resenias.length > 0
      ? (resenias.reduce((sum, r) => sum + (r.puntuacion || 0), 0) / resenias.length).toFixed(1)
      : 0;
    
    const reseniasPorCalificacion = {
      5: resenias.filter(r => r.puntuacion === 5).length,
      4: resenias.filter(r => r.puntuacion === 4).length,
      3: resenias.filter(r => r.puntuacion === 3).length,
      2: resenias.filter(r => r.puntuacion === 2).length,
      1: resenias.filter(r => r.puntuacion === 1).length,
    };

    // ESTADÍSTICAS DE RESERVAS
    const reservasConfirmadas = reservas.filter(r => r.estado === 'Confirmada' || r.estado === true).length;
    const reservasPendientes = reservas.filter(r => r.estado === 'Pendiente').length;
    const reservasCanceladas = reservas.filter(r => r.estado === 'Cancelada' || r.estado === false).length;

    // ACTIVIDAD RECIENTE
    const actividadReciente = getRecentActivity(usuarios, comercios, resenias, reservas);

    // ALERTAS Y PENDIENTES
    const alertas = {
      comerciosPendientes: comerciosPendientes.map(c => ({
        id: c.iD_Comercio,
        title: c.nombre,
        description: `Esperando aprobación desde ${formatDate(c.fechaCreacion)}`,
        badge: c.iD_TipoComercio ? getTipoComercioNombre(c.iD_TipoComercio) : null,
        onClick: () => window.location.href = `/admin/comercios?id=${c.iD_Comercio}`
      })),
      publicidadesPendientes: publicidadesPendientes.map(p => ({
        id: p.iD_Publicidad,
        title: p.comercio?.nombre || 'Publicidad',
        description: p.descripcion,
        badge: `${p.tiempo} días`,
        onClick: () => window.location.href = `/admin/publicidades?id=${p.iD_Publicidad}`
      }))
    };

    return {
      // Resumen general
      resumen: {
        totalUsuarios: usuarios.length,
        totalComercios: comercios.length,
        totalPublicidades: publicidades.length,
        totalResenias: resenias.length,
        totalReservas: reservas.length,
      },
      
      // Usuarios
      usuarios: {
        total: usuarios.length,
        activos: usuariosActivos.length,
        inactivos: usuariosInactivos.length,
        porRol: usuariosPorRol,
        porcentajeActivos: usuarios.length > 0 
          ? ((usuariosActivos.length / usuarios.length) * 100).toFixed(1)
          : 0
      },
      
      // Comercios
      comercios: {
        total: comercios.length,
        aprobados: comerciosAprobados.length,
        pendientes: comerciosPendientes.length,
        rechazados: comerciosRechazados.length,
        porTipo: comerciosPorTipo,
        porcentajeAprobados: comercios.length > 0
          ? ((comerciosAprobados.length / comercios.length) * 100).toFixed(1)
          : 0
      },
      
      // Publicidades
      publicidades: {
        total: publicidades.length,
        activas: publicidadesActivas.length,
        pendientes: publicidadesPendientes.length,
        rechazadas: publicidadesRechazadas.length,
        totalVisualizaciones,
        promedioVisualizaciones: publicidades.length > 0
          ? (totalVisualizaciones / publicidades.length).toFixed(0)
          : 0
      },
      
      // Reseñas
      resenias: {
        total: resenias.length,
        promedioCalificacion,
        porCalificacion: reseniasPorCalificacion
      },
      
      // Reservas
      reservas: {
        total: reservas.length,
        confirmadas: reservasConfirmadas,
        pendientes: reservasPendientes,
        canceladas: reservasCanceladas,
        tasaConfirmacion: reservas.length > 0
          ? ((reservasConfirmadas / reservas.length) * 100).toFixed(1)
          : 0
      },
      
      // Actividad reciente
      actividadReciente,
      
      // Alertas
      alertas
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas detalladas:', error);
    throw error;
  }
};

//Obtiene actividad reciente del sistema
const getRecentActivity = (usuarios, comercios, resenias, reservas) => {
  const actividades = [];
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Usuarios recientes
  usuarios
    .filter(u => new Date(u.fechaCreacion) >= last7Days)
    .forEach(u => {
      actividades.push({
        tipo: 'usuario',
        icon: '👤',
        titulo: 'Nuevo usuario registrado',
        descripcion: u.nombreUsuario,
        fecha: new Date(u.fechaCreacion)
      });
    });

  // Comercios recientes
  comercios
    .filter(c => new Date(c.fechaCreacion) >= last7Days)
    .forEach(c => {
      actividades.push({
        tipo: 'comercio',
        icon: '🏪',
        titulo: 'Nuevo comercio registrado',
        descripcion: c.nombre,
        fecha: new Date(c.fechaCreacion)
      });
    });

  // Reseñas recientes
  resenias
    .filter(r => new Date(r.fechaCreacion) >= last7Days)
    .slice(0, 5)
    .forEach(r => {
      actividades.push({
        tipo: 'resenia',
        icon: '⭐',
        titulo: 'Nueva reseña',
        descripcion: `${r.usuario?.nombreUsuario || 'Usuario'} en ${r.comercio?.nombre || 'Comercio'}`,
        fecha: new Date(r.fechaCreacion)
      });
    });

  // Reservas recientes
  reservas
    .filter(r => new Date(r.fechaCreacion || r.fecha) >= last7Days)
    .slice(0, 5)
    .forEach(r => {
      actividades.push({
        tipo: 'reserva',
        icon: '📅',
        titulo: 'Nueva reserva',
        descripcion: `Reserva en ${r.comercio?.nombre || 'Comercio'}`,
        fecha: new Date(r.fechaCreacion || r.fecha)
      });
    });

  // Ordenar por fecha descendente y retornar las últimas 10
  return actividades
    .sort((a, b) => b.fecha - a.fecha)
    .slice(0, 10);
};

//Formatea fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

//Obtiene nombre del tipo de comercio
const getTipoComercioNombre = (tipo) => {
  const tipos = {
    1: 'Bar',
    2: 'Boliche',
    3: 'Restaurante'
  };
  return tipos[tipo] || 'Otro';
};

export default {
  getDetailedAdminStats,
  getRecentActivity,
};
