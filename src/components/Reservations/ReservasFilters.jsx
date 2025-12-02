// ReservasFilters.jsx - Filtros avanzados para reservas
import { useState } from 'react';
import { Search, Filter, X, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

//Componente de filtros avanzados para reservas - Incluye: búsqueda, filtro por estado, filtro por fecha
const ReservasFilters = ({ 
  onFilterChange, 
  activeFilters = {},
  showComercioFilter = false,
  comercios = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || '');
  const [selectedEstado, setSelectedEstado] = useState(activeFilters.estado || 'todos');
  const [selectedPeriodo, setSelectedPeriodo] = useState(activeFilters.periodo || 'todos');
  const [selectedComercio, setSelectedComercio] = useState(activeFilters.comercio || 'todos');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    notifyChange({ ...getActiveFilters(), search: value });
  };

  const handleEstadoChange = (estado) => {
    setSelectedEstado(estado);
    notifyChange({ ...getActiveFilters(), estado });
  };

  const handlePeriodoChange = (periodo) => {
    setSelectedPeriodo(periodo);
    notifyChange({ ...getActiveFilters(), periodo });
  };

  const handleComercioChange = (comercio) => {
    setSelectedComercio(comercio);
    notifyChange({ ...getActiveFilters(), comercio });
  };

  const getActiveFilters = () => ({
    search: searchTerm,
    estado: selectedEstado,
    periodo: selectedPeriodo,
    comercio: selectedComercio
  });

  const notifyChange = (filters) => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEstado('todos');
    setSelectedPeriodo('todos');
    setSelectedComercio('todos');
    notifyChange({
      search: '',
      estado: 'todos',
      periodo: 'todos',
      comercio: 'todos'
    });
  };

  const hasActiveFilters = searchTerm || selectedEstado !== 'todos' || selectedPeriodo !== 'todos' || selectedComercio !== 'todos';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
      {/* Búsqueda y botón de filtros */}
      <div className="flex gap-3 items-center mb-4">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, cliente, comercio..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange({ target: { value: '' } })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
            isOpen || hasActiveFilters
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtros</span>
          {hasActiveFilters && !isOpen && (
            <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros expandible */}
      {isOpen && (
        <div className="pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado de reserva
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <FilterButton
                active={selectedEstado === 'todos'}
                onClick={() => handleEstadoChange('todos')}
                icon={<Filter className="w-4 h-4" />}
                label="Todas"
              />
              <FilterButton
                active={selectedEstado === 'pendientes'}
                onClick={() => handleEstadoChange('pendientes')}
                icon={<Clock className="w-4 h-4" />}
                label="Pendientes"
                color="yellow"
              />
              <FilterButton
                active={selectedEstado === 'aprobadas'}
                onClick={() => handleEstadoChange('aprobadas')}
                icon={<CheckCircle className="w-4 h-4" />}
                label="Confirmadas"
                color="green"
              />
              <FilterButton
                active={selectedEstado === 'rechazadas'}
                onClick={() => handleEstadoChange('rechazadas')}
                icon={<XCircle className="w-4 h-4" />}
                label="Rechazadas"
                color="red"
              />
              <FilterButton
                active={selectedEstado === 'canceladas'}
                onClick={() => handleEstadoChange('canceladas')}
                icon={<XCircle className="w-4 h-4" />}
                label="Canceladas"
                color="gray"
              />
            </div>
          </div>

          {/* Filtro por período */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Período
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FilterButton
                active={selectedPeriodo === 'todos'}
                onClick={() => handlePeriodoChange('todos')}
                icon={<Calendar className="w-4 h-4" />}
                label="Todos"
              />
              <FilterButton
                active={selectedPeriodo === 'hoy'}
                onClick={() => handlePeriodoChange('hoy')}
                icon={<Calendar className="w-4 h-4" />}
                label="Hoy"
              />
              <FilterButton
                active={selectedPeriodo === 'proximos'}
                onClick={() => handlePeriodoChange('proximos')}
                icon={<Calendar className="w-4 h-4" />}
                label="Próximos 7 días"
              />
              <FilterButton
                active={selectedPeriodo === 'pasados'}
                onClick={() => handlePeriodoChange('pasados')}
                icon={<Calendar className="w-4 h-4" />}
                label="Pasados"
              />
            </div>
          </div>

          {/* Filtro por comercio (solo si aplica) */}
          {showComercioFilter && comercios.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comercio
              </label>
              <select
                value={selectedComercio}
                onChange={(e) => handleComercioChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="todos">Todos los comercios</option>
                {comercios.map((comercio) => (
                  <option key={comercio.iD_Comercio} value={comercio.iD_Comercio}>
                    {comercio.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para botones de filtro
const FilterButton = ({ active, onClick, icon, label, color = 'gray' }) => {
  const colorClasses = {
    yellow: 'border-yellow-300 bg-yellow-50 text-yellow-700',
    green: 'border-green-300 bg-green-50 text-green-700',
    red: 'border-red-300 bg-red-50 text-red-700',
    gray: 'border-gray-300 bg-gray-50 text-gray-700',
  };

  const activeColorClasses = {
    yellow: 'border-yellow-500 bg-yellow-500 text-white',
    green: 'border-green-500 bg-green-500 text-white',
    red: 'border-red-500 bg-red-500 text-white',
    gray: 'border-gray-500 bg-gray-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition font-medium text-sm ${
        active
          ? activeColorClasses[color] || 'border-primary bg-primary text-white'
          : colorClasses[color] || 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default ReservasFilters;
