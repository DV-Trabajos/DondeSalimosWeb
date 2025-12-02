// AdminResenias.jsx - Gestión completa de reseñas con filtros y acciones
import { useState, useEffect, useMemo } from 'react';
import { Star, Trash2, User, Store, CheckCircle, XCircle, Plus } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { TableFilters, ActiveFilters } from '../../components/Admin/TableFilters';
import ExportMenu from '../../components/Admin/ExportMenu';
import ReseniaDetailModal from '../../components/Admin/ReseniaDetailModal';
import CreateReseniaModal from '../../components/Admin/CreateReseniaModal';
import { ConfirmationModal, NotificationModal, InputModal } from '../../components/Modals';
import { getAllResenias, deleteResenia } from '../../services/adminService';
import { updateResenia, createResenia } from '../../services/reseniasService';
import { getAllUsuarios } from '../../services/usuariosService';
import { getAllComercios } from '../../services/comerciosService';
import { formatDate } from '../../utils/formatters';

const AdminResenias = () => {
  // Estados principales
  const [resenias, setResenias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para datos de formulario de crear
  const [usuarios, setUsuarios] = useState([]);
  const [comercios, setComercios] = useState([]);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    busqueda: '',
    estado: '',
    puntuacion: ''
  });

  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResenia, setSelectedResenia] = useState(null);
  
  // Estados para modales de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [modalConfig, setModalConfig] = useState({});

  useEffect(() => {
    loadResenias();
    loadUsuarios();
    loadComercios();
  }, []);

  const loadResenias = async () => {
    try {
      setLoading(true);
      const data = await getAllResenias();
      setResenias(data);
    } catch (err) {
      showNotificationFunc('Error al cargar las reseñas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await getAllUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  const loadComercios = async () => {
    try {
      const data = await getAllComercios();
      setComercios(data.filter(c => c.estado === true));
    } catch (err) {
      console.error('Error cargando comercios:', err);
    }
  };

  // HELPERS PARA MODALES
  const showConfirmation = (type, title, message, detail, confirmText, onConfirm) => {
    setModalConfig({
      type,
      title,
      message,
      detail,
      confirmText,
      onConfirm,
      onCancel: () => setShowConfirmModal(false)
    });
    setShowConfirmModal(true);
  };

  const showNotificationFunc = (message, type = 'success') => {
    setModalConfig({
      message,
      type,
      onClose: () => setShowNotification(false)
    });
    setShowNotification(true);
  };

  const showInputModalFunc = (title, message, placeholder, confirmText, onConfirm) => {
    setModalConfig({
      title,
      message,
      placeholder,
      confirmText,
      onConfirm,
      onCancel: () => setShowInputModal(false)
    });
    setShowInputModal(true);
  };

  // FILTROS
  const filteredResenias = useMemo(() => {
    return resenias.filter(resenia => {
      // Filtro de búsqueda
      if (filters.busqueda) {
        const busqueda = filters.busqueda.toLowerCase();
        const matchUsuario = resenia.usuario?.nombreUsuario?.toLowerCase().includes(busqueda);
        const matchComercio = resenia.comercio?.nombre?.toLowerCase().includes(busqueda);
        const matchComentario = resenia.comentario?.toLowerCase().includes(busqueda);
        if (!matchUsuario && !matchComercio && !matchComentario) return false;
      }

      // Filtro de estado
      if (filters.estado) {
        if (filters.estado === 'aprobada' && resenia.estado !== true) return false;
        if (filters.estado === 'pendiente' && (resenia.estado === true || resenia.motivoRechazo)) return false;
        if (filters.estado === 'rechazada' && !resenia.motivoRechazo) return false;
      }

      // Filtro de puntuación
      if (filters.puntuacion) {
        if (resenia.puntuacion !== parseInt(filters.puntuacion)) return false;
      }

      return true;
    });
  }, [resenias, filters]);

  // CONFIGURACIÓN DE FILTROS
  const filterConfig = [
    {
      key: 'busqueda',
      type: 'search',
      label: 'Buscar',
      placeholder: 'Buscar por usuario, comercio o comentario...',
      value: filters.busqueda
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
      key: 'puntuacion',
      type: 'select',
      label: 'Puntuación',
      value: filters.puntuacion,
      options: [
        { value: '5', label: '⭐⭐⭐⭐⭐ (5 estrellas)' },
        { value: '4', label: '⭐⭐⭐⭐ (4 estrellas)' },
        { value: '3', label: '⭐⭐⭐ (3 estrellas)' },
        { value: '2', label: '⭐⭐ (2 estrellas)' },
        { value: '1', label: '⭐ (1 estrella)' }
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
      puntuacion: ''
    });
  };

  // HANDLERS DE ACCIONES
  const handleCrearResenia = async (data) => {
    try {
      await createResenia(data);
      showNotificationFunc('Reseña creada correctamente', 'success');
      setShowCreateModal(false);
      loadResenias();
    } catch (err) {
      
      let errorMessage = 'Error al crear la reseña';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotificationFunc(errorMessage, 'error');
    }
  };

  const handleVerDetalle = (resenia) => {
    setSelectedResenia(resenia);
    setShowDetailModal(true);
  };

  const handleAprobar = (resenia) => {
    showConfirmation(
      'success',
      '✅ Aprobar Reseña',
      `¿Aprobar la reseña de "${resenia.usuario?.nombreUsuario || 'Usuario'}"?`,
      'La reseña será visible públicamente en el comercio.',
      'Sí, aprobar',
      async () => {
        try {
          const updatedData = {
            ...resenia,
            estado: true,
            motivoRechazo: null
          };
          
          await updateResenia(resenia.iD_Resenia, updatedData);
          showNotificationFunc('Reseña aprobada correctamente', 'success');
          setShowConfirmModal(false);
          loadResenias();
        } catch (err) {
          showNotificationFunc('Error al aprobar la reseña', 'error');
        }
      }
    );
  };

  const handleRechazar = (resenia) => {
    showInputModalFunc(
      '❌ Rechazar Reseña',
      `Rechazar reseña de "${resenia.usuario?.nombreUsuario || 'Usuario'}"`,
      'Motivo del rechazo (ej: Lenguaje inapropiado, spam, etc.)',
      'Rechazar',
      async (motivo) => {
        if (!motivo || motivo.trim() === '') {
          showNotificationFunc('Debes proporcionar un motivo de rechazo', 'error');
          return;
        }

        try {
          const updatedData = {
            ...resenia,
            estado: false,
            motivoRechazo: motivo
          };
          
          await updateResenia(resenia.iD_Resenia, updatedData);
          showNotificationFunc('Reseña rechazada correctamente', 'success');
          setShowInputModal(false);
          loadResenias();
        } catch (err) {
          showNotificationFunc('Error al rechazar la reseña', 'error');
        }
      }
    );
  };

  const handleEliminar = (resenia) => {
    showConfirmation(
      'danger',
      '⚠️ Eliminar Reseña',
      `¿Eliminar permanentemente la reseña de "${resenia.usuario?.nombreUsuario || 'Usuario'}"?`,
      'ESTA ACCIÓN NO SE PUEDE DESHACER. La reseña será eliminada de forma permanente.',
      'Sí, eliminar',
      async () => {
        try {
          await deleteResenia(resenia.iD_Resenia);
          showNotificationFunc('Reseña eliminada correctamente', 'success');
          setShowConfirmModal(false);
          loadResenias();
        } catch (err) {
          showNotificationFunc('Error al eliminar la reseña', 'error');
        }
      }
    );
  };

  // CONFIGURACIÓN DE COLUMNAS
  const columns = [
    {
      key: 'usuario',
      header: 'Usuario',
      accessor: (row) => row.usuario?.nombreUsuario || 'N/A',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {row.usuario?.nombreUsuario || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500">
              {row.usuario?.correo || ''}
            </p>
          </div>
        </div>
      ),
      width: '18%'
    },
    {
      key: 'comercio',
      header: 'Comercio',
      accessor: (row) => row.comercio?.nombre || 'N/A',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-gray-400" />
          <p className="font-medium text-gray-900">
            {row.comercio?.nombre || 'N/A'}
          </p>
        </div>
      ),
      width: '15%'
    },
    {
      key: 'puntuacion',
      header: 'Puntuación',
      accessor: (row) => row.puntuacion,
      render: (row) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < row.puntuacion
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
          <span className="ml-1 text-sm font-medium text-gray-600">
            ({row.puntuacion})
          </span>
        </div>
      ),
      width: '12%'
    },
    {
      key: 'comentario',
      header: 'Comentario',
      accessor: (row) => row.comentario || '',
      render: (row) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
          {row.comentario || 'Sin comentario'}
        </p>
      ),
      width: '20%'
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
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3" />
              Aprobada
            </span>
          );
        }
        if (row.motivoRechazo) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <XCircle className="w-3 h-3" />
              Rechazada
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pendiente
          </span>
        );
      },
      width: '10%'
    },
    {
      key: 'fechaCreacion',
      header: 'Fecha',
      accessor: (row) => row.fechaCreacion,
      render: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.fechaCreacion)}
        </span>
      ),
      width: '10%'
    },
    {
      key: 'acciones',
      header: 'Acciones',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Botones de aprobar/rechazar solo para pendientes */}
          {!row.estado && !row.motivoRechazo && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAprobar(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Aprobar reseña"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRechazar(row);
                }}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                title="Rechazar reseña"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEliminar(row);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Eliminar reseña"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '10%'
    }
  ];

  // ACCIONES MASIVAS
  const bulkActions = [
    {
      label: 'Aprobar seleccionadas',
      variant: 'success',
      onClick: async (selectedResenias) => {
        const pendientes = selectedResenias.filter(r => !r.estado && !r.motivoRechazo);
        
        if (pendientes.length === 0) {
          showNotificationFunc('No hay reseñas pendientes en la selección', 'warning');
          return;
        }

        showConfirmation(
          'success',
          'Aprobar múltiples reseñas',
          `¿Aprobar ${pendientes.length} reseña(s) pendiente(s)?`,
          'Las reseñas seleccionadas serán visibles públicamente.',
          'Sí, aprobar todas',
          async () => {
            try {
              await Promise.all(
                pendientes.map(r => 
                  updateResenia(r.iD_Resenia, { ...r, estado: true, motivoRechazo: null })
                )
              );
              showNotificationFunc(`${pendientes.length} reseña(s) aprobada(s) correctamente`, 'success');
              setShowConfirmModal(false);
              loadResenias();
            } catch (err) {
              showNotificationFunc('Error al aprobar las reseñas', 'error');
            }
          }
        );
      }
    },
    {
      label: 'Eliminar seleccionadas',
      variant: 'danger',
      onClick: async (selectedResenias) => {
        showConfirmation(
          'danger',
          '⚠️ Eliminar múltiples reseñas',
          `¿Eliminar ${selectedResenias.length} reseña(s)?`,
          'ESTA ACCIÓN NO SE PUEDE DESHACER.',
          'Sí, eliminar todas',
          async () => {
            try {
              await Promise.all(
                selectedResenias.map(r => deleteResenia(r.iD_Resenia))
              );
              showNotificationFunc(`${selectedResenias.length} reseña(s) eliminada(s) correctamente`, 'success');
              setShowConfirmModal(false);
              loadResenias();
            } catch (err) {
              showNotificationFunc('Error al eliminar las reseñas', 'error');
            }
          }
        );
      }
    }
  ];

  // ACCIONES DEL HEADER
  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportMenu 
        data={filteredResenias} 
        columns={columns.filter(c => c.key !== 'acciones')} 
        filename="resenias"
      />
      <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all shadow-lg shadow-purple-500/25"
      >
        <Plus className="w-5 h-5" />
        Nueva Reseña
      </button>
    </div>
  );

  // ESTADÍSTICAS
  const aprobadas = resenias.filter(r => r.estado === true).length;
  const pendientes = resenias.filter(r => !r.estado && !r.motivoRechazo).length;
  const rechazadas = resenias.filter(r => r.motivoRechazo).length;
  const promedioGeneral = resenias.length > 0
    ? (resenias.reduce((sum, r) => sum + r.puntuacion, 0) / resenias.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <AdminLayout title="Moderación de Reseñas" subtitle="Cargando...">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Moderación de Reseñas"
      subtitle={`${filteredResenias.length} reseña${filteredResenias.length !== 1 ? 's' : ''} ${filters.busqueda || filters.estado || filters.puntuacion ? 'filtrada' : 'encontrada'}${filteredResenias.length !== 1 ? 's' : ''} • ${pendientes} pendientes • ${aprobadas} aprobadas • ${rechazadas} rechazadas • ⭐ ${promedioGeneral} promedio`}
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
      {(filters.busqueda || filters.estado || filters.puntuacion) && (
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
        data={filteredResenias}
        columns={columns}
        itemsPerPage={10}
        sortable={true}
        searchable={false}
        pagination={true}
        selectable={true}
        bulkActions={bulkActions}
        onRowClick={(resenia) => handleVerDetalle(resenia)}
        emptyMessage="No se encontraron reseñas con los filtros aplicados"
      />

      {/* Modal de Detalle */}
      <ReseniaDetailModal
        resenia={selectedResenia}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedResenia(null);
        }}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
      />

      {/* Modal de Crear */}
      <CreateReseniaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCrearResenia}
        usuarios={usuarios}
        comercios={comercios}
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
          type={modalConfig.type}
        />
      )}

      {/* Modal de Input */}
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

export default AdminResenias;