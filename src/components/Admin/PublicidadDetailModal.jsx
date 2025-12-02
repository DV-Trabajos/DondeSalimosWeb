// PublicidadDetailModal.jsx - Modal de detalles de publicidad
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Megaphone, Store, Calendar, Eye, DollarSign, Clock, 
  CheckCircle, XCircle, Image as ImageIcon, Sparkles, Hash,
  Timer, CreditCard, AlertTriangle
} from 'lucide-react';
import { convertBase64ToImage, formatearFechaHora, formatTimeSpanToDays } from '../../utils/formatters';

const PublicidadDetailModal = ({ publicidad, isOpen, onClose }) => {
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

  if (!isOpen || !publicidad) return null;

  const dias = formatTimeSpanToDays(publicidad.tiempo);
  const imageUrl = publicidad.imagen ? convertBase64ToImage(publicidad.imagen) : null;

  // Calcular fecha de expiración
  const calcularFechaExpiracion = () => {
    if (!publicidad.fechaCreacion) return 'N/A';
    const fechaCreacion = new Date(publicidad.fechaCreacion);
    fechaCreacion.setDate(fechaCreacion.getDate() + dias);
    return fechaCreacion.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Configuración del estado
  const getEstadoConfig = () => {
    if (publicidad.estado === true) {
      return {
        label: 'Aprobada',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    }
    if (publicidad.motivoRechazo) {
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

  // Configuración del pago
  const getPagoConfig = () => {
    if (publicidad.pago) {
      return {
        label: 'Pagada',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    }
    return {
      label: 'Sin Pagar',
      icon: CreditCard,
      gradient: 'from-gray-400 to-gray-500',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200'
    };
  };

  const estadoConfig = getEstadoConfig();
  const pagoConfig = getPagoConfig();
  const EstadoIcon = estadoConfig.icon;
  const PagoIcon = pagoConfig.icon;

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
            
            {/* Botón cerrar*/}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Megaphone className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalle de Publicidad</h2>
                <p className="text-white/80 text-sm mt-1">ID: #{publicidad.iD_Publicidad}</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Imagen */}
            {imageUrl && (
              <div className="mb-6">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={imageUrl} 
                    alt="Publicidad"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            )}

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

              {/* Pago */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${pagoConfig.bg} ${pagoConfig.border}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${pagoConfig.gradient} rounded-lg flex items-center justify-center`}>
                  <PagoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${pagoConfig.text} font-medium`}>Pago</p>
                  <p className={`${pagoConfig.text} font-semibold`}>{pagoConfig.label}</p>
                </div>
              </div>

              {/* Duración */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-blue-50 border-blue-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Duración</p>
                  <p className="text-blue-700 font-semibold">{dias} días</p>
                </div>
              </div>

              {/* Visualizaciones */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-purple-50 border-purple-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">Visualizaciones</p>
                  <p className="text-purple-700 font-semibold">{publicidad.visualizaciones || 0}</p>
                </div>
              </div>
            </div>

            {/* Comercio asociado */}
            {publicidad.comercio && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Comercio Asociado
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{publicidad.comercio.nombre}</p>
                    <p className="text-sm text-gray-500">{publicidad.comercio.direccion}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fechas */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Información de Fechas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={<Calendar className="w-5 h-5 text-violet-500" />}
                  label="Fecha de creación"
                  value={formatDate(publicidad.fechaCreacion)}
                />
                
                <InfoItem 
                  icon={<Clock className="w-5 h-5 text-violet-500" />}
                  label="Fecha de expiración"
                  value={calcularFechaExpiracion()}
                />
              </div>
            </div>

            {/* Motivo de rechazo */}
            {publicidad.motivoRechazo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Motivo de rechazo</h3>
                    <p className="text-red-700">{publicidad.motivoRechazo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
    <div className="flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-gray-900 font-medium break-words">{value}</p>
    </div>
  </div>
);

export default PublicidadDetailModal;