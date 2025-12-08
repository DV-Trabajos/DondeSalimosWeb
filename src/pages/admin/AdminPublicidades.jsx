// AdminPublicidades.jsx - Gestión de publicidades
import { useState, useEffect, useMemo } from 'react';
import { Megaphone, CheckCircle, XCircle, DollarSign, Clock, Plus, Edit, Trash2, ImageOff } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import PublicidadDetailModal from '../../components/Admin/PublicidadDetailModal';
import CreatePublicidadModal from '../../components/Admin/CreatePublicidadModal';
import DeletePublicidadModal from '../../components/Publicidad/DeletePublicidadModal';
import { ConfirmationModal, NotificationModal, InputModal } from '../../components/Modals';
import LazyImage from '../../components/Shared/LazyImage';
import { 
  aprobarPublicidad, 
  rechazarPublicidad 
} from '../../services/adminService';
import { 
  createPublicidad,
  updatePublicidad,
  deletePublicidad,
  getAllPublicidadesAdmin,
  getPublicidadImagen,
  getPublicidadById,
} from '../../services/publicidadesService';
import { getAllComercios } from '../../services/comerciosService';
import { formatTimeSpanToDays } from '../../utils/formatters';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Estados para notificaciones y confirmaciones
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [inputModal, setInputModal] = useState({ show: false });

  // CARGA INICIAL
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pubData, comData] = await Promise.all([
        getAllPublicidadesAdmin(), 
        getAllComercios()
      ]);
      setPublicidades(pubData || []);
      setComercios(comData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // NOTIFICACIONES
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // FILTROS
  const filteredPublicidades = useMemo(() => {
    return publicidades.filter(publicidad => {
      // Filtro por búsqueda
      if (filters.busqueda) {
        const searchLower = filters.busqueda.toLowerCase();
        const matchComercio = publicidad.comercio?.nombre?.toLowerCase().includes(searchLower);
        const matchDescripcion = publicidad.descripcion?.toLowerCase().includes(searchLower);
        if (!matchComercio && !matchDescripcion) return false;
      }

      // Filtro por estado
      if (filters.estado) {
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
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ busqueda: '', estado: '', pago: '' });
  };

  // CONFIGURACIÓN DE COLUMNAS
  const columns = [
    {
      key: 'imagen',
      header: 'Imagen',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <LazyImage
          className="w-20 h-20 rounded-lg overflow-hidden"
          loadImage={() => getPublicidadImagen(row.iD_Publicidad)}
          alt={`Publicidad ${row.comercio?.nombre || ''}`}
          eager={false}
          placeholder={
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 animate-pulse rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-purple-300" />
            </div>
          }
          errorComponent={
            <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
              <ImageOff className="w-6 h-6 text-gray-400" />
            </div>
          }
        />
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
      )
    },
    {
      key: 'duracion',
      header: 'Duración',
      accessor: (row) => formatTimeSpanToDays(row.tiempo),
      render: (row) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatTimeSpanToDays(row.tiempo)} días</span>
        </div>
      )
    },
    {
      key: 'visualizaciones',
      header: 'Vistas',
      accessor: (row) => row.visualizaciones || 0,
      render: (row) => (
        <span className="font-medium text-gray-700">
          {row.visualizaciones || 0}
        </span>
      )
    },
    {
      key: 'pago',
      header: 'Pago',
      accessor: (row) => row.pago,
      render: (row) => (
        row.pago ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <DollarSign className="w-3.5 h-3.5" />
            Pagado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        )
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => {
        if (row.estado) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Aprobada
            </span>
          );
        } else if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              Rechazada
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            <Clock className="w-3.5 h-3.5" />
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
        <div className="flex items-center gap-2">
          {/* Aprobar (si está pendiente) */}
          {!row.estado && !row.motivoRechazo && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAprobar(row); }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Aprobar"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {/* Rechazar (si está pendiente) */}
          {!row.estado && !row.motivoRechazo && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRechazar(row); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Rechazar"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          
          {/* Editar */}
          <button
            onClick={(e) => { e.stopPropagation(); handleEditar(row); }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {/* Eliminar */}
          <button
            onClick={(e) => { e.stopPropagation(); handleEliminar(row); }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // ACCIONES
  const handleAprobar = (publicidad) => {
    setConfirmModal({
      show: true,
      title: 'Aprobar Publicidad',
      message: `¿Estás seguro de aprobar la publicidad de "${publicidad.comercio?.nombre}"?`,
      confirmText: 'Aprobar',
      confirmStyle: 'success',
      onConfirm: async () => {
        try {
          await aprobarPublicidad(publicidad.iD_Publicidad);
          showNotification('Publicidad aprobada correctamente');
          loadData();
        } catch (error) {
          showNotification('Error al aprobar publicidad', 'error');
        }
        setConfirmModal({ show: false });
      }
    });
  };

  const handleRechazar = (publicidad) => {
    setInputModal({
      show: true,
      title: 'Rechazar Publicidad',
      message: 'Ingresa el motivo del rechazo:',
      placeholder: 'Motivo del rechazo...',
      confirmText: 'Rechazar',
      onConfirm: async (motivo) => {
        if (!motivo.trim()) {
          showNotification('Debes ingresar un motivo', 'error');
          return;
        }
        try {
          await rechazarPublicidad(publicidad.iD_Publicidad, publicidad, motivo);
          showNotification('Publicidad rechazada correctamente');
          loadData();
        } catch (error) {
          showNotification('Error al rechazar publicidad', 'error');
        }
        setInputModal({ show: false });
      }
    });
  };

  // Para editar, necesitamos cargar la publicidad completa con imagen
  const handleEditar = async (publicidad) => {
    try {
      // Cargar publicidad completa con imagen
      const publicidadCompleta = await getPublicidadById(publicidad.iD_Publicidad);
      setSelectedPublicidad(publicidadCompleta);
      setIsEditMode(true);
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error cargando publicidad:', error);
      showNotification('Error al cargar la publicidad', 'error');
    }
  };

  const handleEliminar = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deletePublicidad(selectedPublicidad.iD_Publicidad);
      showNotification('Publicidad eliminada correctamente');
      setShowDeleteModal(false);
      setSelectedPublicidad(null);
      loadData();
    } catch (error) {
      showNotification('Error al eliminar publicidad', 'error');
    }
  };

  const handleNuevaPublicidad = () => {
    setSelectedPublicidad(null);
    setIsEditMode(false);
    setShowCreateModal(true);
  };

  const handleSavePublicidad = async (publicidadData) => {
    try {
      if (isEditMode && selectedPublicidad) {
        await updatePublicidad(selectedPublicidad.iD_Publicidad, publicidadData);
        showNotification('Publicidad actualizada correctamente');
      } else {
        await createPublicidad(publicidadData);
        showNotification('Publicidad creada correctamente');
      }
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      showNotification(`Error al ${isEditMode ? 'actualizar' : 'crear'} publicidad`, 'error');
    }
  };

  // Para ver detalle, también necesitamos cargar la imagen
  const handleVerDetalle = async (publicidad) => {
    try {
      const publicidadCompleta = await getPublicidadById(publicidad.iD_Publicidad);
      setSelectedPublicidad(publicidadCompleta);
      setShowDetailModal(true);
    } catch (error) {
      // Si falla, mostrar sin imagen
      setSelectedPublicidad(publicidad);
      setShowDetailModal(true);
    }
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

  // LOADING
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
      subtitle={`${filteredPublicidades.length} publicidad${filteredPublicidades.length !== 1 ? 'es' : ''} encontrada${filteredPublicidades.length !== 1 ? 's' : ''} • ${pendientes} pendientes • ${aprobadas} aprobadas`}
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
            onRemove={(key) => setFilters(prev => ({ ...prev, [key]: '' }))}
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

      {/* MODALES */}
      
      {/* Modal de Detalle */}
      {showDetailModal && selectedPublicidad && (
        <PublicidadDetailModal
          publicidad={selectedPublicidad}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPublicidad(null);
          }}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onEdit={handleEditar}
        />
      )}

      {/* Modal de Crear/Editar */}
      {showCreateModal && (
        <CreatePublicidadModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedPublicidad(null);
            setIsEditMode(false);
          }}
          onSave={handleSavePublicidad}
          publicidad={selectedPublicidad}
          comercios={comercios}
          isEditMode={isEditMode}
        />
      )}

      {/* Modal de Eliminar */}
      {showDeleteModal && selectedPublicidad && (
        <DeletePublicidadModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPublicidad(null);
          }}
          onConfirm={handleConfirmDelete}
          publicidad={selectedPublicidad}
        />
      )}

      {/* Modal de Confirmación */}
      {confirmModal.show && (
        <ConfirmationModal
          isOpen={confirmModal.show}
          onClose={() => setConfirmModal({ show: false })}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmStyle={confirmModal.confirmStyle}
        />
      )}

      {/* Modal de Input */}
      {inputModal.show && (
        <InputModal
          isOpen={inputModal.show}
          onClose={() => setInputModal({ show: false })}
          onConfirm={inputModal.onConfirm}
          title={inputModal.title}
          message={inputModal.message}
          placeholder={inputModal.placeholder}
          confirmText={inputModal.confirmText}
        />
      )}

      {/* Notificación */}
      {notification && (
        <NotificationModal
          isOpen={!!notification}
          onClose={() => setNotification(null)}
          message={notification.message}
          type={notification.type}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPublicidades;