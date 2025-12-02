// ReservaDetailModal.jsx - Modal de detalles de reserva
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Calendar, Users, Clock, User, Store, 
  CheckCircle, XCircle, AlertTriangle, MapPin, Phone, Mail,
  Sparkles, Hash, CalendarClock, Timer
} from 'lucide-react';
import { formatTiempoTolerancia } from '../../services/reservasService';

const ReservaDetailModal = ({ reserva, isOpen, onClose, onAprobar, onRechazar }) => {
  // Cerrar formulario con tecla ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !reserva) return null;

  // Configuración del estado
  const getEstadoConfig = () => {
    if (reserva.estado && !reserva.motivoRechazo) {
      return {
        label: 'Aprobada',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    }
    if (!reserva.estado && reserva.motivoRechazo) {
      return {
        label: 'Rechazada',
        icon: XCircle,
        gradient: 'from-red-500 to-rose-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      };
    }
    return {
      label: 'Pendiente',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200'
    };
  };

  const estadoConfig = getEstadoConfig();
  const EstadoIcon = estadoConfig.icon;

  // Verificar si la reserva es de hoy
  const isHoy = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(reserva.fechaReserva);
    fechaReserva.setHours(0, 0, 0, 0);
    return fechaReserva.getTime() === hoy.getTime();
  };

  // Verificar si la reserva ya pasó
  const isPasada = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaReserva = new Date(reserva.fechaReserva);
    fechaReserva.setHours(0, 0, 0, 0);
    return fechaReserva < hoy;
  };

  // Determinar si mostrar botones de acción
  const isPendiente = !reserva.estado && !reserva.motivoRechazo;
  const mostrarBotonesAccion = isPendiente && !isPasada();

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-6 text-white overflow-hidden">
            {/* Decoraciones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalle de Reserva</h2>
                <p className="text-white/80 text-sm mt-1">ID: #{reserva.iD_Reserva}</p>
              </div>
            </div>

            {/* Badge especial si es HOY */}
            {isHoy() && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-lg">📅</span>
                <span className="font-semibold">Reserva para HOY</span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            
            {/* Tarjetas destacadas: Fecha/Hora y Comensales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Fecha y Hora */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <CalendarClock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Fecha y Hora</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {formatDate(reserva.fechaReserva)}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatTime(reserva.fechaReserva)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comensales */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Comensales</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {reserva.comensales}
                    </p>
                    <p className="text-sm text-emerald-600">
                      {reserva.comensales === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges de estado */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Estado */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${estadoConfig.gradient} rounded-lg flex items-center justify-center`}>
                  <EstadoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${estadoConfig.text} font-medium`}>Estado</p>
                  <p className={`${estadoConfig.text} font-semibold`}>{estadoConfig.label}</p>
                </div>
              </div>

              {/* Tiempo de tolerancia */}
              {reserva.tiempoTolerancia && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-purple-50 border-purple-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Tolerancia</p>
                    <p className="text-purple-700 font-semibold">{formatTiempoTolerancia(reserva.tiempoTolerancia)}</p>
                  </div>
                </div>
              )}

              {/* Indicador de fecha pasada */}
              {isPasada() && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-gray-100 border-gray-200">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 font-medium">Fecha pasada</span>
                </div>
              )}
            </div>

            {/* Usuario */}
            {reserva.usuario && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Usuario
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{reserva.usuario.nombreUsuario}</p>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {reserva.usuario.correo}
                      </p>
                      {reserva.usuario.telefono && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {reserva.usuario.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comercio */}
            {reserva.comercio && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Comercio
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{reserva.comercio.nombre}</p>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {reserva.comercio.direccion}
                      </p>
                      {reserva.comercio.telefono && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {reserva.comercio.telefono}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Información Adicional
              </h3>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Fecha de creación</p>
                  <p className="text-gray-900 font-medium">{formatDateTime(reserva.fechaCreacion)}</p>
                </div>
              </div>
            </div>

            {/* Motivo de rechazo */}
            {reserva.motivoRechazo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Motivo de rechazo</h3>
                    <p className="text-red-700">{reserva.motivoRechazo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium"
              >
                Cerrar
              </button>
              
              {/* Acciones para reservas pendientes */}
              {mostrarBotonesAccion && onAprobar && onRechazar && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onRechazar(reserva)}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/25 inline-flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => onAprobar(reserva)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/25 inline-flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprobar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaDetailModal;