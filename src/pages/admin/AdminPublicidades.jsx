// AdminPublicidades.jsx - Gestión de publicidades con carga optimizada
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
import { 
  aprobarPublicidad, 
  rechazarPublicidad 
} from '../../services/adminService';
import { 
  createPublicidad,
  updatePublicidad,
  deletePublicidad,
  getAllPublicidadesAdmin,
  getPublicidadById,
} from '../../services/publicidadesService';
import { getAllComercios } from '../../services/comerciosService';
import { formatTimeSpanToDays } from '../../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dondesalimos-api.azurewebsites.net';

const AdminPublicidades = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  
  // Estado para versiones de imágenes (cache busting)
  const [imageVersions, setImageVersions] = useState({});
  
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
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Estados para notificaciones y confirmaciones
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false });
  const [inputModal, setInputModal] = useState({ show: false });

  // HELPERS PARA ACTUALIZACIÓN LOCAL
  const updatePublicidadLocal = (publicidadId, updates) => {
    setPublicidades(prev => prev.map(p => 
      p.iD_Publicidad === publicidadId ? { ...p, ...updates } : p
    ));
  };

  const removePublicidadLocal = (publicidadId) => {
    setPublicidades(prev => prev.filter(p => p.iD_Publicidad !== publicidadId));
  };

  const addPublicidadLocal = (publicidad) => {
    setPublicidades(prev => [publicidad, ...prev]);
  };

  // Invalidar cache de imagen para una publicidad específica
  const invalidateImageCache = (publicidadId) => {
    setImageVersions(prev => ({
      ...prev,
      [publicidadId]: Date.now()
    }));
  };

  // Obtener URL de imagen con cache busting
  const getImageUrl = (publicidadId) => {
    const version = imageVersions[publicidadId];
    const baseUrl = `${API_BASE_URL}/api/Publicidades/${publicidadId}/imagenRaw`;
    return version ? `${baseUrl}?v=${version}` : baseUrl;
  };

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

  // HELPER: Determinar si está pendiente
  const isPendiente = (row) => !row.estado && !row.motivoRechazo;

  // CONFIGURACIÓN DE COLUMNAS - Imagen con URL directa y cache busting
  const columns = [
    {
      key: 'imagen',
      header: 'Imagen',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-violet-100 relative">
          <img
            src={getImageUrl(row.iD_Publicidad)}
            alt={`Publicidad ${row.comercio?.nombre || ''}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
          <div className="absolute inset-0 bg-gray-100 items-center justify-center hidden">
            <ImageOff className="w-6 h-6 text-gray-400" />
          </div>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <DollarSign className="w-3.5 h-3.5" />
            Pagada
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            Pendiente
          </span>
        )
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => {
        if (row.estado === true) return 'Aprobada';
        if (row.motivoRechazo) return 'Rechazada';
        return 'Pendiente';
      },
      render: (row) => {
        if (row.estado === true) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Aprobada
            </span>
          );
        }
        if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              Rechazada
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
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
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {/* Aprobar */}
          {isPendiente(row) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAprobar(row); }}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Aprobar"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {/* Rechazar */}
          {isPendiente(row) && (
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
      type: 'success',
      title: 'Aprobar Publicidad',
      message: `¿Estás seguro de aprobar la publicidad del comercio "${publicidad.comercio?.nombre}"?`,
      confirmText: 'Aprobar',
      onConfirm: async () => {
        try {
          await aprobarPublicidad(publicidad.iD_Publicidad, publicidad);
          updatePublicidadLocal(publicidad.iD_Publicidad, { 
            estado: true, 
            motivoRechazo: null 
          });
          showNotification('Publicidad aprobada correctamente', 'success');
          setConfirmModal({ show: false });
        } catch (error) {
          showNotification('Error al aprobar la publicidad', 'error');
        }
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
        try {
          await rechazarPublicidad(publicidad.iD_Publicidad, publicidad, motivo);
          updatePublicidadLocal(publicidad.iD_Publicidad, { 
            estado: false, 
            motivoRechazo: motivo 
          });
          showNotification('Publicidad rechazada', 'success');
          setInputModal({ show: false });
        } catch (error) {
          showNotification('Error al rechazar la publicidad', 'error');
        }
      }
    });
  };

  // Ver detalle - Abrir modal inmediato, cargar imagen en background
  const handleVerDetalle = async (publicidad) => {
    // Abrir modal inmediatamente con datos básicos
    setSelectedPublicidad(publicidad);
    setShowDetailModal(true);
    
    // Cargar publicidad completa
    try {
      const publicidadCompleta = await getPublicidadById(publicidad.iD_Publicidad);
      // Actualizar la publicidad seleccionada cuando llegue la imagen
      setSelectedPublicidad(publicidadCompleta);
    } catch (err) {
      // Si falla, mantener datos básicos 
      console.error('Error cargando detalle:', err);
    }
  };

  // Editar - Cargar publicidad completa antes de abrir
  const handleEditar = async (publicidad) => {
    setLoadingEdit(true);
    try {
      const publicidadCompleta = await getPublicidadById(publicidad.iD_Publicidad);
      setSelectedPublicidad(publicidadCompleta);
      setIsEditMode(true);
      setShowCreateModal(true);
    } catch (err) {
      console.error('Error cargando publicidad:', err);
      showNotification('Error al cargar la publicidad', 'error');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEliminar = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setShowDeleteModal(true);
  };

  const handleNuevaPublicidad = () => {
    setSelectedPublicidad(null);
    setIsEditMode(false);
    setShowCreateModal(true);
  };

  const handleSubmitPublicidad = async (data) => {
    try {
      if (isEditMode && selectedPublicidad) {
        await updatePublicidad(selectedPublicidad.iD_Publicidad, data);
        updatePublicidadLocal(selectedPublicidad.iD_Publicidad, data);
        // Invalidar cache de imagen para forzar recarga
        invalidateImageCache(selectedPublicidad.iD_Publicidad);
        showNotification('Publicidad actualizada correctamente', 'success');
      } else {
        const nuevaPublicidad = await createPublicidad(data);
        if (nuevaPublicidad?.iD_Publicidad) {
          addPublicidadLocal(nuevaPublicidad);
          // Invalidar cache de imagen de la nueva publicidad
          invalidateImageCache(nuevaPublicidad.iD_Publicidad);
        } else {
          loadData();
        }
        showNotification('Publicidad creada correctamente', 'success');
      }
      setShowCreateModal(false);
      setSelectedPublicidad(null);
      setIsEditMode(false);
    } catch (error) {
      showNotification(`Error al ${isEditMode ? 'actualizar' : 'crear'} publicidad`, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPublicidad) return;
    
    try {
      await deletePublicidad(selectedPublicidad.iD_Publicidad);
      removePublicidadLocal(selectedPublicidad.iD_Publicidad);
      showNotification('Publicidad eliminada correctamente', 'success');
      setShowDeleteModal(false);
      setSelectedPublicidad(null);
    } catch (error) {
      showNotification('Error al eliminar la publicidad', 'error');
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

  // RENDER
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
          onSubmit={handleSubmitPublicidad}
          comercios={comercios.filter(c => c.estado === true)}
          publicidad={isEditMode ? selectedPublicidad : null}
          isEditMode={isEditMode}
        />
      )}

      {/* Modal de Eliminar */}
      {showDeleteModal && selectedPublicidad && (
        <DeletePublicidadModal
          isOpen={showDeleteModal}
          publicidad={selectedPublicidad}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPublicidad(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Modal de Confirmación */}
      {confirmModal.show && (
        <ConfirmationModal
          isOpen={confirmModal.show}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({ show: false })}
        />
      )}

      {/* Modal de Input */}
      {inputModal.show && (
        <InputModal
          isOpen={inputModal.show}
          title={inputModal.title}
          message={inputModal.message}
          placeholder={inputModal.placeholder}
          confirmText={inputModal.confirmText}
          onConfirm={inputModal.onConfirm}
          onClose={() => setInputModal({ show: false })}  // ✅
        />
      )}

      {/* Notificación */}
      {notification && (
        <NotificationModal
          isOpen={!!notification}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Loading overlay para edición */}
      {loadingEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Cargando publicidad...</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPublicidades;