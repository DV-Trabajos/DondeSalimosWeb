// RejectReservaModal.jsx - Modal para rechazar una reserva con motivo
import { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';

const RejectReservaModal = ({ isOpen, onClose, onConfirm, reserva }) => {
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !reserva) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que el motivo no esté vacío
    if (!motivo.trim()) {
      setError('Debes ingresar un motivo de rechazo');
      return;
    }

    if (motivo.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onConfirm(reserva, motivo.trim());
      // Reset y cerrar
      setMotivo('');
      setError('');
      onClose();
    } catch (err) {
      setError('Error al rechazar la reserva. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMotivo('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Rechazar Reserva</h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Información de la reserva */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 mb-2">
                <strong>Reserva:</strong> #{reserva.iD_Reserva}
              </p>
              <p className="text-sm text-red-800 mb-2">
                <strong>Cliente:</strong> {reserva.usuario?.nombreUsuario || 'No disponible'}
              </p>
              <p className="text-sm text-red-800">
                <strong>Comercio:</strong> {reserva.comercio?.nombre || 'No disponible'}
              </p>
            </div>

            {/* Campo de motivo */}
            <div className="mb-6">
              <label htmlFor="motivo" className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo del Rechazo <span className="text-red-600">*</span>
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError('');
                }}
                placeholder="Ejemplo: No hay disponibilidad para esa fecha y hora, todas las mesas están reservadas..."
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  error 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                }`}
                rows={5}
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Mínimo 10 caracteres
                </p>
                <p className="text-xs text-gray-500">
                  {motivo.length}/500
                </p>
              </div>
              
              {/* Mensaje de error */}
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Importante
                  </p>
                  <p className="text-sm text-yellow-700">
                    El cliente recibirá una notificación con el motivo del rechazo. 
                    Por favor, ser claro y profesional en la explicación.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !motivo.trim() || motivo.trim().length < 10}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rechazando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Rechazar Reserva
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RejectReservaModal;