// ComercioCard.jsx - Tarjeta de comercio
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Edit2, Trash2, Calendar, CheckCircle, 
  XCircle, AlertTriangle, Clock, Users, Store, Eye,
  ChevronRight, Star
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { deleteComercio } from '../../services/comerciosService';
import { getAllReservas } from '../../services/reservasService';
import { convertBase64ToImage } from '../../utils/formatters';
import DeleteComercioModal from './DeleteComercioModal';

// Mapeo de tipos de comercio
const TIPOS_COMERCIO_DESCRIPCION = {
  1: 'Bar',
  2: 'Restaurante',
  3: 'Boliche',
  4: 'Café',
  5: 'Pub',
};

const ComercioCard = ({ comercio, onEdit, onReload }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ total: 0, pendientes: 0, hoy: 0 });
  const [loading, setLoading] = useState(true);

  // Imagen del comercio
  const imageUrl = comercio.foto 
    ? convertBase64ToImage(comercio.foto)
    : 'https://via.placeholder.com/400x200?text=Sin+Imagen';

  useEffect(() => {
    cargarEstadisticas();
  }, [comercio.iD_Comercio]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const allReservas = await getAllReservas();
      
      const reservasComercio = allReservas.filter(r => r.iD_Comercio === comercio.iD_Comercio);
      
      const pendientes = reservasComercio.filter(r => 
        r.estado === false && !r.motivoRechazo
      ).length;
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      const reservasHoy = reservasComercio.filter(r => {
        const fechaReserva = new Date(r.fechaReserva);
        return fechaReserva >= hoy && fechaReserva < mañana && r.estado === true;
      }).length;
      
      setEstadisticas({
        total: reservasComercio.length,
        pendientes: pendientes,
        hoy: reservasHoy
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteComercio(comercio.iD_Comercio);
      success('Comercio eliminado exitosamente');
      setShowDeleteModal(false);
      if (onReload) onReload();
    } catch (error) {
      console.error('Error eliminando comercio:', error);
      showError('Error al eliminar el comercio');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerReservas = () => {
    navigate('/mis-reservas', { state: { activeTab: 'reservas-recibidas' } });
  };

  // Obtener info del estado
  const getEstadoInfo = () => {
    if (comercio.estado === false && comercio.motivoRechazo && comercio.motivoRechazo.trim() !== '') {
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
  const tipoComercio = TIPOS_COMERCIO_DESCRIPCION[comercio.iD_TipoComercio] || 'Comercio';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={comercio.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
            }}
          />
          
          {/* Badge de estado */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${estadoInfo.bgColor} ${estadoInfo.textColor} border ${estadoInfo.borderColor}`}>
              <EstadoIcon className="w-3.5 h-3.5" />
              {estadoInfo.texto}
            </span>
          </div>

          {/* Badge de tipo */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
              {tipoComercio}
            </span>
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        {/* Contenido */}
        <div className="p-5">
          {/* Nombre */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
            {comercio.nombre}
          </h3>

          {/* Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="line-clamp-2">{comercio.direccion || 'Sin dirección'}</span>
            </div>

            {comercio.telefono && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{comercio.telefono}</span>
              </div>
            )}
          </div>

          {/* Mini stats */}
          {comercio.estado === true && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-gray-900">{estadisticas.hoy}</p>
                <p className="text-xs text-gray-500">Hoy</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-amber-600">{estadisticas.pendientes}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-gray-900">{estadisticas.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          )}

          {/* Motivo de rechazo */}
          {comercio.motivoRechazo && comercio.motivoRechazo.trim() !== '' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo:</p>
              <p className="text-sm text-red-600 line-clamp-2">{comercio.motivoRechazo}</p>
            </div>
          )}
          
          {/* Botones */}
          <div className="space-y-2">
            {/* Ver Reservas - Solo si está visible */}
            {comercio.estado === true && (
              <button
                onClick={handleVerReservas}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
              >
                <Calendar className="w-4 h-4" />
                Ver Reservas Recibidas
                {estadisticas.pendientes > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {estadisticas.pendientes}
                  </span>
                )}
              </button>
            )}
            
            {/* Editar y Eliminar */}
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-12 flex items-center justify-center border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de eliminar */}
      <DeleteComercioModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        comercio={comercio}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ComercioCard;