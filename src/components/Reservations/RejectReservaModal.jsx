// RejectReservaModal.jsx - Modal para rechazar reserva con motivo obligatorio - Muestra información de la reserva y pide el motivo del rechazo
import { useState, useEffect } from 'react';
import { X, XCircle, AlertTriangle, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RejectReservaModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reserva, 
  isLoading = false,
  isPastReservation = false // Para reservas que ya pasaron
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError('');
    }
  }, [isOpen]);

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
    if (isLoading) return;

    // Validar motivo
    if (!motivo.trim()) {
      setError('Debes ingresar un motivo de rechazo');
      return;
    }

    if (motivo.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }

    setError('');
    onConfirm(reserva, motivo.trim());
  };

  // Motivos predefinidos para selección rápida
  const motivosPredefinidos = isPastReservation 
    ? [
        'No se presentó',
        'Reserva vencida sin confirmación',
        'Cliente no respondió'
      ]
    : [
        'No hay disponibilidad para esa fecha',
        'Capacidad máxima alcanzada',
        'Horario no disponible',
        'Local cerrado ese día'
      ];

  const seleccionarMotivoPredefinido = (motivoPredefinido) => {
    setMotivo(motivoPredefinido);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header Rojo/Naranja */}
        <div className={`px-6 py-4 ${
          isPastReservation 
            ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              {isPastReservation ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <h2 className="text-xl font-bold">
                {isPastReservation ? 'Marcar como No Asistió' : 'Rechazar Reserva'}
              </h2>
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
          <p className="text-lg text-gray-700 mb-4 text-center">
            {isPastReservation ? (
              <>¿Confirmas que el cliente <span className="font-bold text-orange-600">no asistió</span> a esta reserva?</>
            ) : (
              <>¿Estás seguro de <span className="font-bold text-red-600">rechazar</span> esta reserva?</>
            )}
          </p>

          {/* Información de la reserva */}
          <div className={`rounded-lg p-4 space-y-3 mb-4 border ${
            isPastReservation 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 flex-shrink-0 ${isPastReservation ? 'text-orange-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-semibold text-gray-900">
                  {reserva.usuario?.nombreUsuario || 'No disponible'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 flex-shrink-0 ${isPastReservation ? 'text-orange-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-semibold text-gray-900">
                  {formatearFecha(reserva.fechaReserva)} a las {formatearHora(reserva.fechaReserva)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 flex-shrink-0 ${isPastReservation ? 'text-orange-600' : 'text-red-600'}`} />
              <div>
                <p className="text-xs text-gray-500">Personas</p>
                <p className="font-semibold text-gray-900">
                  {reserva.comensales || reserva.comenzales || 1} {(reserva.comensales || reserva.comenzales || 1) === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>
          </div>

          {/* Motivos predefinidos */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Motivos frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {motivosPredefinidos.map((motivoPred, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => seleccionarMotivoPredefinido(motivoPred)}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    motivo === motivoPred
                      ? isPastReservation
                        ? 'bg-orange-100 border-orange-400 text-orange-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {motivoPred}
                </button>
              ))}
            </div>
          </div>

          {/* Campo de motivo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              placeholder={isPastReservation 
                ? "Ej: El cliente no se presentó a la hora acordada..."
                : "Explica brevemente por qué se rechaza esta reserva..."
              }
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
              rows="3"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {motivo.length}/200 caracteres
            </p>
          </div>

          {/* Nota informativa */}
          <div className={`border rounded-lg p-3 mb-6 ${
            isPastReservation 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm ${isPastReservation ? 'text-orange-700' : 'text-yellow-700'}`}>
              <strong>Nota:</strong> {isPastReservation 
                ? 'Esta acción marcará la reserva como no asistida. El cliente podrá ver el motivo.'
                : 'Se notificará al cliente que su reserva fue rechazada con el motivo indicado.'
              }
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
              disabled={isLoading || !motivo.trim()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isPastReservation 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>{isPastReservation ? 'Confirmar' : 'Rechazar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectReservaModal;
