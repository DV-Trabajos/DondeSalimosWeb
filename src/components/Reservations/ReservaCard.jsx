// ReservaCard.jsx - Tarjeta de reservas
import { 
  Calendar, Users, Clock, MapPin, CheckCircle, 
  XCircle, AlertCircle, MessageCircle 
} from 'lucide-react';

const ReservaCard = ({ 
  reserva, 
  isOwner = false, 
  comercioNombre, 
  onCancelar,
  onAprobar,
  onRechazar 
}) => {
  if (!reserva) {
    return null;
  }

  // LÓGICA DE ESTADOS
  // estado: false + motivoRechazo: null → PENDIENTE
  // estado: true → APROBADA  
  // estado: false + motivoRechazo: "texto" → RECHAZADA/CANCELADA
  const isPending = reserva.estado === false && !reserva.motivoRechazo;
  const isApproved = reserva.estado === true;
  const isRejectedOrCancelled = reserva.estado === false && !!reserva.motivoRechazo;
  
  // Verificar si la reserva es pasada
  const reservaDate = reserva.fechaReserva ? new Date(reserva.fechaReserva) : new Date();
  const now = new Date();
  const isPastReservation = reservaDate < now;

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear hora
  const formatearHora = (fecha) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Obtener texto del estado
  const getEstadoTexto = () => {
    if (isApproved) return 'Confirmada';
    if (isRejectedOrCancelled) return 'Cancelada';
    if (isPending) return 'Pendiente';
    return 'Desconocido';
  };

  // Obtener clases del badge
  const getBadgeClasses = () => {
    if (isApproved) return 'bg-green-100 text-green-700 border-green-300';
    if (isRejectedOrCancelled) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (isPending) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Obtener icono del estado
  const getIconoEstado = () => {
    if (isApproved) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isRejectedOrCancelled) return <XCircle className="w-5 h-5 text-gray-500" />;
    if (isPending) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-gray-500" />;
  };

  // Obtener color de fondo del header
  const getHeaderBg = () => {
    if (isApproved) return 'bg-green-50 border-green-200';
    if (isRejectedOrCancelled) return 'bg-gray-50 border-gray-200';
    if (isPending) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  // Obtener cantidad de personas
  const cantidadPersonas = reserva.comensales || reserva.comenzales || 1;

  // - Si NO pasó y está pendiente → mostrar aprobar/rechazar (dueño) o cancelar (usuario)
  // - Si YA pasó y está pendiente y es dueño → mostrar solo rechazar (para marcar como "No asistió")
  // - Si ya tiene estado definido (aprobada/rechazada) → no mostrar botones de acción
  const mostrarAccionesNormales = !isPastReservation && isPending;
  const mostrarRechazoReservaPasada = isPastReservation && isPending && isOwner;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Header con estado */}
      <div className={`p-4 ${getHeaderBg()} border-b-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIconoEstado()}
            <span className="font-semibold text-gray-900">
              {isOwner && reserva.usuario?.nombreUsuario 
                ? `Reserva de ${reserva.usuario.nombreUsuario}`
                : comercioNombre || reserva.comercio?.nombre || 'Reserva'
              }
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeClasses()}`}>
            {getEstadoTexto()}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Lugar (solo para usuarios, no para dueños) */}
        {!isOwner && (comercioNombre || reserva.comercio?.nombre) && (
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-purple-600 font-medium">Lugar</p>
              <p className="font-semibold text-gray-900">
                {comercioNombre || reserva.comercio?.nombre}
              </p>
            </div>
          </div>
        )}

        {/* Fecha y hora */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 font-medium">Fecha y hora</p>
            <p className="font-semibold text-gray-900">
              {formatearFecha(reserva.fechaReserva)}
            </p>
            <p className="text-sm text-gray-600">
              {formatearHora(reserva.fechaReserva)}
            </p>
          </div>
        </div>

        {/* Cantidad de personas */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-600 font-medium">Personas</p>
            <p className="font-semibold text-gray-900">
              {cantidadPersonas} {cantidadPersonas === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </div>

        {/* Motivo de rechazo/cancelación */}
        {isRejectedOrCancelled && reserva.motivoRechazo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 mb-1 font-semibold">Motivo del rechazo:</p>
            <p className="text-sm text-red-700">{reserva.motivoRechazo}</p>
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      
      {/* Caso 1: Reserva NO pasó y está pendiente - Mostrar todas las acciones normales */}
      {mostrarAccionesNormales && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            {/* Botón cancelar (para usuarios) */}
            {!isOwner && onCancelar && (
              <button
                onClick={() => onCancelar(reserva)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
              >
                Cancelar Reserva
              </button>
            )}

            {/* Botones aprobar/rechazar (para dueños) */}
            {isOwner && (
              <>
                {onAprobar && (
                  <button
                    onClick={() => onAprobar(reserva)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold text-sm"
                  >
                    Aprobar
                  </button>
                )}
                {onRechazar && (
                  <button
                    onClick={() => onRechazar(reserva)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold text-sm"
                  >
                    Rechazar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Caso 2: Reserva YA pasó pero está PENDIENTE - Dueño puede rechazarla */}
      {mostrarRechazoReservaPasada && (
        <div className="p-4 bg-orange-50 border-t border-orange-200">
          <p className="text-xs text-orange-600 mb-2 text-center font-medium">
            ⚠️ Esta reserva ya pasó pero sigue pendiente
          </p>
          <div className="flex gap-2">
            {onRechazar && (
              <button
                onClick={() => onRechazar(reserva)}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm"
              >
                Marcar como No Asistió
              </button>
            )}
          </div>
        </div>
      )}

      {/* Caso 3: Reserva NO pasó pero ya tiene estado definido */}
      {!isPastReservation && !isPending && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {isApproved && (
            <div className="text-center py-2">
              <p className="text-sm text-green-600 italic font-medium">
                ✓ Reserva confirmada
              </p>
            </div>
          )}
          {isRejectedOrCancelled && (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 italic">
                Reserva cancelada
              </p>
            </div>
          )}
        </div>
      )}

      {/* Caso 4: Reserva YA pasó Y tiene estado definido (aprobada o rechazada) */}
      {isPastReservation && !isPending && (
        <div className="p-3 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 italic">
            Esta reserva ya pasó
          </p>
        </div>
      )}
    </div>
  );
};

export default ReservaCard;