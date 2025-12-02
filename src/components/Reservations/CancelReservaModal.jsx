// CancelReservaModal.jsx - Modal amigable para cancelar reservas
import { useState } from 'react';
import { X, AlertTriangle, Calendar, Users, MapPin } from 'lucide-react';

const CancelReservaModal = ({ isOpen, onClose, reserva, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !reserva) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-ES', opciones);
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '--:--';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(reserva);
      onClose();
    } catch (error) {
      error('Error al cancelar:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Cancelar Reserva</h3>
                <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="p-2 hover:bg-white/20 rounded-full transition disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que deseas cancelar tu reserva para <strong>{reserva.comercio?.nombre}</strong>?
          </p>

          {/* Detalles de la reserva */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3 mb-6">
            <h4 className="font-semibold text-red-900 mb-3">Detalles de la reserva:</h4>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Lugar</p>
                <p className="text-sm font-semibold text-gray-900">
                  {reserva.comercio?.nombre || 'Comercio'}
                </p>
                {reserva.comercio?.direccion && (
                  <p className="text-xs text-gray-600">{reserva.comercio.direccion}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Fecha y hora</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatearFecha(reserva.fechaReserva)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatearHora(reserva.fechaReserva)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Personas</p>
                <p className="text-sm font-semibold text-gray-900">
                  {reserva.comensales || 1} {(reserva.comensales || 1) === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">
                  Importante
                </p>
                <p className="text-sm text-yellow-700">
                  Una vez cancelada, no podrás recuperar esta reserva. Si cambias de opinión, 
                  deberás crear una nueva reserva.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              No, mantener reserva
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Cancelando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Sí, cancelar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelReservaModal;