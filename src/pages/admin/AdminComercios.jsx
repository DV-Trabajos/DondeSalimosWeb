// AdminComercios.jsx - Con carga dinámica de tipos de comercio
import { useState, useEffect, useMemo } from 'react';
import { Store, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
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
  getAllComercios, 
  aprobarComercio, 
  rechazarComercio 
} from '../../services/adminService';
import { getAllUsuarios } from '../../services/usuariosService';
import { createComercio, updateComercio, deleteComercio } from '../../services/comerciosService';
import { getAllTiposComercio, buildTiposComercioMap } from '../../services/tiposComercioService';
import { convertBase64ToImage } from '../../utils/formatters';

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

  // Estado para modal de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comercioToDelete, setComercioToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para modal de aprobar/rechazar
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comercioToAction, setComercioToAction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Función unificada para cargar todos los datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [comerciosData, usuariosData, tiposData] = await Promise.all([
        getAllComercios(),
        getAllUsuarios(),
        getAllTiposComercio()
      ]);
      
      setComercios(comerciosData);
      setUsuarios(usuariosData);
      setTiposComercio(tiposData);
      
      const map = buildTiposComercioMap(tiposData);
      setTiposComercioMap(map);

    } catch (err) {
      error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // FILTRAR COMERCIOS
  const filteredComercios = useMemo(() => {
    return comercios.filter(comercio => {
      if (filters.busqueda) {
        const searchTerm = filters.busqueda.toLowerCase();
        const nombreComercio = comercio.nombre?.toLowerCase() || '';
        const nombrePropietario = comercio.usuario?.nombreUsuario?.toLowerCase() || '';
        const correoPropietario = comercio.usuario?.correo?.toLowerCase() || '';
        
        if (!nombreComercio.includes(searchTerm) && 
            !nombrePropietario.includes(searchTerm) &&
            !correoPropietario.includes(searchTerm)) {
          return false;
        }
      }

      if (filters.estado !== '') {
        if (filters.estado === 'aprobado' && !comercio.estado) return false;
        if (filters.estado === 'pendiente' && (comercio.estado || comercio.motivoRechazo)) return false;
        if (filters.estado === 'rechazado' && (!comercio.motivoRechazo || comercio.estado)) return false;
      }

      if (filters.tipo && filters.tipo !== comercio.iD_TipoComercio.toString()) {
        return false;
      }

      return true;
    });
  }, [comercios, filters]);

  // Configuración de filtros con tipos dinámicos
  const filterConfig = useMemo(() => {
    const tipoOptions = tiposComercio.map(tipo => ({
      value: (tipo.iD_TipoComercio || tipo.ID_TipoComercio).toString(),
      label: tipo.descripcion || tipo.Descripcion
    }));

    return [
      {
        key: 'busqueda',
        type: 'text',
        label: 'Buscar',
        value: filters.busqueda,
        placeholder: 'Buscar por nombre o propietario...'
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
  }, [filters, tiposComercio]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ busqueda: '', estado: '', tipo: '' });
  };

  // HANDLERS
  const handleVerDetalle = (comercio) => {
    setSelectedComercio(comercio);
    setShowDetailModal(true);
  };

  const handleEditar = (comercio) => {
    setComercioToEdit(comercio);
    setShowEditModal(true);
  };

  const handleEliminar = (comercio) => {
    setComercioToDelete(comercio);
    setShowDeleteModal(true);
  };

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

  // COLUMNAS
  const columns = [
    {
      key: 'nombre',
      header: 'Comercio',
      accessor: (row) => row.nombre,
      render: (row) => {
        const imagenBase64 = row.foto || row.imagen;
        
        return (
          <div className="flex items-center gap-3">
            {imagenBase64 ? (
              <img 
                src={convertBase64ToImage(imagenBase64)} 
                alt={row.nombre}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Store className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{row.nombre}</p>
              <p className="text-xs text-gray-500">{row.direccion}</p>
            </div>
          </div>
        );
      },
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
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              Pendiente
            </span>
          );
        }
      }
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Botones de aprobar/rechazar - SOLO para pendientes */}
          {!row.estado && !row.motivoRechazo && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAprobar(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Aprobar comercio"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRechazar(row);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Rechazar comercio"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Botón de editar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditar(row);
            }}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Editar comercio"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {/* Botón de eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEliminar(row);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar comercio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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
  const rechazados = comercios.filter(c => !c.estado && c.motivoRechazo).length;

  return (
    <AdminLayout
      title="Gestión de Comercios"
      subtitle={`${comercios.length} comercios • ${pendientes} pendientes • ${aprobados} aprobados • ${rechazados} rechazados`}
      actions={headerActions}
    >
      <div className="mb-6">
        <TableFilters
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          onClear={handleClearFilters}
          showClearButton={false}
        />
      </div>

      {(filters.busqueda || filters.estado || filters.tipo) && (
        <div className="mb-4">
          <ActiveFilters
            filters={filterConfig}
            onRemove={(key) => setFilters(prev => ({ ...prev, [key]: '' }))}
            onClearAll={handleClearFilters}
          />
        </div>
      )}

      <DataTable
        data={filteredComercios}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={true}
        onRowClick={(comercio) => handleVerDetalle(comercio)}
        emptyMessage="No hay comercios registrados"
      />

      <ComercioDetailModal
        comercio={selectedComercio}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedComercio(null);
        }}
        tiposComercioMap={tiposComercioMap}
      />

      <CreateComercioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateComercio}
        usuarios={usuarios}
      />

      <CreateComercioModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setComercioToEdit(null);
        }}
        onSubmit={handleUpdateComercio}
        usuarios={usuarios}
        comercio={comercioToEdit}
      />

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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setComercioToDelete(null);
        }}
        onConfirm={confirmDeleteComercio}
        comercio={comercioToDelete}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
};

export default AdminComercios;