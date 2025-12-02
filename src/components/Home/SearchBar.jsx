// SearchBar.jsx - ACTUALIZADO: Tipos de comercio desde la API
import { useState, useEffect } from 'react';
import { Search, Filter, X, Music, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { GENEROS_MUSICALES, GENEROS_POR_CATEGORIA } from '../../utils/constants';
import { getAllTiposComercio } from '../../services/tiposComercioService';

const SearchBar = ({ 
  onSearch, 
  onFiltersChange,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  
  // Estados para tipos de comercio desde API
  const [tiposComercio, setTiposComercio] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  
  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Cargar tipos de comercio desde la API
  useEffect(() => {
    loadTiposComercio();
  }, []);

  const loadTiposComercio = async () => {
    try {
      setLoadingTipos(true);
      const tipos = await getAllTiposComercio();
      
      // Filtrar solo tipos activos y formatear
      const tiposActivos = tipos
        .filter(tipo => tipo.estado === true || tipo.Estado === true)
        .map(tipo => ({
          id: tipo.iD_TipoComercio || tipo.ID_TipoComercio,
          label: tipo.descripcion || tipo.Descripcion,
          icon: getIconForTipo(tipo.descripcion || tipo.Descripcion),
        }));
      
      // Agregar opción "Todos" al inicio
      setTiposComercio([
        { id: 'all', label: 'Todos', icon: '🏪' },
        ...tiposActivos
      ]);
    } catch (error) {
      // Fallback a tipos por defecto si falla la API
      setTiposComercio([
        { id: 'all', label: 'Todos', icon: '🏪' },
        { id: 1, label: 'Bar', icon: '🍺' },
        { id: 2, label: 'Boliche', icon: '💃' },
      ]);
    } finally {
      setLoadingTipos(false);
    }
  };

  // Función para asignar iconos según el tipo
  const getIconForTipo = (descripcion) => {
    const desc = descripcion?.toLowerCase() || '';
    
    if (desc.includes('bar')) return '🍺';
    if (desc.includes('boliche') || desc.includes('disco') || desc.includes('club')) return '💃';
    if (desc.includes('restaurante')) return '🍽️';
    if (desc.includes('cafe') || desc.includes('café') || desc.includes('cafeteria')) return '☕';
    if (desc.includes('pub')) return '🍻';
    if (desc.includes('cerveceria') || desc.includes('cervecería')) return '🍺';
    if (desc.includes('parrilla')) return '🥩';
    if (desc.includes('pizzeria') || desc.includes('pizzería')) return '🍕';
    if (desc.includes('heladeria') || desc.includes('heladería')) return '🍦';
    
    return '🏪';
  };

  // Notificar cambios de filtros
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        searchTerm: debouncedSearchTerm,
        type: selectedType,
        genres: selectedGenres,
        sortBy,
      });
    }
  }, [debouncedSearchTerm, selectedType, selectedGenres, sortBy]);

  // También notificar búsqueda simple si se usa
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleClear = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedGenres([]);
    setSortBy('name');
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  const hasActiveFilters = selectedType !== 'all' || sortBy !== 'name' || selectedGenres.length > 0;

  // Obtener el label del tipo seleccionado
  const getSelectedTypeLabel = () => {
    const tipo = tiposComercio.find(t => t.id === selectedType);
    return tipo?.label || 'Todos';
  };

  return (
    <div className="w-full">
      {/* Barra principal de búsqueda */}
      <div className="flex gap-2">
        {/* Input de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o dirección..."
            disabled={isLoading}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg flex items-center gap-2 transition font-medium ${
            showFilters || hasActiveFilters
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {(selectedType !== 'all' ? 1 : 0) + (sortBy !== 'name' ? 1 : 0) + selectedGenres.length}
            </span>
          )}
        </button>

        {/* Botón de limpiar */}
        {(searchTerm || hasActiveFilters) && (
          <button
            onClick={handleClear}
            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Filtro de tipo desde API */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de lugar
              </label>
              
              {loadingTipos ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="w-5 h-5 text-purple-500 animate-spin mr-2" />
                  <span className="text-gray-500 text-sm">Cargando tipos...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tiposComercio.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setSelectedType(tipo.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                        selectedType === tipo.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tipo.icon}</span>
                      <span>{tipo.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="name">Nombre (A-Z)</option>
                <option value="rating">Mejor calificación</option>
                <option value="distance">Más cercano</option>
              </select>
            </div>
          </div>

          {/* Filtro de géneros musicales */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowGenres(!showGenres)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-purple-600 transition"
            >
              <Music className="w-4 h-4" />
              <span>Géneros musicales</span>
              {selectedGenres.length > 0 && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedGenres.length}
                </span>
              )}
              {showGenres ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showGenres && (
              <div className="mt-4 space-y-4">
                {Object.entries(GENEROS_POR_CATEGORIA).map(([categoria, generos]) => (
                  <div key={categoria}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      {categoria}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {generos.map((genero) => (
                        <button
                          key={genero.id}
                          onClick={() => toggleGenre(genero.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            selectedGenres.includes(genero.id)
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {genero.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-2">
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-xs font-medium">
                    {getSelectedTypeLabel()}
                    <button onClick={() => setSelectedType('all')} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {sortBy !== 'name' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                    {sortBy === 'rating' ? 'Por calificación' : 'Por distancia'}
                    <button onClick={() => setSortBy('name')} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedGenres.map((genreId) => {
                  const genre = GENEROS_MUSICALES.find(g => g.id === genreId);
                  return (
                    <span 
                      key={genreId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-medium"
                    >
                      {genre?.label || genreId}
                      <button onClick={() => toggleGenre(genreId)} className="hover:opacity-75">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;