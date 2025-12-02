// AlertCard.jsx - Tarjeta de alertas y pendientes
import { AlertTriangle, ArrowRight, Bell } from 'lucide-react';

const AlertCard = ({ 
  title, 
  items = [], 
  type = 'warning', // 'warning' | 'info' | 'urgent'
  onViewAll 
}) => {
  const typeClasses = {
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      icon: 'text-orange-600',
      badge: 'bg-orange-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      icon: 'text-blue-600',
      badge: 'bg-blue-500'
    },
    urgent: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      icon: 'text-red-600',
      badge: 'bg-red-500'
    }
  };

  const classes = typeClasses[type] || typeClasses.warning;

  if (items.length === 0) return null;

  return (
    <div className={`${classes.bg} ${classes.border} border-2 rounded-xl p-6 shadow-sm`}>
      <div className="flex items-center gap-3 mb-4">
        {type === 'urgent' ? (
          <Bell className={`w-6 h-6 ${classes.icon} animate-bounce`} />
        ) : (
          <AlertTriangle className={`w-6 h-6 ${classes.icon}`} />
        )}
        <h3 className={`text-lg font-bold ${classes.icon.replace('text-', 'text-gray-')}800`}>
          {title}
        </h3>
        <span className={`ml-auto ${classes.badge} text-white px-3 py-1 rounded-full text-sm font-bold`}>
          {items.length}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className="bg-white/70 rounded-lg p-4 hover:bg-white transition-all cursor-pointer hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900">{item.title}</p>
              {item.badge && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      {items.length > 3 && (
        <button
          onClick={onViewAll}
          className={`w-full ${classes.bg} hover:bg-white border-2 ${classes.border} rounded-lg py-3 px-4 font-semibold ${classes.icon} transition-all hover:shadow-sm flex items-center justify-center gap-2 group`}
        >
          <span>Ver todos ({items.length})</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default AlertCard;
