// NotificationModal.jsx - Modal de notificación
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';

const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'Entendido',
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  // Auto-cerrar si está habilitado
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  // Configuración de estilos según el tipo
  const typeConfig = {
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      buttonGradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      shadowColor: 'shadow-emerald-500/25',
      bgGlow: 'bg-emerald-500',
    },
    error: {
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      buttonGradient: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      shadowColor: 'shadow-red-500/25',
      bgGlow: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      buttonGradient: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      shadowColor: 'shadow-amber-500/25',
      bgGlow: 'bg-amber-500',
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      buttonGradient: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      shadowColor: 'shadow-blue-500/25',
      bgGlow: 'bg-blue-500',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Overlay con blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Efecto de glow en el fondo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-20 -right-20 w-40 h-40 ${config.bgGlow} rounded-full blur-3xl opacity-20`}></div>
          </div>
          
          {/* Header */}
          <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
          
          <div className="relative p-6">
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Icono y contenido */}
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-14 h-14 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
              </div>
              
              <div className="flex-1 pt-1 pr-8">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex justify-end mt-6">
              <button
                onClick={onClose}
                className={`px-6 py-2.5 bg-gradient-to-r ${config.buttonGradient} text-white rounded-xl transition-all font-medium shadow-lg ${config.shadowColor} min-w-[120px]`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;