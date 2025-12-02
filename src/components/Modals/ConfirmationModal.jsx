// ConfirmationModal.jsx - Modal de confirmación reutilizable
import { X, AlertTriangle, CheckCircle, Info, XCircle, Sparkles } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  description = null,
}) => {
  if (!isOpen) return null;

  // Configuración de estilos según el tipo
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonGradient: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      shadowColor: 'shadow-amber-500/25',
    },
    danger: {
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonGradient: 'from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
      shadowColor: 'shadow-red-500/25',
    },
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonGradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
      shadowColor: 'shadow-emerald-500/25',
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonGradient: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      shadowColor: 'shadow-blue-500/25',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
          {/* Header */}
          <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
          
          <div className="p-6">
            {/* Icono y título */}
            <div className="flex flex-col items-center mb-5">
              <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center">
                {title}
              </h3>
            </div>

            {/* Contenido */}
            <div className="mb-6">
              <p className="text-gray-600 text-center leading-relaxed">
                {message}
              </p>
              
              {description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.buttonGradient} text-white rounded-xl transition-all font-medium shadow-lg ${config.shadowColor}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;