// DeletePublicidadModal.jsx - Modal de confirmación para eliminar publicidad
import { X, AlertTriangle, Trash2, Megaphone, Calendar, Eye, DollarSign, Loader2 } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

// Función para convertir TimeSpan del backend a días
const convertirTimeSpanADias = (tiempo) => {
  if (!tiempo) return 7;
  if (typeof tiempo === 'number') {
    // Workaround: 23 significa 30 días
    return tiempo === 23 ? 30 : tiempo;
  }
  
  // Si es string tipo "15:00:00" o "15.00:00:00"
  const str = String(tiempo);
  let dias = 7;
  
  // Formato con punto: "15.00:00:00" (días.horas:minutos:segundos)
  if (str.includes('.')) {
    dias = parseInt(str.split('.')[0]) || 7;
  } else {
    // Formato sin punto: "15:00:00" (el primer número son los días)
    const partes = str.split(':');
    if (partes.length > 0) {
      dias = parseInt(partes[0]) || 7;
    }
  }

  return dias === 23 ? 30 : dias;
};

const DeletePublicidadModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  publicidad,
  nombreComercio,
  isDeleting = false 
}) => {
  if (!isOpen || !publicidad) return null;

  const imageUrl = publicidad.imagen 
    ? convertBase64ToImage(publicidad.imagen)
    : null;

  // Formatear precio
  const formatPrice = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  // Calcular precio basado en días
  const getPrecio = () => {
    const dias = convertirTimeSpanADias(publicidad.tiempo);
    const precios = { 7: 45000, 15: 75000, 30: 140000 };
    
    // Si coincide exactamente con un plan
    if (precios[dias]) return precios[dias];
    
    // Precio por defecto basado en días
    return dias * 6000;
  };

  // Obtener días de la publicidad
  const getDias = () => {
    return convertirTimeSpanADias(publicidad.tiempo);
  };

  // Obtener estado de la publicidad
  const getEstadoInfo = () => {
    if (!publicidad.estado && publicidad.motivoRechazo) {
      return { texto: 'Rechazada', color: 'red', icon: '❌' };
    }
    if (!publicidad.estado) {
      return { texto: 'Pendiente aprobación', color: 'yellow', icon: '⏳' };
    }
    if (publicidad.estado && !publicidad.pago) {
      return { texto: 'Sin pagar', color: 'orange', icon: '💳' };
    }
    return { texto: 'Activa', color: 'green', icon: '✅' };
  };

  const estadoInfo = getEstadoInfo();

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Eliminar Publicidad</h2>
                  <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
              {!isDeleting && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Card de la publicidad a eliminar */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
              <div className="flex gap-4">
                {/* Imagen miniatura */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Publicidad"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Info de la publicidad */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {nombreComercio || 'Publicidad'}
                  </h3>
                  
                  {publicidad.descripcion && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {publicidad.descripcion}
                    </p>
                  )}
                  
                  {/* Estado badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${estadoInfo.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                      ${estadoInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${estadoInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                      ${estadoInfo.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {estadoInfo.icon} {estadoInfo.texto}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                    <Calendar className="w-3 h-3" />
                    Duración
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{getDias()} días</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                    <Eye className="w-3 h-3" />
                    Vistas
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{publicidad.visualizaciones || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-500 text-xs mb-1">
                    <DollarSign className="w-3 h-3" />
                    Precio
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{formatPrice(getPrecio())}</p>
                </div>
              </div>
            </div>

            {/* Mensaje de advertencia */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold text-sm">
                    ¿Estás seguro de eliminar esta publicidad?
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Se eliminará permanentemente:
                  </p>
                  <ul className="text-red-600 text-sm mt-2 space-y-1 ml-4 list-disc">
                    <li>La imagen y contenido de la publicidad</li>
                    <li>Las estadísticas de visualizaciones</li>
                    {publicidad.pago && (
                      <li className="font-semibold">El pago realizado NO será reembolsado</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePublicidadModal;