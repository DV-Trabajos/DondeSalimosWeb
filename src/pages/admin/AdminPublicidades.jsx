// AdminPublicidades.jsx - Gestión completa de publicidades CRUD completo
import { useState, useEffect, useMemo } from 'react';
import { Megaphone, CheckCircle, XCircle, DollarSign, Clock, Plus, Edit } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import PublicidadDetailModal from '../../components/Admin/PublicidadDetailModal';
import CreatePublicidadModal from '../../components/Admin/CreatePublicidadModal';
import { ConfirmationModal, NotificationModal, InputModal } from '../../components/Modals';
import { 
  getAllPublicidades, 
  aprobarPublicidad, 
  rechazarPublicidad 
} from '../../services/adminService';
import { 
  createPublicidad,
  updatePublicidad
} from '../../services/publicidadesService';
import { getAllComercios } from '../../services/comerciosService';
import { convertBase64ToImage, formatTimeSpanToDays } from '../../utils/formatters';

const AdminPublicidades = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    pago: ''
  });
  
  // Estados para modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publicidadesData, comerciosData] = await Promise.all([
        getAllPublicidades(),
        getAllComercios()
      ]);
      setPublicidades(publicidadesData);
      setComercios(comerciosData);
    } catch (error) {
      notify('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper para notificaciones
  const notify = (message, type = 'success') => {
    setModalConfig({
      message,
      type,
      onClose: () => setShowNotification(false)
    });
    setShowNotification(true);
  };

  // APLICAR FILTROS
  const filteredPublicidades = useMemo(() => {
    return publicidades.filter(publicidad => {
      // Filtro por búsqueda (comercio o descripción)
      if (filters.busqueda) {
        const searchTerm = filters.busqueda.toLowerCase();
        const matchesComercio = publicidad.comercio?.nombre?.toLowerCase().includes(searchTerm);
        const matchesDescripcion = publicidad.descripcion?.toLowerCase().includes(searchTerm);
        
        if (!matchesComercio && !matchesDescripcion) {
          return false;
        }
      }

      // Filtro por estado
      if (filters.estado !== '') {
        if (filters.estado === 'aprobada' && publicidad.estado !== true) return false;
        if (filters.estado === 'rechazada' && (!publicidad.motivoRechazo || publicidad.estado === true)) return false;
        if (filters.estado === 'pendiente' && (publicidad.estado === true || publicidad.motivoRechazo)) return false;
      }

      // Filtro por pago
      if (filters.pago !== '') {
        const isPagado = filters.pago === 'true';
        if (publicidad.pago !== isPagado) return false;
      }

      return true;
    });
  }, [publicidades, filters]);

  // CONFIGURACIÓN DE FILTROS
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar Publicidad',
      value: filters.busqueda,
      placeholder: 'Buscar por comercio o descripción...'
    },
    {
      key: 'estado',
      type: 'select',
      label: 'Estado',
      value: filters.estado,
      options: [
        { value: 'aprobada', label: 'Aprobadas' },
        { value: 'pendiente', label: 'Pendientes' },
        { value: 'rechazada', label: 'Rechazadas' }
      ]
    },
    {
      key: 'pago',
      type: 'select',
      label: 'Estado de Pago',
      value: filters.pago,
      options: [
        { value: 'true', label: 'Pagadas' },
        { value: 'false', label: 'Pendientes de Pago' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      busqueda: '',
      estado: '',
      pago: ''
    });
  };

  // CONFIGURACIÓN DE COLUMNAS
  const columns = [
    {
      key: 'imagen',
      header: 'Imagen',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <div className="w-20 h-20">
          {row.imagen ? (
            <img 
              src={convertBase64ToImage(row.imagen)} 
              alt="Publicidad"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'comercio',
      header: 'Comercio',
      accessor: (row) => row.comercio?.nombre || 'N/A',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">
            {row.comercio?.nombre || 'N/A'}
          </p>
          <p className="text-xs text-gray-500">
            {row.descripcion?.substring(0, 50)}
            {row.descripcion?.length > 50 ? '...' : ''}
          </p>
        </div>
      ),
      width: '20%'
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      accessor: (row) => row.descripcion,
      render: (row) => (
        <p className="text-sm text-gray-600 max-w-xs">
          {row.descripcion}
        </p>
      ),
      width: '25%'
    },
    {
      key: 'duracion',
      header: 'Duración',
      accessor: (row) => formatTimeSpanToDays(row.tiempo),
      render: (row) => {
        const dias = formatTimeSpanToDays(row.tiempo);
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {dias} {dias === 1 ? 'día' : 'días'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'visualizaciones',
      header: 'Vistas',
      accessor: (row) => row.visualizaciones || 0,
      render: (row) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.visualizaciones || 0}
        </span>
      )
    },
    {
      key: 'pago',
      header: 'Pago',
      accessor: (row) => row.pago,
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          row.pago 
            ? 'bg-green-50 text-green-700' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <DollarSign className="w-3 h-3" />
          {row.pago ? 'Pagado' : 'Pendiente'}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => {
        if (row.estado === true) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
              <CheckCircle className="w-3 h-3" />
              Aprobada
            </span>
          );
        }
        if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
              <XCircle className="w-3 h-3" />
              Rechazada
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Botones de Aprobar/Rechazar solo para pendientes */}
          {!row.estado && !row.motivoRechazo && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAprobar(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Aprobar"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRechazar(row);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Rechazar"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Botón Editar - siempre visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditar(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // HANDLERS
  const handleAprobar = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setModalConfig({
      title: 'Aprobar Publicidad',
      message: `¿Aprobar la publicidad de "${publicidad.comercio?.nombre}"?`,
      detail: 'La publicidad será visible en la aplicación.',
      confirmText: 'Sí, aprobar',
      onConfirm: async () => {
        try {
          await aprobarPublicidad(publicidad.iD_Publicidad, publicidad);
          notify('Publicidad aprobada correctamente', 'success');
          setShowConfirmModal(false);
          setSelectedPublicidad(null);
          loadData();
        } catch (error) {
          notify('Error al aprobar publicidad', 'error');
        }
      },
      onCancel: () => {
        setShowConfirmModal(false);
        setSelectedPublicidad(null);
      }
    });
    setShowConfirmModal(true);
  };

  const handleRechazar = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setModalConfig({
      title: 'Motivo del Rechazo',
      message: 'Ingresa el motivo por el cual se rechaza esta publicidad:',
      placeholder: 'Ej: Contenido inapropiado, imagen de baja calidad, etc.',
      confirmText: 'Rechazar',
      onConfirm: async (motivo) => {
        if (!motivo || motivo.trim().length < 10) {
          notify('El motivo debe tener al menos 10 caracteres', 'error');
          return;
        }

        try {
          await rechazarPublicidad(publicidad.iD_Publicidad, publicidad, motivo.trim());
          notify('Publicidad rechazada correctamente', 'success');
          setShowInputModal(false);
          setSelectedPublicidad(null);
          loadData();
        } catch (error) {
          notify('Error al rechazar publicidad', 'error');
        }
      },
      onCancel: () => {
        setShowInputModal(false);
        setSelectedPublicidad(null);
      }
    });
    setShowInputModal(true);
  };

  const handleEditar = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setShowCreateModal(true);
  };

  const handleNuevaPublicidad = () => {
    setSelectedPublicidad(null);
    setShowCreateModal(true);
  };

  const handleSubmitPublicidad = async (data) => {
    try {
      if (selectedPublicidad) {
        // Editar publicidad existente
        await updatePublicidad(selectedPublicidad.iD_Publicidad, data);
        notify('Publicidad actualizada correctamente', 'success');
      } else {
        // Crear nueva publicidad
        await createPublicidad(data);
        notify('Publicidad creada correctamente', 'success');
      }
      
      setShowCreateModal(false);
      setSelectedPublicidad(null);
      loadData();
    } catch (error) {
      notify(`Error al ${selectedPublicidad ? 'actualizar' : 'crear'} publicidad`, 'error');
    }
  };

  const handleVerDetalle = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setShowDetailModal(true);
  };

  // ACCIONES DEL HEADER
  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportMenu 
        data={filteredPublicidades} 
        columns={columns.filter(c => c.key !== 'acciones' && c.key !== 'imagen')} 
        filename="publicidades"
      />
      <button
        onClick={handleNuevaPublicidad}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="w-5 h-5" />
        Nueva Publicidad
      </button>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout title="Gestión de Publicidades" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const pendientes = publicidades.filter(p => !p.estado && !p.motivoRechazo).length;
  const aprobadas = publicidades.filter(p => p.estado).length;

  return (
    <AdminLayout
      title="Gestión de Publicidades"
      subtitle={`${filteredPublicidades.length} publicidad${filteredPublicidades.length !== 1 ? 'es' : ''} ${filters.busqueda || filters.estado || filters.pago ? 'filtrada' : 'encontrada'}${filteredPublicidades.length !== 1 ? 's' : ''} • ${pendientes} pendientes • ${aprobadas} aprobadas`}
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
      {(filters.busqueda || filters.estado || filters.pago) && (
        <div className="mb-4">
          <ActiveFilters
            filters={filterConfig}
            onRemove={(key) => {
              setFilters(prev => ({ ...prev, [key]: '' }));
            }}
            onClearAll={handleClearFilters}
          />
        </div>
      )}

      {/* Tabla */}
      <DataTable
        data={filteredPublicidades}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        onRowClick={(pub) => handleVerDetalle(pub)}
        emptyMessage="No se encontraron publicidades con los filtros aplicados"
      />

      {/* Modal de Detalle */}
      <PublicidadDetailModal
        publicidad={selectedPublicidad}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPublicidad(null);
        }}
      />

      {/* Modal de Crear/Editar */}
      <CreatePublicidadModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedPublicidad(null);
        }}
        onSubmit={handleSubmitPublicidad}
        comercios={comercios}
        publicidad={selectedPublicidad}
      />

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={modalConfig.onCancel}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          detail={modalConfig.detail}
          confirmText={modalConfig.confirmText}
        />
      )}

      {/* Modal de Input (para motivo de rechazo) */}
      {showInputModal && (
        <InputModal
          isOpen={showInputModal}
          onClose={modalConfig.onCancel}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          message={modalConfig.message}
          placeholder={modalConfig.placeholder}
          confirmText={modalConfig.confirmText}
        />
      )}

      {/* Modal de Notificación */}
      {showNotification && (
        <NotificationModal
          isOpen={showNotification}
          onClose={modalConfig.onClose}
          message={modalConfig.message}
          type={modalConfig.type}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPublicidades;