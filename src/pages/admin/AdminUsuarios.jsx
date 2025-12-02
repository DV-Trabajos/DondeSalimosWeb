// AdminUsuarios.jsx - DataTable con filtros y exportación
import { useState, useEffect } from 'react';
import { 
  User, Shield, Store, Plus, Trash2, Edit, 
  CheckCircle, Ban, Mail, X
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import UsuarioDetailModal from '../../components/Admin/UsuarioDetailModal';
import { 
  getAllUsuarios, 
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario 
} from '../../services/usuariosService';
import { getAllRoles } from '../../services/rolesUsuarioService';
import { ConfirmationModal, NotificationModal, InputModal } from '../../components/Modals';

const AdminUsuarios = () => {
  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    rol: '',
    estado: '',
    busqueda: ''
  });

  // Estados de modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);  // ⭐ NUEVO
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ iD_RolUsuario: 16 });
  const [notification, setNotification] = useState(null);
  
  // Modales personalizados
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'warning',
    title: '',
    message: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
  });

  const [inputModal, setInputModal] = useState({
    show: false,
    title: '',
    message: '',
    placeholder: '',
    expectedValue: '',
    onConfirm: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar usuarios y roles en paralelo
      const [usuariosData, rolesData] = await Promise.all([
        getAllUsuarios(),
        getAllRoles()
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (error) {
      showNotification('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      showNotification('Error al cargar usuarios', 'error');
    }
  };

  // FUNCIONES HELPER PARA MODALES
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showConfirmation = (type, title, message, description, confirmText, onConfirm) => {
    setConfirmModal({
      show: true,
      type,
      title,
      message,
      description,
      confirmText,
      cancelText: 'Cancelar',
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, show: false });
  };

  const showInputModalFunc = (title, message, placeholder, expectedValue, onConfirm) => {
    setInputModal({
      show: true,
      title,
      message,
      placeholder,
      expectedValue,
      onConfirm,
    });
  };

  const closeInputModal = () => {
    setInputModal({ ...inputModal, show: false });
  };

  // APLICAR FILTROS
  const filteredUsuarios = usuarios.filter(usuario => {
    // Filtro por rol
    if (filters.rol && usuario.iD_RolUsuario !== parseInt(filters.rol)) {
      return false;
    }

    // Filtro por estado
    if (filters.estado !== '') {
      const isActive = filters.estado === 'true';
      if (usuario.estado !== isActive) return false;
    }

    // Filtro por búsqueda (nombre o email)
    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase();
      const matchesName = usuario.nombreUsuario?.toLowerCase().includes(searchTerm);
      const matchesEmail = usuario.correo?.toLowerCase().includes(searchTerm);
      
      if (!matchesName && !matchesEmail) {
        return false;
      }
    }

    return true;
  });

  // CONFIGURACIÓN DE FILTROS DINÁMICOS CON ROLES DE LA API
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'text',
      label: 'Buscar Usuario',
      value: filters.busqueda,
      placeholder: 'Buscar por nombre o email...'
    },
    {
      key: 'rol',
      type: 'select',
      label: 'Rol de Usuario',
      value: filters.rol,
      options: roles.map(rol => ({
        value: rol.iD_RolUsuario.toString(),
        label: rol.descripcion
      }))
    },
    {
      key: 'estado',
      type: 'select',
      label: 'Estado',
      value: filters.estado,
      options: [
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
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
      rol: '',
      estado: '',
      busqueda: ''
    });
  };

  // HANDLERS DE ACCIONES
  // Helper para obtener descripción de rol dinámicamente
  const getRoleDescription = (roleId) => {
    const rol = roles.find(r => r.iD_RolUsuario === roleId);
    return rol?.descripcion || 'Desconocido';
  };

  // EDITAR USUARIO - Ahora abre modal de edición
  const handleEditUsuario = (usuario) => {
    setSelectedUser(usuario);
    setEditData({ iD_RolUsuario: usuario.iD_RolUsuario });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = {
        ...selectedUser,
        iD_RolUsuario: parseInt(editData.iD_RolUsuario),
      };
      
      await actualizarUsuario(selectedUser.iD_Usuario, updatedUser);
      showNotification('Rol actualizado correctamente', 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      loadUsuarios();
    } catch (error) {
      showNotification('Error al actualizar el usuario', 'error');
    }
  };

  // TOGGLE ESTADO - Usa el endpoint cambiarEstado para activar y desactivar
  const handleToggleEstado = async (usuario) => {
    const nuevoEstado = !usuario.estado;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    showConfirmation(
      nuevoEstado ? 'success' : 'warning',
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      `¿Estás seguro de ${accion} a "${usuario.nombreUsuario}"?`,
      nuevoEstado 
        ? 'El usuario podrá volver a iniciar sesión normalmente.' 
        : 'El usuario no podrá iniciar sesión, pero sus datos se mantendrán.',
      `Sí, ${accion}`,
      async () => {
        try {
          // ⭐ Usar cambiarEstadoUsuario para ambos casos (activar y desactivar)
          await cambiarEstadoUsuario(usuario.iD_Usuario, nuevoEstado);
          showNotification(`Usuario ${accion}do correctamente`, 'success');
          loadUsuarios();
        } catch (error) {
          showNotification(`Error al ${accion} usuario`, 'error');
        }
      }
    );
  };

  /**
   * ELIMINAR USUARIO - Con InputModal para confirmación
   */
  const handleDeleteUsuario = async () => {
    // Primera confirmación
    showConfirmation(
      'danger',
      '⚠️ ¿ELIMINAR PERMANENTEMENTE?',
      `¿Estás seguro de eliminar a "${selectedUser.nombreUsuario}"?`,
      'ESTA ACCIÓN NO SE PUEDE DESHACER. Se eliminarán todos los datos del usuario incluyendo comercios, reservas y reseñas.',
      'Continuar',
      () => {
        // Segunda confirmación con InputModal
        showInputModalFunc(
          'Confirmación Final',
          'Para confirmar la eliminación permanente, escribe el nombre del usuario:',
          'Escribe el nombre del usuario',
          selectedUser.nombreUsuario,
          async () => {
            try {
              await eliminarUsuario(selectedUser.iD_Usuario);
              showNotification('Usuario eliminado correctamente', 'success');
              setShowDeleteModal(false);
              setSelectedUser(null);
              loadUsuarios();
            } catch (error) {
              showNotification('Error al eliminar usuario', 'error');
            }
          }
        );
      }
    );
  };

  // CONFIGURACIÓN DE COLUMNAS
  const columns = [
    {
      key: 'usuario',
      header: 'Usuario',
      accessor: (row) => row.nombreUsuario,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.nombreUsuario}</p>
            <p className="text-xs text-gray-500">{row.correo}</p>
          </div>
        </div>
      ),
      width: '30%'
    },
    {
      key: 'correo',
      header: 'Email',
      accessor: (row) => row.correo,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{row.correo}</span>
        </div>
      )
    },
    {
      key: 'rol',
      header: 'Rol',
      accessor: (row) => row.iD_RolUsuario,
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeClass(row.iD_RolUsuario)}`}>
          {getRoleIcon(row.iD_RolUsuario)}
          {getRoleDescription(row.iD_RolUsuario)}
        </span>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado,
      render: (row) => (
        row.estado ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3 h-3" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
            <Ban className="w-3 h-3" />
            Inactivo
          </span>
        )
      )
    },
    {
      key: 'fechaCreacion',
      header: 'Fecha de Registro',
      accessor: (row) => new Date(row.fechaCreacion).toLocaleDateString('es-AR'),
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.fechaCreacion).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      accessor: () => '',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditUsuario(row);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar rol"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleEstado(row);
            }}
            className={`p-2 rounded-lg transition-colors ${
              row.estado 
                ? 'text-orange-600 hover:bg-orange-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={row.estado ? 'Desactivar' : 'Activar'}
          >
            {row.estado ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row);
              setShowDeleteModal(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // ACCIONES MASIVAS
  const bulkActions = [
    {
      label: 'Desactivar seleccionados',
      icon: <Ban className="w-4 h-4" />,
      variant: 'danger',
      onClick: async (selectedUsers) => {
        showConfirmation(
          'warning',
          '¿Desactivar usuarios?',
          `¿Desactivar ${selectedUsers.length} usuario(s)?`,
          'Los usuarios no podrán iniciar sesión pero sus datos se mantendrán.',
          'Sí, desactivar',
          async () => {
            try {
              await Promise.all(
                selectedUsers
                  .filter(u => u.estado)
                  .map(u => cambiarEstadoUsuario(u.iD_Usuario, false))
              );
              showNotification('Usuarios desactivados correctamente', 'success');
              loadUsuarios();
            } catch (error) {
              showNotification('Error al desactivar usuarios', 'error');
            }
          }
        );
      }
    }
  ];

  // ACCIONES DEL HEADER
  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Exportar */}
      <ExportMenu 
        data={filteredUsuarios} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="usuarios"
      />
    </div>
  );

  // RENDER
  if (loading) {
    return (
      <AdminLayout title="Gestión de Usuarios" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Gestión de Usuarios"
      subtitle={`${filteredUsuarios.length} usuario${filteredUsuarios.length !== 1 ? 's' : ''} ${filters.rol || filters.estado || filters.busqueda ? 'filtrado' : 'encontrado'}${filteredUsuarios.length !== 1 ? 's' : ''}`}
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
      {(filters.rol || filters.estado || filters.busqueda) && (
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
        data={filteredUsuarios}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={true}
        onRowClick={(user) => {
          setSelectedUser(user);
          setShowDetailModal(true);
        }}
        onSelectionChange={(selected) => console.log('Seleccionados:', selected)}
        bulkActions={bulkActions}
        emptyMessage="No se encontraron usuarios con los filtros aplicados"
      />

      {/* Modal de Detalles del Usuario */}
      <UsuarioDetailModal
        usuario={selectedUser}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUser(null);
        }}
      />

      {/* Modal de Edición */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Editar Usuario
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Usuario:
                </label>
                <p className="text-gray-900">{selectedUser.nombreUsuario}</p>
                <p className="text-sm text-gray-600">{selectedUser.correo}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cambiar Rol:
                </label>
                <select
                  value={editData.iD_RolUsuario}
                  onChange={(e) => setEditData({ iD_RolUsuario: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {roles.map(rol => (
                    <option key={rol.iD_RolUsuario} value={rol.iD_RolUsuario}>
                      {rol.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && selectedUser && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUsuario}
          title="Eliminar Usuario"
          message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUser.nombreUsuario}"?`}
          description="Esta acción eliminará permanentemente todos los datos del usuario."
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {/* Modal de Confirmación personalizado */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />

      {/* InputModal para confirmación de eliminación */}
      <InputModal
        isOpen={inputModal.show}
        onClose={closeInputModal}
        onConfirm={inputModal.onConfirm}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        expectedValue={inputModal.expectedValue}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />

      {/* Notificación */}
      {notification && (
        <NotificationModal
          isOpen={!!notification}
          onClose={() => setNotification(null)}
          title={notification.type === 'success' ? 'Éxito' : 'Error'}
          message={notification.message}
          type={notification.type}
        />
      )}
    </AdminLayout>
  );
};

// HELPERS
const getRoleIcon = (roleId) => {
  const icons = {
    16: '👤',
    2: '👑',
    3: '🏪'
  };
  return icons[roleId] || '👤';
};

const getRoleBadgeClass = (roleId) => {
  const classes = {
    16: 'bg-blue-50 text-blue-700',
    2: 'bg-purple-50 text-purple-700',
    3: 'bg-green-50 text-green-700'
  };
  return classes[roleId] || 'bg-gray-50 text-gray-700';
};

export default AdminUsuarios;