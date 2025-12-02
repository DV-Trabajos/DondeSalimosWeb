// ConfirmActionModal.jsx - Modal para aprobar/rechazar comercios
import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Store, AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  comercio, 
  actionType // 'aprobar' o 'rechazar'
}) => {
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setMotivoRechazo('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !comercio) return null;

  const isAprobar = actionType === 'aprobar';
  const isRechazar = actionType === 'rechazar';

  const handleConfirm = async () => {
    // Si es rechazar, validar motivo
    if (isRechazar && !motivoRechazo.trim()) {
      setError('Debes ingresar un motivo para rechazar el comercio');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(isRechazar ? motivoRechazo.trim() : null);
    } catch (err) {
      setError('Error al procesar la acción');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Color según acción */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          isAprobar 
            ? 'bg-gradient-to-r from-green-500 to-green-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center gap-3 text-white">
            {isAprobar ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <h2 className="text-xl font-bold">
              {isAprobar ? 'Aprobar Comercio' : 'Rechazar Comercio'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Info del comercio */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div className={`p-3 rounded-lg ${
              isAprobar ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Store className={`w-6 h-6 ${
                isAprobar ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{comercio.nombre}</p>
              <p className="text-sm text-gray-600">{comercio.direccion}</p>
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <div className={`p-4 rounded-lg mb-6 ${
            isAprobar 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isAprobar ? 'text-green-600' : 'text-amber-600'
              }`} />
              <div>
                <p className={`font-semibold ${
                  isAprobar ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {isAprobar 
                    ? '¿Estás seguro de aprobar este comercio?' 
                    : '¿Estás seguro de rechazar este comercio?'
                  }
                </p>
                <p className={`text-sm mt-1 ${
                  isAprobar ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {isAprobar 
                    ? 'El comercio quedará visible para todos los usuarios de la plataforma.'
                    : 'El comercio será rechazado y el propietario será notificado del motivo.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Campo de motivo (solo para rechazar) */}
          {isRechazar && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => {
                  setMotivoRechazo(e.target.value);
                  setError('');
                }}
                placeholder="Ingresa el motivo por el cual se rechaza este comercio..."
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                rows="3"
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 ${
                isAprobar 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {isAprobar ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {isAprobar ? 'Aprobar' : 'Rechazar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;