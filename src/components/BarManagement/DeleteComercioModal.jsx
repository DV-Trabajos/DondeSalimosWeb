// DeleteComercioModal.jsx - Modal de confirmación para eliminar comercio
import { X, AlertTriangle, Trash2, Store, MapPin, Calendar, Loader2 } from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

const DeleteComercioModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  comercio, 
  isDeleting = false 
}) => {
  if (!isOpen || !comercio) return null;

  const imageUrl = comercio.foto 
    ? convertBase64ToImage(comercio.foto)
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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
                  <h2 className="text-xl font-bold">Eliminar Comercio</h2>
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
            {/* Tarjeta del comercio a eliminar */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border-2 border-gray-200">
              <div className="flex gap-4">
                {/* Imagen miniatura */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={comercio.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Info del comercio */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {comercio.nombre}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{comercio.direccion || 'Sin dirección'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Creado: {formatDate(comercio.fechaCreacion)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de advertencia */}
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold text-sm">
                    ¿Estás seguro de eliminar este comercio?
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Se eliminarán permanentemente:
                  </p>
                  <ul className="text-red-600 text-sm mt-2 space-y-1 ml-4 list-disc">
                    <li>Toda la información del comercio</li>
                    <li>Las reservas asociadas</li>
                    <li>Las publicidades vinculadas</li>
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

export default DeleteComercioModal;
