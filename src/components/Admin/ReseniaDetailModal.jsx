// ReseniaDetailModal.jsx - Modal de detalles de reseña
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Star, User, Store, Calendar, MessageSquare, 
  CheckCircle, XCircle, Clock, AlertTriangle, Sparkles, Hash
} from 'lucide-react';

const ReseniaDetailModal = ({ 
  resenia, 
  isOpen, 
  onClose,
  onAprobar,
  onRechazar
}) => {
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

  if (!isOpen || !resenia) return null;

  // Configuración del estado
  const getEstadoConfig = () => {
    if (resenia.estado) {
      return {
        label: 'Aprobada',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    }
    if (resenia.motivoRechazo) {
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
  const isPendiente = !resenia.estado && !resenia.motivoRechazo;

  // Renderizar estrellas
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-7 h-7 transition-all ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  // Obtener emoji según puntuación
  const getRatingEmoji = (rating) => {
    const emojis = {
      1: '😞',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '😍'
    };
    return emojis[rating] || '⭐';
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: '¡Excelente!'
    };
    return texts[rating] || '';
  };

  const formatDate = (dateString) => {
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Star className="w-7 h-7 fill-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Detalle de Reseña</h2>
                  <p className="text-white/80 text-sm">ID: #{resenia.iD_Resenia}</p>
                </div>
              </div>

              {/* Puntuación destacada en el header */}
              <div className="flex items-center gap-4 mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-5xl">{getRatingEmoji(resenia.puntuacion)}</div>
                <div>
                  {renderStars(resenia.puntuacion)}
                  <p className="text-white/90 font-medium mt-1">{getRatingText(resenia.puntuacion)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            
            {/* Badge de estado */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${estadoConfig.gradient} rounded-lg flex items-center justify-center`}>
                  <EstadoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${estadoConfig.text} font-medium`}>Estado</p>
                  <p className={`${estadoConfig.text} font-semibold`}>{estadoConfig.label}</p>
                </div>
              </div>

              {/* Puntuación */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-amber-50 border-amber-200">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium">Puntuación</p>
                  <p className="text-amber-700 font-semibold">{resenia.puntuacion} / 5</p>
                </div>
              </div>
            </div>

            {/* Comentario */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentario
              </h3>
              
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {resenia.comentario || 'Sin comentario'}
                </p>
              </div>
            </div>

            {/* Usuario */}
            {resenia.usuario && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Usuario
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{resenia.usuario.nombreUsuario}</p>
                    <p className="text-sm text-gray-500">{resenia.usuario.correo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Comercio */}
            {resenia.comercio && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Comercio
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{resenia.comercio.nombre}</p>
                    <p className="text-sm text-gray-500">{resenia.comercio.direccion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fecha */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Información
              </h3>
              
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Fecha de creación</p>
                  <p className="text-gray-900 font-medium">{formatDate(resenia.fechaCreacion)}</p>
                </div>
              </div>
            </div>

            {/* Motivo de rechazo */}
            {resenia.motivoRechazo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Motivo de rechazo</h3>
                    <p className="text-red-700">{resenia.motivoRechazo}</p>
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
              
              {/* Acciones para reseñas pendientes */}
              {isPendiente && onAprobar && onRechazar && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onRechazar(resenia)}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/25 inline-flex items-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                  <button
                    onClick={() => onAprobar(resenia)}
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

export default ReseniaDetailModal;
