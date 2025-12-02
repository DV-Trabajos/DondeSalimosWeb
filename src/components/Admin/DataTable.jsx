// DataTable.jsx - Tabla genérica
import { useState, useMemo } from 'react';
import { 
  ChevronUp, ChevronDown, ChevronsUpDown, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Filter, Inbox
} from 'lucide-react';

const DataTable = ({
  // Datos
  data = [],
  columns = [],
  
  // Configuración
  itemsPerPage = 10,
  sortable = true,
  searchable = true,
  pagination = true,
  selectable = false,
  loading = false,
  
  // Callbacks
  onRowClick = null,
  onSelectionChange = null,
  onDelete = null,
  
  // Personalización
  emptyMessage = "No hay datos para mostrar",
  className = "",
  
  // Acciones masivas
  bulkActions = []
}) => {
  // Estados
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // FILTRADO Y BÚSQUEDA
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return columns.some(column => {
        const value = column.accessor(item);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // ORDENAMIENTO
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;

      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig, columns]);

  // PAGINACIÓN
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, pagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // HANDLERS
  const handleSort = (columnKey) => {
    if (!sortable) return;

    setSortConfig(current => ({
      key: columnKey,
      direction: 
        current.key === columnKey && current.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(paginatedData.map((_, index) => index));
      setSelectedRows(allIds);
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    
    if (onSelectionChange) {
      const selectedItems = paginatedData.filter((_, i) => newSelected.has(i));
      onSelectionChange(selectedItems);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setSelectedRows(new Set());
  };

  const getSortIcon = (columnKey) => {
    if (!sortable) return null;
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-300" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-purple-600" />
      : <ChevronDown className="w-4 h-4 text-purple-600" />;
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-200 border-t-purple-600"></div>
            <span className="text-gray-500 text-sm">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  // RENDER
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      {/* Header: Búsqueda y Acciones */}
      {(searchable || bulkActions.length > 0) && (
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Búsqueda */}
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none bg-white transition-all"
                />
              </div>
            )}

            {/* Acciones Masivas */}
            {selectable && selectedRows.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-sm font-medium text-purple-700">
                  {selectedRows.size} seleccionado{selectedRows.size !== 1 ? 's' : ''}
                </span>
                {bulkActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const selectedItems = paginatedData.filter((_, i) => selectedRows.has(i));
                      action.onClick(selectedItems);
                      setSelectedRows(new Set());
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      action.variant === 'danger'
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Botón de filtros */}
            {searchable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
            <tr>
              {/* Checkbox para seleccionar todos */}
              {selectable && (
                <th className="px-4 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                </th>
              )}

              {/* Columnas */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false && sortable ? 'cursor-pointer hover:text-gray-700 transition-colors' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width || 'auto' }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Inbox className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                    <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${selectedRows.has(rowIndex) 
                    ? 'bg-purple-50/50' 
                    : 'hover:bg-gray-50/80'
                  }`}
                >
                  {/* Checkbox */}
                  {selectable && (
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Celdas */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      {column.render 
                        ? column.render(row, rowIndex)
                        : column.accessor(row)
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Paginación */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Info */}
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de <span className="font-semibold text-gray-700">{sortedData.length}</span> resultados
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-1">
              {/* Primera página */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4 text-gray-600" />
              </button>

              {/* Página anterior */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl font-medium text-sm transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Página siguiente */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>

              {/* Última página */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
