// ToastContainer.jsx - Contenedor de notificaciones toast
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-500" />,
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[10002] space-y-3 max-w-sm">
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {style.icon}
            </div>
            <p className={`${style.text} text-sm flex-1`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;