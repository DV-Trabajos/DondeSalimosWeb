// QuickActionCard.jsx - Tarjeta de acciones rápidas
import { ArrowRight } from 'lucide-react';

const QuickActionCard = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  badge,
  color = 'blue' // blue, green, purple, orange, red
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      badge: 'bg-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100',
      badge: 'bg-green-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      badge: 'bg-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      badge: 'bg-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      hover: 'hover:bg-red-100',
      badge: 'bg-red-500'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.hover} group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${colors.icon} p-3 rounded-lg bg-white/70`}>
          {icon}
        </div>
        {badge > 0 && (
          <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm animate-pulse`}>
            {badge}
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
        <span>Ir</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default QuickActionCard;
