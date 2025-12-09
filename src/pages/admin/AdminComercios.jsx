// AdminComercios.jsx - Gestión de comercios con carga optimizada
import { useState, useEffect, useMemo } from 'react';
import { Store, CheckCircle, XCircle, Plus, Edit, Trash2, Clock } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import ComercioDetailModal from '../../components/Admin/ComercioDetailModal';
import CreateComercioModal from '../../components/Admin/CreateComercioModal';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';
import DeleteConfirmModal from '../../components/Admin/DeleteConfirmModal';
import { useNotification } from '../../hooks/useNotification';
import { 
  aprobarComercio, 
  rechazarComercio 
} from '../../services/adminService';
import { getAllUsuarios } from '../../services/usuariosService';
import { 
  createComercio, 
  updateComercio, 
  deleteComercio,
  getAllComerciosAdmin,
  getComercioById,
} from '../../services/comerciosService';
import { getAllTiposComercio, buildTiposComercioMap } from '../../services/tiposComercioService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dondesalimos-api.azurewebsites.net';

const AdminComercios = () => {
  const [comercios, setComercios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para versiones de imágenes (cache busting)
  const [imageVersions, setImageVersions] = useState({});
  
  // Estado para tipos de comercio dinámicos
  const [tiposComercio, setTiposComercio] = useState([]);
  const [tiposComercioMap, setTiposComercioMap] = useState({});
  
  // Hook de notificaciones
  const { success, error, warning } = useNotification();

  // Estados de filtros
  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    tipo: ''
  });

  // Estado para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComercio, setSelectedComercio] = useState(null);

  // Estado para modal de crear
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estado para modal de editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [comercioToEdit, setComercioToEdit] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Estado para confirmación de acciones (aprobar/rechazar)
  const [showActionModal, setShowActionModal] = useState(false);
  const [comercioToAction, setComercioToAction] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estado para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comercioToDelete, setComercioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // HELPERS PARA ACTUALIZACIÓN LOCAL
  const updateComercioLocal = (comercioId, updates) => {
    setComercios(prev => prev.map(c => 
      c.iD_Comercio === comercioId ? { ...c, ...updates } : c
    ));
  };

  const removeComercioLocal = (comercioId) => {
    setComercios(prev => prev.filter(c => c.iD_Comercio !== comercioId));
  };

  const addComercioLocal = (comercio) => {
    setComercios(prev => [comercio, ...prev]);
  };

  // Invalidar cache de imagen para un comercio específico
  const invalidateImageCache = (comercioId) => {
    setImageVersions(prev => ({
      ...prev,
      [comercioId]: Date.now()
    }));
  };

  // Obtener URL de imagen con cache busting
  const getImageUrl = (comercioId) => {
    const version = imageVersions[comercioId];
    const baseUrl = `${API_BASE_URL}/api/Comercios/${comercioId}/imagen-raw`;
    return version ? `${baseUrl}?v=${version}` : baseUrl;
  };

  // CARGA INICIAL
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [comerciosData, usuariosData, tiposData] = await Promise.all([
        getAllComerciosAdmin(),
        getAllUsuarios(),
        getAllTiposComercio()
      ]);
      
      setComercios(comerciosData || []);
      setUsuarios(usuariosData || []);
      setTiposComercio(tiposData || []);
      setTiposComercioMap(buildTiposComercioMap(tiposData || []));
    } catch (err) {
      console.error('Error cargando datos:', err);
      error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // FILTROS
  const filteredComercios = useMemo(() => {
    return comercios.filter(comercio => {
      // Filtro por búsqueda
      if (filters.busqueda) {
        const searchLower = filters.busqueda.toLowerCase();
        const matchNombre = comercio.nombre?.toLowerCase().includes(searchLower);
        const matchDireccion = comercio.direccion?.toLowerCase().includes(searchLower);
        const matchPropietario = comercio.usuario?.nombreUsuario?.toLowerCase().includes(searchLower);
        if (!matchNombre && !matchDireccion && !matchPropietario) return false;
      }

      // Filtro por estado
      if (filters.estado !== '') {
        if (filters.estado === 'aprobado' && comercio.estado !== true) return false;
        if (filters.estado === 'rechazado' && (!comercio.motivoRechazo || comercio.estado === true)) return false;
        if (filters.estado === 'pendiente' && (comercio.estado === true || comercio.motivoRechazo)) return false;
      }

      // Filtro por tipo
      if (filters.tipo !== '') {
        if (comercio.iD_TipoComercio !== parseInt(filters.tipo)) return false;
      }

      return true;
    });
  }, [comercios, filters]);

  // Generar opciones de tipo para el filtro
  const tipoOptions = useMemo(() => {
    return tiposComercio.map(tipo => ({
      value: String(tipo.iD_TipoComercio || tipo.ID_TipoComercio),
      label: tipo.descripcion || tipo.Descripcion
    }));
  }, [tiposComercio]);

  // CONFIGURACIÓN DE FILTROS
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar Comercio',
      value: filters.busqueda,
      placeholder: 'Buscar por nombre, dirección o propietario...'
    },
    {
      key: 'estado',
      type: 'select',
      label: 'Estado',
      value: filters.estado,
      options: [
        { value: 'aprobado', label: 'Aprobados' },
        { value: 'pendiente', label: 'Pendientes' },
        { value: 'rechazado', label: 'Rechazados' }
      ]
    },
    {
      key: 'tipo',
      type: 'select',
      label: 'Tipo de Comercio',
      value: filters.tipo,
      options: tipoOptions
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ busqueda: '', estado: '', tipo: '' });
  };

  // HELPER: Determinar si está pendiente
  const isPendiente = (row) => !row.estado && !row.motivoRechazo;

  // CONFIGURACIÓN DE COLUMNAS - Imagen con URL directa y cache busting
  const columns = [
    {
      key: 'nombre',
      header: 'Comercio',
      accessor: (row) => row.nombre,
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Imagen con URL directa + cache busting */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-100 to-violet-100 relative">
            <img
              src={getImageUrl(row.iD_Comercio)}
              alt={row.nombre}
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
              <Store className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.nombre}</p>
            <p className="text-xs text-gray-500">{row.direccion}</p>
          </div>
        </div>
      ),
      width: '30%'
    },
    {
      key: 'tipo',
      header: 'Tipo',
      accessor: (row) => row.iD_TipoComercio,
      render: (row) => {
        const tipoNombre = tiposComercioMap[row.iD_TipoComercio] || 'Desconocido';
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {tipoNombre}
          </span>
        );
      }
    },
    {
      key: 'propietario',
      header: 'Propietario',
      accessor: (row) => row.usuario?.nombreUsuario || 'N/A',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.usuario?.nombreUsuario || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.usuario?.correo || ''}</p>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => {
        if (row.estado === true) return 'Aprobado';
        if (row.motivoRechazo) return 'Rechazado';
        return 'Pendiente';
      },
      render: (row) => {
        if (row.estado === true) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Aprobado
            </span>
          );
        }
        if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              Rechazado
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
          {/* Aprobar - solo si PENDIENTE */}
          {isPendiente(row) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleAprobar(row); }}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Aprobar"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          
          {/* Rechazar - solo si PENDIENTE */}
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
  const handleAprobar = (comercio) => {
    setComercioToAction(comercio);
    setActionType('aprobar');
    setShowActionModal(true);
  };

  const handleRechazar = (comercio) => {
    setComercioToAction(comercio);
    setActionType('rechazar');
    setShowActionModal(true);
  };

  const confirmAction = async (motivo = null) => {
    if (!comercioToAction) return;

    try {
      if (actionType === 'aprobar') {
        await aprobarComercio(comercioToAction.iD_Comercio, comercioToAction);
        // Actualizar local en vez de recargar todo
        updateComercioLocal(comercioToAction.iD_Comercio, { 
          estado: true, 
          motivoRechazo: null 
        });
        success(`Comercio "${comercioToAction.nombre}" aprobado`);
      } else if (actionType === 'rechazar') {
        await rechazarComercio(comercioToAction.iD_Comercio, comercioToAction, motivo);
        updateComercioLocal(comercioToAction.iD_Comercio, { 
          estado: false, 
          motivoRechazo: motivo 
        });
        success(`Comercio "${comercioToAction.nombre}" rechazado`);
      }
      
      setShowActionModal(false);
      setComercioToAction(null);
      setActionType(null);
    } catch (err) {
      error(`Error al ${actionType} el comercio`);
    }
  };

  // Ver detalle - Abrir modal inmediato, cargar foto en background
  const handleVerDetalle = async (comercio) => {
    // Abrir modal inmediatamente con datos básicos
    setSelectedComercio(comercio);
    setShowDetailModal(true);
    
    // Cargar comercio completo (con foto) en background
    try {
      const comercioCompleto = await getComercioById(comercio.iD_Comercio);
      // Actualizar el comercio seleccionado cuando llegue la foto
      setSelectedComercio(comercioCompleto);
    } catch (err) {
      // Si falla, mantener datos básicos (sin foto)
      console.error('Error cargando detalle:', err);
    }
  };

  // Editar - Cargar comercio completo antes de abrir
  const handleEditar = async (comercio) => {
    setLoadingEdit(true);
    try {
      const comercioCompleto = await getComercioById(comercio.iD_Comercio);
      setComercioToEdit(comercioCompleto);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error cargando comercio:', err);
      error('Error al cargar el comercio');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEliminar = (comercio) => {
    setComercioToDelete(comercio);
    setShowDeleteModal(true);
  };

  const handleCreateComercio = async (comercioData) => {
    try {
      const nuevoComercio = await createComercio(comercioData);
      // Si la API devuelve el comercio creado, agregarlo local
      if (nuevoComercio?.iD_Comercio) {
        addComercioLocal(nuevoComercio);
        // Invalidar cache de imagen del nuevo comercio
        invalidateImageCache(nuevoComercio.iD_Comercio);
      } else {
        // Si no, recargar todo (fallback)
        loadData();
      }
      success('Comercio creado correctamente');
      setShowCreateModal(false);
    } catch (err) {
      error('Error al crear el comercio');
      throw err;
    }
  };

  const handleUpdateComercio = async (comercioData) => {
    try {
      await updateComercio(comercioData.iD_Comercio, comercioData);
      // Actualizar en estado local
      updateComercioLocal(comercioData.iD_Comercio, comercioData);
      // Invalidar cache de imagen para forzar recarga
      invalidateImageCache(comercioData.iD_Comercio);
      success('Comercio actualizado correctamente');
      setShowEditModal(false);
      setComercioToEdit(null);
    } catch (err) {
      error('Error al actualizar el comercio');
      throw err;
    }
  };

  const confirmDeleteComercio = async () => {
    if (!comercioToDelete) return;

    try {
      setIsDeleting(true);
      await deleteComercio(comercioToDelete.iD_Comercio);
      // Eliminar del estado local
      removeComercioLocal(comercioToDelete.iD_Comercio);
      success(`Comercio "${comercioToDelete.nombre}" eliminado`);
      setShowDeleteModal(false);
      setComercioToDelete(null);
    } catch (err) {
      error('Error al eliminar el comercio');
    } finally {
      setIsDeleting(false);
    }
  };

  // ACCIONES DEL HEADER
  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportMenu 
        data={filteredComercios} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="comercios"
      />
      <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="w-5 h-5" />
        Nuevo Comercio
      </button>
    </div>
  );

  // LOADING
  if (loading) {
    return (
      <AdminLayout title="Gestión de Comercios" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const pendientes = comercios.filter(c => !c.estado && !c.motivoRechazo).length;
  const aprobados = comercios.filter(c => c.estado).length;

  // RENDER
  return (
    <AdminLayout
      title="Gestión de Comercios"
      subtitle={`${filteredComercios.length} comercio${filteredComercios.length !== 1 ? 's' : ''} encontrado${filteredComercios.length !== 1 ? 's' : ''} • ${pendientes} pendientes • ${aprobados} aprobados`}
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
      {(filters.busqueda || filters.estado || filters.tipo) && (
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
        data={filteredComercios}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        onRowClick={(comercio) => handleVerDetalle(comercio)}
        emptyMessage="No se encontraron comercios con los filtros aplicados"
      />

      {/* MODALES */}
      
      {/* Modal de Detalle */}
      {showDetailModal && selectedComercio && (
        <ComercioDetailModal
          comercio={selectedComercio}
          tiposComercioMap={tiposComercioMap}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedComercio(null);
          }}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onEdit={handleEditar}
        />
      )}

      {/* Modal de Crear */}
      {showCreateModal && (
        <CreateComercioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateComercio}
          usuarios={usuarios}
          tiposComercio={tiposComercio}
        />
      )}

      {/* Modal de Editar */}
      {showEditModal && comercioToEdit && (
        <CreateComercioModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setComercioToEdit(null);
          }}
          onSubmit={handleUpdateComercio}
          comercio={comercioToEdit}
          usuarios={usuarios}
          tiposComercio={tiposComercio}
          isEditMode={true}
        />
      )}

      {/* Modal de Confirmación de Acción */}
      {showActionModal && comercioToAction && (
        <ConfirmActionModal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setComercioToAction(null);
            setActionType(null);
          }}
          onConfirm={confirmAction}
          comercio={comercioToAction}
          actionType={actionType}
        />
      )}

      {/* Modal de Eliminar */}
      {showDeleteModal && comercioToDelete && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setComercioToDelete(null);
          }}
          onConfirm={confirmDeleteComercio}
          itemName={comercioToDelete.nombre}
          itemType="comercio"
          isDeleting={isDeleting}
        />
      )}

      {/* Loading overlay para edición */}
      {loadingEdit && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Cargando comercio...</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComercios;