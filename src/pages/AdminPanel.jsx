// AdminPanel.jsx - Dashboard con métricas de negocio mejoradas
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Store, Megaphone, Star, Calendar,
  TrendingUp, AlertTriangle,
  BarChart3, PieChart, Activity, ArrowUpRight, Sparkles,
  RefreshCw, Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/Admin/AdminLayout';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';
import DoughnutChart from '../components/Charts/DoughnutChart';

// Servicios
import { getAllUsuarios } from '../services/usuariosService';
import { getAllComercios } from '../services/comerciosService';
import { getAllPublicidades } from '../services/publicidadesService';
import { getAllResenias } from '../services/reseniasService';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ESTADOS
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [publicidades, setPublicidades] = useState([]);
  const [resenias, setResenias] = useState([]);

  // CARGA DE DATOS
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [
        usuariosData,
        comerciosData,
        publicidadesData,
        reseniasData
      ] = await Promise.all([
        getAllUsuarios().catch(() => []),
        getAllComercios().catch(() => []),
        getAllPublicidades().catch(() => []),
        getAllResenias().catch(() => [])
      ]);

      setUsuarios(usuariosData);
      setComercios(comerciosData);
      setPublicidades(publicidadesData);
      setResenias(reseniasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // UTILIDADES DE FECHAS
  const getDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today,
      hace7dias: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      hace30dias: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      hace90dias: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      inicioMes: new Date(now.getFullYear(), now.getMonth(), 1),
      inicioAnio: new Date(now.getFullYear(), 0, 1),
      hace12meses: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    };
  };

  const filterByDateRange = (items, dateField, startDate, endDate = new Date()) => {
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Agrupar por mes (para gráficos de tendencia)
  const groupByMonth = (items, dateField, monthsBack = 12) => {
    const now = new Date();
    const months = [];
    
    // Crear array de últimos N meses
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        count: 0
      });
    }

    // Contar items por mes
    items.forEach(item => {
      const itemDate = new Date(item[dateField]);
      const monthIndex = months.findIndex(m => 
        m.year === itemDate.getFullYear() && m.month === itemDate.getMonth()
      );
      if (monthIndex !== -1) {
        months[monthIndex].count++;
      }
    });

    return months;
  };

  // Agrupar por día (para gráficos de actividad reciente)
  const groupByDay = (items, dateField, daysBack = 30) => {
    const now = new Date();
    const days = [];
    
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        count: 0
      });
    }

    items.forEach(item => {
      const itemDate = new Date(item[dateField]).toISOString().split('T')[0];
      const dayIndex = days.findIndex(d => d.date === itemDate);
      if (dayIndex !== -1) {
        days[dayIndex].count++;
      }
    });

    return days;
  };

  // ESTADÍSTICAS PRINCIPALES
  const stats = useMemo(() => {
    const ranges = getDateRanges();

    // ========== USUARIOS ==========
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter(u => u.estado === true).length;
    const usuariosInactivos = usuarios.filter(u => u.estado === false).length;
    const solicitudesReactivacion = usuarios.filter(u => u.solicitudReactivacion === true && u.estado === false).length;
    
    // Nuevos usuarios por período
    const usuariosNuevos7d = filterByDateRange(usuarios, 'fechaCreacion', ranges.hace7dias).length;
    const usuariosNuevos30d = filterByDateRange(usuarios, 'fechaCreacion', ranges.hace30dias).length;
    const usuariosNuevosMes = filterByDateRange(usuarios, 'fechaCreacion', ranges.inicioMes).length;

    // COMERCIOS 
    const totalComercios = comercios.length;
    const comerciosAprobados = comercios.filter(c => c.estado === true).length;
    const comerciosPendientes = comercios.filter(c => c.estado === false && !c.motivoRechazo).length;
    const comerciosRechazados = comercios.filter(c => c.estado === false && c.motivoRechazo).length;
    
    // Nuevos comercios por período
    const comerciosNuevos7d = filterByDateRange(comercios, 'fechaCreacion', ranges.hace7dias).length;
    const comerciosNuevos30d = filterByDateRange(comercios, 'fechaCreacion', ranges.hace30dias).length;
    const comerciosNuevosMes = filterByDateRange(comercios, 'fechaCreacion', ranges.inicioMes).length;
    
    // Tasa de aprobación
    const tasaAprobacion = totalComercios > 0 
      ? Math.round((comerciosAprobados / totalComercios) * 100) 
      : 0;

    // PUBLICIDADES
    const totalPublicidades = publicidades.length;
    const publicidadesActivas = publicidades.filter(p => p.estado === true).length;
    const publicidadesPendientes = publicidades.filter(p => p.estado === false && !p.motivoRechazo).length;
    const publicidadesRechazadas = publicidades.filter(p => p.estado === false && p.motivoRechazo).length;
    const publicidadesPagadas = publicidades.filter(p => p.pago === true).length;
    const publicidadesSinPagar = publicidades.filter(p => p.estado === true && p.pago === false).length;
    
    // Publicidades por período
    const publicidadesNuevas30d = filterByDateRange(publicidades, 'fechaCreacion', ranges.hace30dias).length;
    const publicidadesPagadasMes = filterByDateRange(
      publicidades.filter(p => p.pago === true), 
      'fechaCreacion', 
      ranges.inicioMes
    ).length;
    
    // Visualizaciones totales
    const totalVisualizaciones = publicidades.reduce((sum, p) => sum + (p.visualizaciones || 0), 0);
    const visualizacionesActivas = publicidades
      .filter(p => p.estado === true && p.pago === true)
      .reduce((sum, p) => sum + (p.visualizaciones || 0), 0);

    // RESEÑAS
    const totalResenias = resenias.length;
    const reseniasActivas = resenias.filter(r => r.estado === true).length;
    const reseniasPendientes = resenias.filter(r => r.estado === false && !r.motivoRechazo).length;
    const reseniasRechazadas = resenias.filter(r => r.estado === false && r.motivoRechazo).length;
    
    // Reseñas por período
    const reseniasNuevas7d = filterByDateRange(resenias, 'fechaCreacion', ranges.hace7dias).length;
    const reseniasNuevas30d = filterByDateRange(resenias, 'fechaCreacion', ranges.hace30dias).length;
    
    // Promedio de puntuación
    const reseniasConPuntuacion = resenias.filter(r => r.puntuacion > 0);
    const promedioPuntuacion = reseniasConPuntuacion.length > 0
      ? (reseniasConPuntuacion.reduce((sum, r) => sum + r.puntuacion, 0) / reseniasConPuntuacion.length).toFixed(1)
      : 0;

    // TOTALES PENDIENTES
    const totalPendientes = comerciosPendientes + publicidadesPendientes + solicitudesReactivacion;

    return {
      // Usuarios
      totalUsuarios, usuariosActivos, usuariosInactivos, solicitudesReactivacion,
      usuariosNuevos7d, usuariosNuevos30d, usuariosNuevosMes,
      
      // Comercios
      totalComercios, comerciosAprobados, comerciosPendientes, comerciosRechazados,
      comerciosNuevos7d, comerciosNuevos30d, comerciosNuevosMes, tasaAprobacion,
      
      // Publicidades
      totalPublicidades, publicidadesActivas, publicidadesPendientes, publicidadesRechazadas,
      publicidadesPagadas, publicidadesSinPagar, publicidadesNuevas30d, publicidadesPagadasMes,
      totalVisualizaciones, visualizacionesActivas,
      
      // Reseñas
      totalResenias, reseniasActivas, reseniasPendientes, reseniasRechazadas,
      reseniasNuevas7d, reseniasNuevas30d, promedioPuntuacion,
      
      // General
      totalPendientes
    };
  }, [usuarios, comercios, publicidades, resenias]);

  // DATOS PARA GRÁFICOS DE TENDENCIA (12 meses)
  const trendData = useMemo(() => {
    // Crecimiento mensual de usuarios
    const usuariosPorMes = groupByMonth(usuarios, 'fechaCreacion', 12);
    
    // Crecimiento mensual de comercios
    const comerciosPorMes = groupByMonth(comercios, 'fechaCreacion', 12);
    
    // Publicidades por mes
    const publicidadesPorMes = groupByMonth(publicidades, 'fechaCreacion', 12);
    
    // Publicidades pagadas por mes
    const publicidadesPagadasPorMes = groupByMonth(
      publicidades.filter(p => p.pago === true), 
      'fechaCreacion', 
      12
    );

    return {
      usuariosPorMes,
      comerciosPorMes,
      publicidadesPorMes,
      publicidadesPagadasPorMes
    };
  }, [usuarios, comercios, publicidades]);

  // DATOS PARA GRÁFICOS DE ACTIVIDAD (30 días)
  const activityData = useMemo(() => {
    
    // Reseñas por día
    const reseniasPorDia = groupByDay(resenias, 'fechaCreacion', 30);
    
    // Registros (usuarios + comercios) por día
    const registrosPorDia = groupByDay(
      [...usuarios, ...comercios], 
      'fechaCreacion', 
      30
    );

    return {
      reseniasPorDia,
      registrosPorDia
    };
  }, [usuarios, comercios, resenias]);

  // DATOS PARA CHART.JS
  // Gráfico: Crecimiento mensual (Line Chart)
  const crecimientoMensualData = useMemo(() => ({
    labels: trendData.usuariosPorMes.map(m => m.label),
    datasets: [
      {
        label: 'Usuarios',
        data: trendData.usuariosPorMes.map(m => m.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Comercios',
        data: trendData.comerciosPorMes.map(m => m.count),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }), [trendData]);

  // Gráfico: Publicidades y pagos (Bar Chart)
  const publicidadesChartData = useMemo(() => ({
    labels: trendData.publicidadesPorMes.map(m => m.label),
    datasets: [
      {
        label: 'Nuevas',
        data: trendData.publicidadesPorMes.map(m => m.count),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1
      },
      {
        label: 'Pagadas',
        data: trendData.publicidadesPagadasPorMes.map(m => m.count),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  }), [trendData]);

  // Gráfico: Actividad últimos 30 días (Line Chart)
  const actividadRecienteData = useMemo(() => ({
    labels: activityData.reseniasPorDia.map(d => d.label),
    datasets: [
      {
        label: 'Reseñas',
        data: activityData.reseniasPorDia.map(d => d.count),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: false,
        tension: 0.4
      }
    ]
  }), [activityData]);

  // Gráfico: Estado de comercios (Doughnut)
  const comerciosEstadoData = useMemo(() => ({
    labels: ['Aprobados', 'Pendientes', 'Rechazados'],
    datasets: [{
      data: [stats.comerciosAprobados, stats.comerciosPendientes, stats.comerciosRechazados],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  }), [stats]);

  // Gráfico: Estado de publicidades (Doughnut)
  const publicidadesEstadoData = useMemo(() => ({
    labels: ['Activas/Pagadas', 'Sin Pagar', 'Pendientes', 'Rechazadas'],
    datasets: [{
      data: [
        stats.publicidadesPagadas, 
        stats.publicidadesSinPagar, 
        stats.publicidadesPendientes, 
        stats.publicidadesRechazadas
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(251, 191, 36)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2
    }]
  }), [stats]);

  // COMPONENTES Y RENDER
  // Componente: Tarjeta de estadística simple
  const StatCard = ({ icon, title, value, subtitle, gradient, lightBg, badge, onClick }) => (
    <div 
      onClick={onClick}
      className={`${lightBg} rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {badge > 0 && (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full animate-pulse">
            {badge} pendiente{badge !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-gray-600 font-medium">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="mt-3 flex items-center text-sm text-gray-500 group-hover:text-gray-700">
        <span>Ver detalles</span>
        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </div>
    </div>
  );

  // Componente: Mini stat para el hero
  const MiniStat = ({ label, value, trend, icon, warning }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-white/80">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-white/70 text-sm">{label}</p>
          {trend && (
            <p className={`text-xs mt-1 ${warning ? 'text-amber-300' : 'text-emerald-300'}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Componente: Tarjeta de gráfico
  const ChartCard = ({ title, subtitle, icon, iconGradient, children, action }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  // Componente: Item de actividad pendiente
  const PendingItem = ({ icon, label, count, color, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full p-3 rounded-xl ${color} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold text-lg">{count}</span>
    </button>
  );

  // RENDER - LOADING STATE
  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Cargando estadísticas...">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Cargando datos del dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  // RENDER PRINCIPAL
  return (
    <AdminLayout>
      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 md:p-8 mb-6">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative">
          {/* Header del Hero */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Panel de Administración</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                ¡Hola, {user?.nombreUsuario || 'Admin'}! 👋
              </h2>
              <p className="text-gray-400 mt-1">
                Aquí está el resumen de tu plataforma
              </p>
            </div>
            <button 
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-all duration-300 self-start md:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {/* Mini Stats en el Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat 
              label="Total Usuarios" 
              value={stats.totalUsuarios} 
              trend={`+${stats.usuariosNuevos30d} últimos 30 días`}
              icon={<Users className="w-5 h-5" />}
            />
            <MiniStat 
              label="Comercios Activos" 
              value={stats.comerciosAprobados} 
              trend={`${stats.comerciosPendientes} pendientes`}
              icon={<Store className="w-5 h-5" />}
              warning={stats.comerciosPendientes > 0}
            />
            <MiniStat 
              label="Publicidades Activas" 
              value={stats.publicidadesPagadas} 
              trend={`${stats.publicidadesSinPagar} sin pagar`}
              icon={<Megaphone className="w-5 h-5" />}
              warning={stats.publicidadesSinPagar > 0}
            />
          </div>
        </div>
      </div>

      {/* ALERTAS PENDIENTES */}
      {stats.totalPendientes > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {stats.totalPendientes} elemento{stats.totalPendientes !== 1 ? 's' : ''} requiere{stats.totalPendientes === 1 ? '' : 'n'} atención
                </h3>
                <p className="text-gray-600 text-sm">Revisa los items pendientes de aprobación</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              {stats.comerciosPendientes > 0 && (
                <button
                  onClick={() => navigate('/admin/comercios')}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  {stats.comerciosPendientes} Comercio{stats.comerciosPendientes !== 1 ? 's' : ''}
                </button>
              )}
              {stats.publicidadesPendientes > 0 && (
                <button
                  onClick={() => navigate('/admin/publicidades')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                >
                  {stats.publicidadesPendientes} Publicidad{stats.publicidadesPendientes !== 1 ? 'es' : ''}
                </button>
              )}
              {stats.solicitudesReactivacion > 0 && (
                <button
                  onClick={() => navigate('/admin/usuarios')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {stats.solicitudesReactivacion} Reactivación{stats.solicitudesReactivacion !== 1 ? 'es' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />} 
          title="Usuarios" 
          value={stats.totalUsuarios} 
          subtitle={`${stats.usuariosActivos} activos`} 
          gradient="from-blue-500 to-cyan-500"
          lightBg="bg-blue-50"
          onClick={() => navigate('/admin/usuarios')} 
        />
        <StatCard 
          icon={<Store className="w-6 h-6 text-white" />} 
          title="Comercios" 
          value={stats.totalComercios} 
          subtitle={`${stats.comerciosAprobados} aprobados`} 
          gradient="from-emerald-500 to-teal-500"
          lightBg="bg-emerald-50"
          badge={stats.comerciosPendientes} 
          onClick={() => navigate('/admin/comercios')} 
        />
        <StatCard 
          icon={<Megaphone className="w-6 h-6 text-white" />} 
          title="Publicidades" 
          value={stats.totalPublicidades} 
          subtitle={`${stats.publicidadesPagadas} pagadas`} 
          gradient="from-purple-500 to-pink-500"
          lightBg="bg-purple-50"
          badge={stats.publicidadesPendientes} 
          onClick={() => navigate('/admin/publicidades')} 
        />
        <StatCard 
          icon={<Star className="w-6 h-6 text-white" />} 
          title="Reseñas" 
          value={stats.totalResenias} 
          subtitle={`Promedio: ${stats.promedioPuntuacion}★`} 
          gradient="from-amber-500 to-yellow-500"
          lightBg="bg-amber-50"
          onClick={() => navigate('/admin/resenias')} 
        />
      </div>

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico: Crecimiento Mensual */}
        <ChartCard
          title="Crecimiento Mensual"
          subtitle="Usuarios y comercios - Últimos 12 meses"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          iconGradient="from-blue-500 to-cyan-500"
        >
          <LineChart data={crecimientoMensualData} height={280} />
        </ChartCard>

        {/* Gráfico: Publicidades por Mes */}
        <ChartCard
          title="Publicidades por Mes"
          subtitle="Nuevas vs Pagadas - Últimos 12 meses"
          icon={<Megaphone className="w-5 h-5 text-white" />}
          iconGradient="from-emerald-500 to-teal-500"
        >
          <BarChart data={publicidadesChartData} height={280} />
        </ChartCard>
      </div>

      {/* GRÁFICOS SECUNDARIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico: Actividad Reciente */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Actividad Reciente"
            subtitle="Reseñas - Últimos 30 días"
            icon={<Activity className="w-5 h-5 text-white" />}
            iconGradient="from-purple-500 to-pink-500"
          >
            <LineChart data={actividadRecienteData} height={250} />
          </ChartCard>
        </div>

        {/* Gráfico: Estado de Comercios */}
        <ChartCard
          title="Estado de Comercios"
          subtitle="Distribución actual"
          icon={<PieChart className="w-5 h-5 text-white" />}
          iconGradient="from-amber-500 to-orange-500"
        >
          <DoughnutChart data={comerciosEstadoData} height={250} />
        </ChartCard>
      </div>

      {/* GRÁFICO DE PUBLICIDADES + RESUMEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico: Estado de Publicidades */}
        <ChartCard
          title="Estado de Publicidades"
          subtitle="Distribución por estado"
          icon={<Megaphone className="w-5 h-5 text-white" />}
          iconGradient="from-purple-500 to-pink-500"
        >
          <DoughnutChart data={publicidadesEstadoData} height={250} />
        </ChartCard>

        {/* Resumen de Métricas Clave */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Resumen del Período</h3>
              <p className="text-sm text-gray-500">Métricas clave de los últimos 30 días</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Usuarios nuevos */}
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.usuariosNuevos30d}</p>
              <p className="text-sm text-blue-600 font-medium">Usuarios nuevos</p>
              <p className="text-xs text-blue-500 mt-1">+{stats.usuariosNuevos7d} esta semana</p>
            </div>

            {/* Comercios nuevos */}
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.comerciosNuevos30d}</p>
              <p className="text-sm text-emerald-600 font-medium">Comercios nuevos</p>
              <p className="text-xs text-emerald-500 mt-1">Aprobación: {stats.tasaAprobacion}%</p>
            </div>

            {/* Reseñas */}
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.reseniasNuevas30d}</p>
              <p className="text-sm text-amber-600 font-medium">Reseñas</p>
              <p className="text-xs text-amber-500 mt-1">Promedio: {stats.promedioPuntuacion}★</p>
            </div>
          </div>

          {/* Indicadores de publicidades */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Publicidades - Métricas de Negocio
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Pagadas</p>
                  <p className="font-bold text-gray-900">{stats.publicidadesPagadas}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Sin pagar</p>
                  <p className="font-bold text-gray-900">{stats.publicidadesSinPagar}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="font-bold text-gray-900">{stats.publicidadesPendientes}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-500">Visualizaciones</p>
                  <p className="font-bold text-gray-900">{stats.totalVisualizaciones.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;