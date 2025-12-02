// AdminRoles.jsx - Gestión de Roles de Usuario
import { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, Edit, Trash2, Eye, Users } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import RolModal, { ROL_MODAL_TYPES } from '../../components/Admin/RolModal';
import { useNotification } from '../../hooks/useNotification';
import { 
  getAllRoles, 
  createRol, 
  updateRol, 
  deleteRol,
  getRoleIcon,
  isSystemRole,
  isRolEnUso
} from '../../services/rolesUsuarioService';
import { getAllUsuarios } from '../../services/usuariosService';

const AdminRoles = () => {
  // ESTADOS PRINCIPALES
  const [roles, setRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hook de notificaciones
  const { success, error, warning } = useNotification();

  // ESTADOS DE FILTROS
  const [filters, setFilters] = useState({
    busqueda: ''
  });

  // ESTADOS DE MODAL UNIFICADO
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(ROL_MODAL_TYPES.VIEW);
  const [selectedRol, setSelectedRol] = useState(null);

  // CARGAR DATOS
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, usuariosData] = await Promise.all([
        getAllRoles(),
        getAllUsuarios()
      ]);
      setRoles(rolesData);
      setUsuarios(usuariosData);
    } catch (err) {
      error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // FILTRADO
  const filteredRoles = useMemo(() => {
    return roles.filter(rol => {
      const searchLower = filters.busqueda.toLowerCase();
      const descripcion = (rol.descripcion || '').toLowerCase();
      return descripcion.includes(searchLower);
    });
  }, [roles, filters]);

  // CONFIGURACIÓN DE FILTROS
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar Rol',
      value: filters.busqueda,
      placeholder: 'Buscar por nombre del rol...'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ busqueda: '' });
  };

  // Contar usuarios por rol
  const getUsuariosCount = (rolId) => {
    return usuarios.filter(u => 
      (u.iD_RolUsuario || u.ID_RolUsuario) === rolId
    ).length;
  };

  // HANDLERS DE MODALES
  const openViewModal = (rol) => {
    setSelectedRol(rol);
    setModalType(ROL_MODAL_TYPES.VIEW);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setSelectedRol(null);
    setModalType(ROL_MODAL_TYPES.CREATE);
    setShowModal(true);
  };

  const openEditModal = (rol) => {
    if (isSystemRole(rol.iD_RolUsuario || rol.ID_RolUsuario)) {
      warning('No se pueden editar los roles del sistema');
      return;
    }
    setSelectedRol(rol);
    setModalType(ROL_MODAL_TYPES.EDIT);
    setShowModal(true);
  };

  const openDeleteModal = (rol) => {
    const rolId = rol.iD_RolUsuario || rol.ID_RolUsuario;
    
    if (isSystemRole(rolId)) {
      warning('No se pueden eliminar los roles del sistema');
      return;
    }

    const enUso = isRolEnUso(rolId, usuarios);
    if (enUso) {
      const cantidadUsuarios = getUsuariosCount(rolId);
      warning(`No se puede eliminar el rol "${rol.descripcion}" porque está siendo usado por ${cantidadUsuarios} usuario(s)`);
      return;
    }

    setSelectedRol(rol);
    setModalType(ROL_MODAL_TYPES.DELETE);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRol(null);
  };

  // ACCIONES
  const handleSubmit = async (data) => {
    try {
      switch (modalType) {
        case ROL_MODAL_TYPES.CREATE:
          await createRol({ descripcion: data.descripcion });
          success('Rol creado correctamente');
          break;
          
        case ROL_MODAL_TYPES.EDIT:
          const rolIdEdit = selectedRol.iD_RolUsuario || selectedRol.ID_RolUsuario;
          await updateRol(rolIdEdit, {
            ...selectedRol,
            descripcion: data.descripcion
          });
          success('Rol actualizado correctamente');
          break;
          
        case ROL_MODAL_TYPES.DELETE:
          const rolIdDelete = data.iD_RolUsuario || data.ID_RolUsuario;
          await deleteRol(rolIdDelete);
          success(`Rol "${data.descripcion}" eliminado correctamente`);
          break;
          
        default:
          break;
      }
      
      closeModal();
      loadData();
    } catch (err) {
      error(`Error al ${modalType === ROL_MODAL_TYPES.DELETE ? 'eliminar' : 'guardar'} el rol`);
    }
  };

  // COLUMNAS DE LA TABLA
  const columns = [
    {
      key: 'icono',
      header: '',
      accessor: (row) => getRoleIcon(row.iD_RolUsuario || row.ID_RolUsuario),
      sortable: false,
      render: (row) => (
        <span className="text-2xl">
          {getRoleIcon(row.iD_RolUsuario || row.ID_RolUsuario)}
        </span>
      ),
      width: '5%'
    },
    {
      key: 'id',
      header: 'ID',
      accessor: (row) => row.iD_RolUsuario || row.ID_RolUsuario,
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          #{row.iD_RolUsuario || row.ID_RolUsuario}
        </span>
      ),
      width: '10%'
    },
    {
      key: 'descripcion',
      header: 'Nombre del Rol',
      accessor: (row) => row.descripcion,
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.descripcion}</span>
      ),
      width: '30%'
    },
    {
      key: 'usuarios',
      header: 'Usuarios',
      accessor: (row) => getUsuariosCount(row.iD_RolUsuario || row.ID_RolUsuario),
      sortable: true,
      render: (row) => {
        const count = getUsuariosCount(row.iD_RolUsuario || row.ID_RolUsuario);
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            <Users className="w-4 h-4" />
            {count}
          </span>
        );
      },
      width: '15%'
    },
    {
      key: 'tipo',
      header: 'Tipo',
      accessor: (row) => isSystemRole(row.iD_RolUsuario || row.ID_RolUsuario) ? 'Sistema' : 'Personalizado',
      sortable: true,
      render: (row) => {
        const esRolSistema = isSystemRole(row.iD_RolUsuario || row.ID_RolUsuario);
        
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            esRolSistema 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {esRolSistema ? '🔒 Sistema' : '✏️ Personalizado'}
          </span>
        );
      },
      width: '20%'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => {
        const rolId = row.iD_RolUsuario || row.ID_RolUsuario;
        const esRolSistema = isSystemRole(rolId);
        const enUso = isRolEnUso(rolId, usuarios);
        
        return (
          <div className="flex items-center justify-center gap-1">
            {/* Ver detalle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openViewModal(row);
              }}
              className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              title="Ver detalle"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Editar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(row);
              }}
              disabled={esRolSistema}
              className={`p-2 rounded-lg transition-colors ${
                esRolSistema
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title={esRolSistema ? 'Los roles del sistema no se pueden editar' : 'Editar rol'}
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Eliminar */}
            {!esRolSistema && (
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
                title={enUso ? 'Este rol está en uso' : 'Eliminar rol'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
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
        data={filteredRoles} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="roles"
      />
      <button
        onClick={openCreateModal}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25"
      >
        <Plus className="w-5 h-5" />
        Nuevo Rol
      </button>
    </div>
  );

  // ESTADÍSTICAS PARA SUBTITLE
  const rolesDelSistema = roles.filter(r => isSystemRole(r.iD_RolUsuario || r.ID_RolUsuario)).length;
  const rolesPersonalizados = roles.length - rolesDelSistema;

  // RENDER
  if (loading) {
    return (
      <AdminLayout title="Gestión de Roles" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Roles"
      subtitle={`${roles.length} roles • ${rolesDelSistema} del sistema • ${rolesPersonalizados} personalizados`}
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
      {filters.busqueda && (
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
        data={filteredRoles}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={false}
        loading={loading}
        emptyMessage="No se encontraron roles"
        onRowClick={openViewModal}
      />

      {/* MODAL UNIFICADO */}
      <RolModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        rol={selectedRol}
        type={modalType}
        usuariosCount={selectedRol ? getUsuariosCount(selectedRol.iD_RolUsuario || selectedRol.ID_RolUsuario) : 0}
      />
    </AdminLayout>
  );
};

export default AdminRoles;