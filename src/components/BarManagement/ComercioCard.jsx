// ComercioCard.jsx - Tarjeta de comercio
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, Trash2, MapPin, Phone, Calendar, CheckCircle, 
  XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { deleteComercio } from '../../services/comerciosService';
import { getAllReservas } from '../../services/reservasService';
import { getAllTiposComercio } from '../../services/tiposComercioService';
import { useNotification } from '../../hooks/useNotification';
import DeleteComercioModal from './DeleteComercioModal';
import { convertBase64ToImage } from '../../utils/formatters';

const ComercioCard = ({ comercio, onEdit, onReload }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    hoy: 0
  });
  
  // Estado para tipos de comercio dinámicos
  const [tiposComercioMap, setTiposComercioMap] = useState({});

  const imagenComercio = comercio.foto && comercio.foto.trim() !== ''
    ? convertBase64ToImage(comercio.foto)
    : 'https://via.placeholder.com/400x200?text=Sin+Imagen';

  // Cargar tipos de comercio desde la API
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const tipos = await getAllTiposComercio();
        // Crear mapa de ID -> Descripción
        const map = {};
        tipos.forEach(tipo => {
          const id = tipo.iD_TipoComercio || tipo.ID_TipoComercio;
          const desc = tipo.descripcion || tipo.Descripcion;
          if (id && desc) {
            map[id] = desc;
          }
        });
        setTiposComercioMap(map);
      } catch (error) {
        console.error('Error cargando tipos de comercio:', error);
        // Fallback en caso de error
        setTiposComercioMap({
          1: 'Bar',
          2: 'Boliche',
          3: 'Restaurante',
          4: 'Café',
          5: 'Pub',
        });
      }
    };
    cargarTipos();
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [comercio.iD_Comercio]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const allReservas = await getAllReservas();
      
      const reservasComercio = allReservas.filter(r => r.iD_Comercio === comercio.iD_Comercio);
      
      const pendientes = reservasComercio.filter(r => 
        r.estado === null || r.estado === undefined
      ).length;
      
      const hoy = reservasComercio.filter(r => {
        const fechaReserva = new Date(r.fechaReserva);
        const hoyFecha = new Date();
        return (
          fechaReserva.getDate() === hoyFecha.getDate() &&
          fechaReserva.getMonth() === hoyFecha.getMonth() &&
          fechaReserva.getFullYear() === hoyFecha.getFullYear()
        );
      }).length;

      setEstadisticas({
        total: reservasComercio.length,
        pendientes,
        hoy
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      setIsDeleting(true);
      await deleteComercio(comercio.iD_Comercio);
      success('Comercio eliminado correctamente');
      setShowDeleteModal(false);
      onReload?.();
    } catch (err) {
      showError('Error al eliminar el comercio');
    } finally {
      setIsDeleting(false);
    }
  };

  const getEstadoInfo = () => {
    if (comercio.estado === false && comercio.motivoRechazo) {
      return {
        texto: 'Rechazado',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: XCircle
      };
    }
    
    if (comercio.estado === true) {
      return {
        texto: 'Visible',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        icon: CheckCircle
      };
    }
    
    return {
      texto: 'Pendiente aprobación',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: AlertTriangle
    };
  };

  const estadoInfo = getEstadoInfo();
  const EstadoIcon = estadoInfo.icon;
  
  // Obtener tipo de comercio del mapa dinámico
  const tipoComercio = tiposComercioMap[comercio.iD_TipoComercio] || 'Comercio';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={imagenComercio}
            alt={comercio.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
            }}
          />
          
          {/* Badge de estado */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border-2 border-emerald-200">
            <span className={`flex items-center gap-1.5 text-xs font-bold ${estadoInfo.textColor}`}>
              <EstadoIcon className="w-3.5 h-3.5" />
              {estadoInfo.texto}
            </span>
          </div>

          {/* Badge del tipo */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border-2 border-purple-200">
            <span className="text-xs font-bold text-purple-600">
              {tipoComercio}
            </span>
          </div>
        </div>

        {/* Información */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
            {comercio.nombre}
          </h3>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span className="truncate">{comercio.direccion}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>{comercio.telefono || 'Sin teléfono'}</span>
            </div>
          </div>

          {/* Estadísticas de reservas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{estadisticas.hoy}</div>
              <div className="text-xs text-gray-600 mt-1">Hoy</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{estadisticas.pendientes}</div>
              <div className="text-xs text-gray-600 mt-1">Pendientes</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
          </div>

          {/* Botón Ver Reservas Recibidas */}
          <button
            onClick={() => navigate('/reservas-recibidas')}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-3"
          >
            <Calendar className="w-5 h-5" />
            Ver Reservas Recibidas
          </button>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(comercio)}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteComercioModal
        isOpen={showDeleteModal}
        comercio={comercio}
        onConfirm={handleEliminar}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ComercioCard;