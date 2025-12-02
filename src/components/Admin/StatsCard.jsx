// StatsCard.jsx - Tarjeta de estadística 
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend, // 'up' | 'down' | 'neutral'
  trendValue, // porcentaje de cambio
  bgColor = 'bg-blue-50', 
  borderColor = 'border-blue-200',
  iconColor = 'text-blue-600',
  onClick
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`${bgColor} ${borderColor} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconColor} p-3 rounded-lg bg-white/50`}>
          {icon}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 mb-1 animate-fade-in">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
