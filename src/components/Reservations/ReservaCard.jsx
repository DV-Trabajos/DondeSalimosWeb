// ReservaCard.jsx - Tarjeta de reserva con estilo de ComercioCard
import { 
  MapPin, Calendar, Users, Clock, CheckCircle, 
  XCircle, AlertTriangle, User 
} from 'lucide-react';
import { convertBase64ToImage } from '../../utils/formatters';

const ReservaCard = ({ reserva, onCancelar, onAprobar, onRechazar, isOwner = false }) => {
  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Formatear hora
  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Determinar si la reserva ya pasó
  const reservaDate = new Date(reserva.fechaReserva);
  const now = new Date();
  const isPastReservation = reservaDate < now;

  // Determinar estado
  const isPending = reserva.estado === false && !reserva.motivoRechazo;
  const isApproved = reserva.estado === true;
  const isRejectedOrCancelled = reserva.estado === false && !!reserva.motivoRechazo;

  // Info del estado con íconos y colores
  const getEstadoInfo = () => {
    if (isRejectedOrCancelled) {
      return {
        texto: 'Rechazada',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: XCircle
      };
    }
    
    if (isApproved) {
      return {
        texto: 'Aprobada',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        icon: CheckCircle
      };
    }
    
    return {
      texto: 'Pendiente',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: Clock
    };
  };

  const estadoInfo = getEstadoInfo();
  const EstadoIcon = estadoInfo.icon;

  // Obtener nombre del comercio o usuario según el contexto
  const comercioNombre = reserva.comercio?.nombre || 'Comercio';
  const usuarioNombre = reserva.usuario?.nombreUsuario || 'Usuario';
  const cantidadPersonas = reserva.comensales || reserva.comenzales || 1;

  // Imagen del comercio
  const imageUrl = reserva.comercio?.foto 
    ? convertBase64ToImage(reserva.comercio.foto)
    : 'https://via.placeholder.com/400x200?text=Sin+Imagen';

  // Verificar si mostrar botones de acción
  const mostrarAccionesNormales = !isPastReservation && isPending;
  const mostrarRechazoReservaPasada = isPastReservation && isPending && isOwner;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={comercioNombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Sin+Imagen';
          }}
        />
        
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${estadoInfo.bgColor} ${estadoInfo.textColor} border ${estadoInfo.borderColor} backdrop-blur-sm`}>
            <EstadoIcon className="w-3.5 h-3.5" />
            {estadoInfo.texto}
          </span>
        </div>

        {/* Badge de comercio/usuario según contexto */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 border border-gray-200 flex items-center gap-1.5">
            {isOwner ? (
              <>
                <User className="w-3.5 h-3.5" />
                {usuarioNombre}
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" />
                {comercioNombre}
              </>
            )}
          </span>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4">
        {/* Título - Comercio o Usuario */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {isOwner ? `Reserva de ${usuarioNombre}` : comercioNombre}
          </h3>
          {!isOwner && reserva.comercio?.direccion && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="line-clamp-1">{reserva.comercio.direccion}</span>
            </div>
          )}
        </div>

        {/* Info de la reserva en grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fecha */}
          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-purple-600 font-medium">Fecha</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {formatearFecha(reserva.fechaReserva)}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-blue-600 font-medium">Hora</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatearHora(reserva.fechaReserva)}
              </p>
            </div>
          </div>

          {/* Personas */}
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100 col-span-2">
            <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-green-600 font-medium">Cantidad de personas</p>
              <p className="text-sm font-semibold text-gray-900">
                {cantidadPersonas} {cantidadPersonas === 1 ? 'persona' : 'personas'}
              </p>
            </div>
          </div>
        </div>

        {/* Motivo de rechazo/cancelación */}
        {isRejectedOrCancelled && reserva.motivoRechazo && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-600 mb-1 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Motivo del rechazo:
            </p>
            <p className="text-sm text-red-700">{reserva.motivoRechazo}</p>
          </div>
        )}

        {/* Botones de acción */}
        {mostrarAccionesNormales && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {/* Para usuarios - Botón cancelar */}
            {!isOwner && onCancelar && (
              <button
                onClick={() => onCancelar(reserva)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md"
              >
                <XCircle className="w-4 h-4" />
                Cancelar Reserva
              </button>
            )}

            {/* Para dueños - Botones aprobar/rechazar */}
            {isOwner && (
              <div className="flex gap-2">
                {onAprobar && (
                  <button
                    onClick={() => onAprobar(reserva)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                )}
                {onRechazar && (
                  <button
                    onClick={() => onRechazar(reserva)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-md"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Caso especial: Reserva pasada pero pendiente (solo para dueños) */}
        {mostrarRechazoReservaPasada && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-600 text-center font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Esta reserva ya pasó pero sigue pendiente
              </p>
            </div>
            {onRechazar && (
              <button
                onClick={() => onRechazar(reserva)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md"
              >
                <XCircle className="w-4 h-4" />
                Marcar como No Asistió
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservaCard;