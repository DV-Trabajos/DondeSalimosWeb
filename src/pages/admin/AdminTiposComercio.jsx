// AdminTiposComercio.jsx - Gestión de Tipos de Comercio
import { useState, useEffect, useMemo } from 'react';
import { Store, Plus, Edit, Trash2, Building2, CheckCircle, XCircle, Power } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import TipoComercioModal, { TIPO_MODAL_TYPES } from '../../components/Admin/TipoComercioModal';
import { useNotification } from '../../hooks/useNotification';
import { 
  getAllTiposComercio,
  createTipoComercio,
  updateTipoComercio,
  deleteTipoComercio,
  isTipoEnUso
} from '../../services/tiposComercioService';
import { getAllComercios } from '../../services/comerciosService';

const AdminTiposComercio = () => {
  // ESTADOS PRINCIPALES
  const [tipos, setTipos] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hook de notificaciones
  const { success, error, warning } = useNotification();

  // ESTADOS DE FILTROS
  const [filters, setFilters] = useState({
    busqueda: '',
    estado: ''
  });

  // ESTADOS DE MODAL UNIFICADO
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(TIPO_MODAL_TYPES.VIEW);
  const [selectedTipo, setSelectedTipo] = useState(null);

  // CARGAR DATOS
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tiposData, comerciosData] = await Promise.all([
        getAllTiposComercio(),
        getAllComercios()
      ]);
      setTipos(tiposData);
      setComercios(comerciosData);
    } catch (err) {
      error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // FILTRADO
  const filteredTipos = useMemo(() => {
    return tipos.filter(tipo => {
      const searchLower = filters.busqueda.toLowerCase();
      const descripcion = (tipo.descripcion || tipo.Descripcion || '').toLowerCase();
      
      if (!descripcion.includes(searchLower)) {
        return false;
      }

      if (filters.estado !== '') {
        const tipoEstado = tipo.estado ?? tipo.Estado;
        if (filters.estado === 'activo' && !tipoEstado) return false;
        if (filters.estado === 'inactivo' && tipoEstado) return false;
      }

      return true;
    });
  }, [tipos, filters]);

  // CONFIGURACIÓN DE FILTROS
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar Tipo',
      value: filters.busqueda,
      placeholder: 'Buscar por nombre del tipo...'
    },
    {
      key: 'estado',
      type: 'select',
      label: 'Estado',
      value: filters.estado,
      options: [
        { value: 'activo', label: 'Activos' },
        { value: 'inactivo', label: 'Inactivos' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ busqueda: '', estado: '' });
  };

  // Contar comercios por tipo
  const getComerciosCount = (tipoId) => {
    return comercios.filter(c => 
      (c.iD_TipoComercio || c.ID_TipoComercio) === tipoId
    ).length;
  };

  // Emoji según tipo
  const getEmojiForTipo = (descripcion) => {
    const desc = (descripcion || '').toLowerCase();
    if (desc.includes('bar')) return '🍺';
    if (desc.includes('boliche') || desc.includes('disco')) return '🪩';
    if (desc.includes('restaurant')) return '🍽️';
    if (desc.includes('cafe') || desc.includes('café')) return '☕';
    if (desc.includes('pub')) return '🍻';
    return '🏪';
  };

  // HANDLERS DE MODALES
  const openViewModal = (tipo) => {
    setSelectedTipo(tipo);
    setModalType(TIPO_MODAL_TYPES.VIEW);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedTipo(null);
    setModalType(TIPO_MODAL_TYPES.CREATE);
    setShowModal(true);
  };

  const openEditModal = (tipo) => {
    setSelectedTipo(tipo);
    setModalType(TIPO_MODAL_TYPES.EDIT);
    setShowModal(true);
  };

  const openDeleteModal = (tipo) => {
    const tipoId = tipo.iD_TipoComercio || tipo.ID_TipoComercio;
    const enUso = isTipoEnUso(tipoId, comercios);
    
    if (enUso) {
      const cantidadComercios = getComerciosCount(tipoId);
      warning(`No se puede eliminar el tipo "${tipo.descripcion || tipo.Descripcion}" porque está siendo usado por ${cantidadComercios} comercio(s)`);
      return;
    }

    setSelectedTipo(tipo);
    setModalType(TIPO_MODAL_TYPES.DELETE);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTipo(null);
  };

  // ACCIONES
  const handleSubmit = async (data) => {
    try {
      switch (modalType) {
        case TIPO_MODAL_TYPES.CREATE:
          await createTipoComercio({ 
            descripcion: data.descripcion,
            estado: true 
          });
          success('Tipo de comercio creado correctamente');
          break;
          
        case TIPO_MODAL_TYPES.EDIT:
          const tipoIdEdit = selectedTipo.iD_TipoComercio || selectedTipo.ID_TipoComercio;
          await updateTipoComercio(tipoIdEdit, {
            ID_TipoComercio: tipoIdEdit,
            Descripcion: data.descripcion,
            Estado: selectedTipo.estado ?? selectedTipo.Estado
          });
          success('Tipo de comercio actualizado correctamente');
          break;
          
        case TIPO_MODAL_TYPES.DELETE:
          const tipoIdDelete = data.iD_TipoComercio || data.ID_TipoComercio;
          await deleteTipoComercio(tipoIdDelete);
          success(`Tipo "${data.descripcion || data.Descripcion}" eliminado correctamente`);
          break;
          
        default:
          break;
      }
      
      closeModal();
      loadData();
    } catch (err) {
      error(`Error al ${modalType === TIPO_MODAL_TYPES.DELETE ? 'eliminar' : 'guardar'} el tipo`);
    }
  };

  // TOGGLE ESTADO
  const handleToggleEstado = async (tipo) => {
    try {
      const tipoId = tipo.iD_TipoComercio || tipo.ID_TipoComercio;
      const nuevoEstado = !(tipo.estado ?? tipo.Estado);
      
      await updateTipoComercio(tipoId, {
        ID_TipoComercio: tipoId,
        Descripcion: tipo.descripcion || tipo.Descripcion,
        Estado: nuevoEstado
      });
      
      success(`Tipo ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
      loadData();
    } catch (err) {
      error('Error al cambiar el estado');
    }
  };

  // COLUMNAS DE LA TABLA
  const columns = [
    {
      key: 'icono',
      header: '',
      accessor: (row) => getEmojiForTipo(row.descripcion || row.Descripcion),
      sortable: false,
      render: (row) => (
        <span className="text-2xl">
          {getEmojiForTipo(row.descripcion || row.Descripcion)}
        </span>
      ),
      width: '5%'
    },
    {
      key: 'id',
      header: 'ID',
      accessor: (row) => row.iD_TipoComercio || row.ID_TipoComercio,
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          #{row.iD_TipoComercio || row.ID_TipoComercio}
        </span>
      ),
      width: '10%'
    },
    {
      key: 'descripcion',
      header: 'Nombre del Tipo',
      accessor: (row) => row.descripcion || row.Descripcion,
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900">
          {row.descripcion || row.Descripcion}
        </span>
      ),
      width: '30%'
    },
    {
      key: 'comercios',
      header: 'Comercios',
      accessor: (row) => getComerciosCount(row.iD_TipoComercio || row.ID_TipoComercio),
      sortable: true,
      render: (row) => {
        const count = getComerciosCount(row.iD_TipoComercio || row.ID_TipoComercio);
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
            <Store className="w-4 h-4" />
            {count}
          </span>
        );
      },
      width: '15%'
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado ?? row.Estado,
      sortable: true,
      render: (row) => {
        const estado = row.estado ?? row.Estado;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleEstado(row);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              estado
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
            title={`Clic para ${estado ? 'desactivar' : 'activar'}`}
          >
            {estado ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Activo
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Inactivo
              </>
            )}
          </button>
        );
      },
      width: '15%'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => {
        const tipoId = row.iD_TipoComercio || row.ID_TipoComercio;
        const enUso = isTipoEnUso(tipoId, comercios);
        
        return (
          <div className="flex items-center justify-center gap-1">
            {/* Editar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(row);
              }}
              className="p-2 rounded-lg transition-colors text-blue-600 hover:bg-blue-50"
              title="Editar tipo"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Eliminar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(row);
              }}
              disabled={enUso}
              className={`p-2 rounded-lg transition-colors ${
                enUso
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50'
              }`}
              title={enUso ? 'Este tipo está en uso' : 'Eliminar tipo'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
      width: '15%'
    }
  ];

  // HEADER ACTIONS
  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportMenu 
        data={filteredTipos} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="tipos_comercio"
      />
      <button
        onClick={openCreateModal}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="w-5 h-5" />
        Nuevo Tipo
      </button>
    </div>
  );

  // ESTADÍSTICAS PARA SUBTITLE
  const tiposActivos = tipos.filter(t => t.estado ?? t.Estado).length;
  const tiposInactivos = tipos.length - tiposActivos;

  // RENDER
  if (loading) {
    return (
      <AdminLayout title="Gestión de Tipos de Comercio" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Tipos de Comercio"
      subtitle={`${tipos.length} tipos • ${tiposActivos} activos • ${tiposInactivos} inactivos • ${comercios.length} comercios`}
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
      {(filters.busqueda || filters.estado) && (
        <div className="mb-4">
          <ActiveFilters
            filters={filterConfig}
            onRemove={(key) => handleFilterChange(key, '')}
            onClearAll={handleClearFilters}
          />
        </div>
      )}

      {/* Tabla */}
      <DataTable
        data={filteredTipos}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={false}
        loading={loading}
        emptyMessage="No se encontraron tipos de comercio"
        onRowClick={openViewModal}
      />

      {/* MODAL UNIFICADO */}
      <TipoComercioModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        tipo={selectedTipo}
        type={modalType}
        comerciosCount={selectedTipo ? getComerciosCount(selectedTipo.iD_TipoComercio || selectedTipo.ID_TipoComercio) : 0}
      />
    </AdminLayout>
  );
};

export default AdminTiposComercio;