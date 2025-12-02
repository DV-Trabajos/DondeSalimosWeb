// TableFilters.jsx - Componentes de filtros para tablas del admin
import { useState } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

// Componente TableFilters - Barra de filtros para tablas
export const TableFilters = ({ 
  filters = [], 
  onFilterChange, 
  onClear,
  showClearButton = true 
}) => {
  const hasActiveFilters = filters.some(f => f.value && f.value !== '');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="flex-1 min-w-[200px]">
            {filter.type === 'text' ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || `Buscar ${filter.label}...`}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                />
                {filter.value && (
                  <button
                    onClick={() => onFilterChange(filter.key, '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            ) : filter.type === 'select' ? (
              <div className="relative">
                <select
                  value={filter.value || ''}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm appearance-none bg-white cursor-pointer"
                >
                  <option value="">{filter.placeholder || `Todos los ${filter.label}`}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ) : null}
          </div>
        ))}

        {/* Botón limpiar filtros */}
        {showClearButton && hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

// Componente ActiveFilters - Muestra los filtros activos como badges
export const ActiveFilters = ({ 
  filters = [], 
  onRemove, 
  onClearAll 
}) => {
  // Filtrar solo los que tienen valor
  const activeFilters = filters.filter(f => f.value && f.value !== '');

  if (activeFilters.length === 0) return null;

  // Obtener el label del valor para selects
  const getValueLabel = (filter) => {
    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find(o => String(o.value) === String(filter.value));
      return option?.label || filter.value;
    }
    return filter.value;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
        <Filter className="w-4 h-4" />
        Filtros activos:
      </span>
      
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
        >
          <span className="text-violet-500">{filter.label}:</span>
          <span>{getValueLabel(filter)}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 p-0.5 hover:bg-violet-200 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
};

export default TableFilters;