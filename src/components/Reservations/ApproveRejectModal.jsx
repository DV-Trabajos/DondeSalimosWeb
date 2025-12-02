// src/components/Reservations/ApproveRejectModal.jsx
import { useState } from 'react';
import { X, CheckCircle, XCircle, Calendar, Users, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

//Modal para aprobar o rechazar una reserva
const ApproveRejectModal = ({ reserva, onApprove, onReject, onClose, isLoading = false }) => {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');

  // Formatear fecha
  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), "EEEE d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const handleApprove = () => {
    if (isLoading) return;
    setError('');
    onApprove(reserva);
  };

  const handleReject = () => {
    if (isLoading) return;
    
    if (showRejectForm && !motivoRechazo.trim()) {
      setError('Por favor, proporciona un motivo de rechazo');
      return;
    }
    
    setError('');
    onReject(reserva, motivoRechazo);
  };

  const toggleRejectForm = () => {
    setShowRejectForm(!showRejectForm);
    setMotivoRechazo('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Gestionar Reserva
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información de la reserva */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold text-gray-900">
                  {reserva.usuario?.nombreUsuario || 'Usuario desconocido'}
                </p>
                {reserva.usuario?.telefono && (
                  <p className="text-sm text-gray-600">
                    Tel: {reserva.usuario.telefono}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Fecha y hora</p>
                <p className="font-semibold text-gray-900">
                  {formatearFecha(reserva.fechaReserva)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Cantidad de personas</p>
                <p className="font-semibold text-gray-900">
                  {reserva.cantidadPersonas || reserva.comenzales || 1} {reserva.cantidadPersonas > 1 ? 'personas' : 'persona'}
                </p>
              </div>
            </div>

            {reserva.comentarios && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Comentarios</p>
                  <p className="text-sm text-gray-900">
                    {reserva.comentarios}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de rechazo (condicional) */}
          {showRejectForm && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <label className="block mb-2">
                <span className="text-sm font-semibold text-red-900">
                  Motivo del rechazo *
                </span>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => {
                    setMotivoRechazo(e.target.value);
                    setError('');
                  }}
                  placeholder="Explica brevemente por qué se rechaza esta reserva..."
                  className="mt-1 w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="3"
                  disabled={isLoading}
                />
              </label>
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          )}

          {/* Advertencia */}
          {!showRejectForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Esta acción notificará al cliente sobre tu decisión.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showRejectForm ? (
              <>
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Aprobar Reserva</span>
                    </>
                  )}
                </button>
                <button
                  onClick={toggleRejectForm}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Rechazar Reserva</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleRejectForm}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Confirmar Rechazo</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal;
