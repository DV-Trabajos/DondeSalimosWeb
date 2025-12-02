// AdminReservas.jsx - Gestión completa de reservas en panel admin
import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Edit, Users, Store, Plus } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import ReservaDetailModal from '../../components/Admin/ReservaDetailModal';
import RejectReservaModal from '../../components/Admin/RejectReservaModal';
import CreateReservaModal from '../../components/Admin/CreateReservaModal';
import { ConfirmationModal } from '../../components/Modals';
import { useNotification } from '../../hooks/useNotification';
import { 
  getAllReservas,
  approveReserva,
  rejectReserva,
  cancelReserva,
  formatTiempoTolerancia,
  createReserva as createReservaService,
  updateReserva as updateReservaService
} from '../../services/reservasService';
import { getAllUsuarios } from '../../services/usuariosService';
import { getAllComercios } from '../../services/comerciosService';
import { formatDate, formatTime } from '../../utils/formatters';

const AdminReservas = () => {
  // Estados principales
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError, warning } = useNotification();

  // Estados de filtros (ESTILO USUARIOS/COMERCIOS)
  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const [selectedReserva, setSelectedReserva] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reservasData, usuariosData, comerciosData] = await Promise.all([
        getAllReservas(),
        getAllUsuarios(),
        getAllComercios()
      ]);
      
      // Ordenar por fecha más reciente primero
      const sorted = reservasData.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
      setReservas(sorted);
      setUsuarios(usuariosData);
      setComercios(comerciosData);
    } catch (err) {
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // FILTROS (ESTILO USUARIOS/COMERCIOS)
  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por búsqueda (usuario o comercio)
      if (filters.busqueda) {
        const searchTerm = filters.busqueda.toLowerCase();
        const matchesUser = reserva.usuario?.nombreUsuario?.toLowerCase().includes(searchTerm);
        const matchesComercio = reserva.comercio?.nombre?.toLowerCase().includes(searchTerm);
        
        if (!matchesUser && !matchesComercio) {
          return false;
        }
      }

      // Filtro por estado (activa/rechazada)
      if (filters.estado !== '') {
        const isActive = filters.estado === 'true';
        if (reserva.estado !== isActive) return false;
      }

      // Filtro por rango de fechas
      if (filters.fechaDesde || filters.fechaHasta) {
        const reservaDate = new Date(reserva.fechaReserva);
        if (filters.fechaDesde && reservaDate < new Date(filters.fechaDesde)) return false;
        if (filters.fechaHasta && reservaDate > new Date(filters.fechaHasta)) return false;
      }

      return true;
    });
  }, [reservas, filters]);

  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar',
      value: filters.busqueda,
      placeholder: 'Buscar por usuario o comercio...'
    },
    {
      key: 'estado',
      type: 'select',
      label: 'Estado',
      value: filters.estado,
      options: [
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Rechazadas/Canceladas' }
      ]
    },
    {
      key: 'fecha',
      type: 'dateRange',
      label: 'Rango de Fechas',
      value: { from: filters.fechaDesde, to: filters.fechaHasta }
    }
  ];

  const handleFilterChange = (key, value) => {
    if (key === 'fecha') {
      setFilters(prev => ({
        ...prev,
        fechaDesde: value.from || '',
        fechaHasta: value.to || ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      busqueda: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  // ESTADÍSTICAS
  const stats = useMemo(() => ({
    total: reservas.length,
    activas: reservas.filter(r => r.estado === true).length,
    rechazadas: reservas.filter(r => r.estado === false).length,
    hoy: reservas.filter(r => {
      const fecha = new Date(r.fechaReserva);
      const hoy = new Date();
      fecha.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    }).length
  }), [reservas]);

  // HANDLERS DE ACCIONES
  const handleVerDetalle = (reserva) => {
    setSelectedReserva(reserva);
    setShowDetailModal(true);
  };

  const handleEditar = (reserva) => {
    setSelectedReserva(reserva);
    setShowCreateModal(true);
  };

  const handleConfirmarRechazo = async (reserva, motivo) => {
    try {
      await rejectReserva(reserva.iD_Reserva, reserva, motivo);
      success('Reserva rechazada exitosamente');
      await loadData();
    } catch (err) {
      showError('Error al rechazar la reserva');
      throw err;
    }
  };

  const handleAprobar = (reserva) => {
    setConfirmConfig({
      title: 'Aprobar Reserva',
      message: `¿Estás seguro de aprobar la reserva de ${reserva.usuario?.nombreUsuario || 'este usuario'}?`,
      description: `${reserva.comercio?.nombre || 'Comercio'} • ${formatDate(reserva.fechaReserva)} • ${reserva.comensales} comensales`,
      type: 'success',
      confirmText: 'Aprobar',
      onConfirm: async () => {
        try {
          await approveReserva(reserva.iD_Reserva, reserva);
          success('Reserva aprobada exitosamente');
          await loadData();
        } catch (err) {
          showError('Error al aprobar la reserva');
        }
      },
      onCancel: () => setShowConfirmModal(false)
    });
    setShowConfirmModal(true);
  };

  const handleRechazar = (reserva) => {
    setSelectedReserva(reserva);
    setShowRejectModal(true);
  };

  const handleCreateOrUpdate = async (reservaData) => {
    try {
      if (reservaData.iD_Reserva) {
        // Editar
        await updateReservaService(reservaData.iD_Reserva, reservaData);
        success('Reserva actualizada exitosamente');
      } else {
        // Crear
        await createReservaService(reservaData);
        success('Reserva creada exitosamente');
      }
      await loadData();
    } catch (err) {
      showError('Error al guardar la reserva');
      throw err;
    }
  };

  // COLUMNAS DE LA TABLA
  const columns = [
    {
      key: 'usuario',
      header: 'Usuario',
      accessor: (row) => row.usuario?.nombreUsuario || 'N/A',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.usuario?.nombreUsuario || 'N/A'}</p>
            <p className="text-xs text-gray-500">{row.usuario?.correo || ''}</p>
          </div>
        </div>
      ),
      width: '20%'
    },
    {
      key: 'comercio',
      header: 'Comercio',
      accessor: (row) => row.comercio?.nombre || 'N/A',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Store className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.comercio?.nombre || 'N/A'}</p>
            <p className="text-xs text-gray-500">{row.comercio?.direccion || ''}</p>
          </div>
        </div>
      ),
      width: '20%'
    },
    {
      key: 'fecha',
      header: 'Fecha y Hora',
      accessor: (row) => row.fechaReserva,
      render: (row) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaReserva = new Date(row.fechaReserva);
        fechaReserva.setHours(0, 0, 0, 0);
        const esHoy = fechaReserva.getTime() === hoy.getTime();

        return (
          <div>
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              {formatDate(row.fechaReserva)}
              {esHoy && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                  HOY
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">{formatTime(row.fechaReserva)}</p>
          </div>
        );
      },
      width: '15%'
    },
    {
      key: 'comensales',
      header: 'Comensales',
      accessor: (row) => row.comensales,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">{row.comensales}</span>
        </div>
      ),
      width: '10%'
    },
    {
      key: 'tolerancia',
      header: 'Tolerancia',
      accessor: (row) => row.tiempoTolerancia,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">{formatTiempoTolerancia(row.tiempoTolerancia)}</span>
        </div>
      ),
      width: '10%'
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => {
        // Determinar estado según el modelo:
        // Pendiente = estado false Y sin motivoRechazo
        // Aprobada = estado true
        // Rechazada = estado false Y con motivoRechazo
        const isPendiente = row.estado === false && !row.motivoRechazo;
        const isAprobada = row.estado === true;
        const isRechazada = row.estado === false && row.motivoRechazo;

        if (isPendiente) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
              <Clock className="w-3.5 h-3.5" />
              Pendiente
            </span>
          );
        }

        if (isAprobada) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
              <CheckCircle className="w-3.5 h-3.5" />
              Activa
            </span>
          );
        }

        // Rechazada
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      },
      width: '10%'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => {
        // Verificar si la reserva ya pasó
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaReserva = new Date(row.fechaReserva);
        fechaReserva.setHours(0, 0, 0, 0);
        const yaPaso = fechaReserva < hoy;

        // Pendiente = estado false Y sin motivoRechazo
        // Aprobada = estado true
        // Rechazada = estado false Y con motivoRechazo
        const isPendiente = row.estado === false && !row.motivoRechazo;

        // Solo mostrar botones de aprobar/rechazar si está PENDIENTE y no pasó la fecha
        const mostrarAccionesAprobacion = isPendiente && !yaPaso;

        return (
          <div className="flex items-center gap-2">
            {/* Botón Editar - Siempre visible */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditar(row);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar reserva"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Botón Aprobar - Solo si está PENDIENTE y no pasó */}
            {mostrarAccionesAprobacion && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAprobar(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Aprobar reserva"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}

            {/* Botón Rechazar - Solo si está PENDIENTE y no pasó */}
            {mostrarAccionesAprobacion && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRechazar(row);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Rechazar reserva"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      width: '15%'
    }
  ];

  // ACCIONES MASIVAS
  const bulkActions = [
    {
      label: 'Aprobar seleccionadas',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: async (selectedReservas) => {
        // Filtrar solo las PENDIENTES que no han pasado
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const aprobables = selectedReservas.filter(r => {
          const fechaReserva = new Date(r.fechaReserva);
          fechaReserva.setHours(0, 0, 0, 0);
          // Pendiente = estado false Y sin motivoRechazo
          const isPendiente = r.estado === false && !r.motivoRechazo;
          return isPendiente && fechaReserva >= hoy;
        });

        if (aprobables.length === 0) {
          warning('No hay reservas pendientes válidas para aprobar en la selección');
          return;
        }

        try {
          await Promise.all(
            aprobables.map(r => approveReserva(r.iD_Reserva, r))
          );
          success(`${aprobables.length} reserva(s) aprobada(s) exitosamente`);
          await loadData();
        } catch (err) {
          showError('Error al aprobar algunas reservas');
        }
      }
    }
  ];

  // HEADER ACTIONS
  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportMenu 
        data={filteredReservas} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="reservas"
      />
      <button
        onClick={() => {
          setSelectedReserva(null);
          setShowCreateModal(true);
        }}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="w-5 h-5" />
        Nueva Reserva
      </button>
    </div>
  );
  
  // RENDER
  if (loading) {
    return (
      <AdminLayout title="Gestión de Reservas" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Reservas"
      subtitle={`${stats.total} reservas • ${stats.activas} activas • ${stats.rechazadas} rechazadas • ${stats.hoy} hoy`}
      actions={headerActions}
    >
      {/* Filtros */}
      <div className="mb-6">
        <TableFilters
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          showClearButton={false}
        />
      </div>

      {/* Filtros Activos */}
      {(filters.busqueda || filters.estado || filters.fechaDesde || filters.fechaHasta) && (
        <div className="mb-4">
          <ActiveFilters
            filters={filterConfig}
            onRemove={(key) => {
              if (key === 'fecha') {
                setFilters(prev => ({ ...prev, fechaDesde: '', fechaHasta: '' }));
              } else {
                setFilters(prev => ({ ...prev, [key]: '' }));
              }
            }}
            onClearAll={handleClearFilters}
          />
        </div>
      )}

      {/* Tabla */}
      <DataTable
        data={filteredReservas}
        columns={columns}
        itemsPerPage={15}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={true}
        bulkActions={bulkActions}
        onRowClick={(reserva) => handleVerDetalle(reserva)}
        emptyMessage="No se encontraron reservas con los filtros aplicados"
      />

      {/* Modal de Detalle (solo informativo - acciones desde la tabla) */}
      <ReservaDetailModal
        reserva={selectedReserva}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReserva(null);
        }}
      />

      {/* Modal de Rechazo */}
      <RejectReservaModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
        }}
        onConfirm={handleConfirmarRechazo}
        reserva={selectedReserva}
      />

      {/* Modal de Crear/Editar */}
      <CreateReservaModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedReserva(null);
        }}
        onSubmit={handleCreateOrUpdate}
        reserva={selectedReserva}
        usuarios={usuarios}
        comercios={comercios}
      />

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={confirmConfig.onCancel}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          description={confirmConfig.description}
          confirmText={confirmConfig.confirmText}
          type={confirmConfig.type}
        />
      )}
    </AdminLayout>
  );
};

export default AdminReservas;