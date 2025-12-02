// CategoryFilter.jsx - Filtro de categorías flotante sobre el mapa
const CategoryFilter = ({ onFilterChange, activeFilter = 'all' }) => {
  const categories = [
    { id: 'all', label: 'Todos', icon: '🏪' },
    { id: '1', label: 'Bares', icon: '🍺' },
    { id: '2', label: 'Discotecas', icon: '🎉' },
  ];

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-2xl px-3 py-2 border border-gray-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-semibold flex items-center gap-2 whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-primary text-white shadow-lg scale-110 transform'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-105'
              }`}
              title={cat.label}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
