// AdminComercios.jsx - Gestión de comercios con carga optimizada
import { useState, useEffect, useMemo } from 'react';
import { Store, CheckCircle, XCircle, Plus, Edit, Trash2, Clock, ImageOff } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import ComercioDetailModal from '../../components/Admin/ComercioDetailModal';
import CreateComercioModal from '../../components/Admin/CreateComercioModal';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';
import DeleteConfirmModal from '../../components/Admin/DeleteConfirmModal';
import LazyImage from '../../components/Shared/LazyImage';
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
  getComercioImagen,
  getComercioById,
} from '../../services/comerciosService';
import { getAllTiposComercio, buildTiposComercioMap } from '../../services/tiposComercioService';

const AdminComercios = () => {
  const [comercios, setComercios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  // Estado para confirmación de acciones (aprobar/rechazar)
  const [showActionModal, setShowActionModal] = useState(false);
  const [comercioToAction, setComercioToAction] = useState(null);
  const [actionType, setActionType] = useState(null);

  // Estado para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comercioToDelete, setComercioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // CARGA INICIAL - Endpoint optimizado (sin fotos)
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

  // CONFIGURACIÓN DE COLUMNAS
  const columns = [
    {
      key: 'nombre',
      header: 'Comercio',
      accessor: (row) => row.nombre,
      render: (row) => (
        <div className="flex items-center gap-3">
          <LazyImage
            className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
            loadImage={() => getComercioImagen(row.iD_Comercio)}
            alt={row.nombre}
            eager={false}
            placeholder={
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 animate-pulse rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-300" />
              </div>
            }
            errorComponent={
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-gray-400" />
              </div>
            }
          />
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
      accessor: (row) => row.estado,
      render: (row) => {
        if (row.estado) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Aprobado
            </span>
          );
        } else if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              <XCircle className="w-3.5 h-3.5" />
              Rechazado
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
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
        success(`Comercio "${comercioToAction.nombre}" aprobado`);
      } else if (actionType === 'rechazar') {
        await rechazarComercio(comercioToAction.iD_Comercio, comercioToAction, motivo);
        success(`Comercio "${comercioToAction.nombre}" rechazado`);
      }
      
      loadData();
      setShowActionModal(false);
      setComercioToAction(null);
      setActionType(null);
    } catch (err) {
      error(`Error al ${actionType} el comercio`);
    }
  };

  // Para editar, necesitamos cargar el comercio completo con foto
  const handleEditar = async (comercio) => {
    try {
      const comercioCompleto = await getComercioById(comercio.iD_Comercio);
      setComercioToEdit(comercioCompleto);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error cargando comercio:', err);
      error('Error al cargar el comercio');
    }
  };

  const handleEliminar = (comercio) => {
    setComercioToDelete(comercio);
    setShowDeleteModal(true);
  };

  const handleCreateComercio = async (comercioData) => {
    try {
      await createComercio(comercioData);
      success('Comercio creado correctamente');
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      error('Error al crear el comercio');
      throw err;
    }
  };

  const handleUpdateComercio = async (comercioData) => {
    try {
      await updateComercio(comercioData.iD_Comercio, comercioData);
      success('Comercio actualizado correctamente');
      setShowEditModal(false);
      setComercioToEdit(null);
      loadData();
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
      success(`Comercio "${comercioToDelete.nombre}" eliminado`);
      setShowDeleteModal(false);
      setComercioToDelete(null);
      loadData();
    } catch (err) {
      error('Error al eliminar el comercio');
    } finally {
      setIsDeleting(false);
    }
  };

  // Para ver detalle, también necesitamos cargar la foto
  const handleVerDetalle = async (comercio) => {
    try {
      const comercioCompleto = await getComercioById(comercio.iD_Comercio);
      setSelectedComercio(comercioCompleto);
      setShowDetailModal(true);
    } catch (err) {
      // Si falla, mostrar sin foto
      setSelectedComercio(comercio);
      setShowDetailModal(true);
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
          actionType={actionType}
          itemName={comercioToAction.nombre}
          itemType="comercio"
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
    </AdminLayout>
  );
};

export default AdminComercios;