// ConfirmApproveModal.jsx - Modal de confirmación para aprobar reserva - Muestra información de la reserva y pide confirmación simple
import { X, CheckCircle, Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ConfirmApproveModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reserva, 
  isLoading = false 
}) => {
  if (!isOpen || !reserva) return null;

  // Formatear fecha
  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const formatearHora = (fecha) => {
    try {
      return format(new Date(fecha), "HH:mm", { locale: es });
    } catch {
      return '';
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm(reserva);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Verde */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Confirmar Aprobación</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Pregunta principal */}
          <p className="text-lg text-gray-700 mb-6 text-center">
            ¿Estás seguro de <span className="font-bold text-green-600">aprobar</span> esta reserva?
          </p>

          {/* Información de la reserva */}
          <div className="bg-green-50 rounded-lg p-4 space-y-3 mb-6 border border-green-200">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-semibold text-gray-900">
                  {reserva.usuario?.nombreUsuario || 'No disponible'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-semibold text-gray-900">
                  {formatearFecha(reserva.fechaReserva)} a las {formatearHora(reserva.fechaReserva)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Personas</p>
                <p className="font-semibold text-gray-900">
                  {reserva.comensales || reserva.comenzales || 1} {(reserva.comensales || reserva.comenzales || 1) === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Se notificará al cliente que su reserva fue aprobada.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Sí, Aprobar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApproveModal;
