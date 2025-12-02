// PlaceList.jsx - Lista de lugares con paginación
import { useState, useMemo } from 'react';
import PlaceCard from './PlaceCard';
import { Loader, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ITEMS_PER_PAGE = 9;

const PlaceList = ({ places = [], onPlaceClick, isLoading = false, userLocation }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular distancia si hay ubicación
  const calculateDistance = (placeLat, placeLng) => {
    if (!userLocation) return null;
    
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = userLocation.latitude * Math.PI / 180;
    const φ2 = placeLat * Math.PI / 180;
    const Δφ = (placeLat - userLocation.latitude) * Math.PI / 180;
    const Δλ = (placeLng - userLocation.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  };

  // Calcular paginación
  const totalPages = Math.ceil(places.length / ITEMS_PER_PAGE);
  
  const paginatedPlaces = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return places.slice(startIndex, endIndex);
  }, [places, currentPage]);

  // Resetear a página 1 cuando cambian los places
  useMemo(() => {
    setCurrentPage(1);
  }, [places.length]);

  // Handlers de navegación
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    // Scroll al top de la lista
    window.scrollTo({ top: document.getElementById('place-list-top')?.offsetTop - 100, behavior: 'smooth' });
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);
      
      // Calcular rango alrededor de la página actual
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Ajustar si estamos cerca del inicio
      if (currentPage <= 3) {
        end = 4;
      }
      
      // Ajustar si estamos cerca del final
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }
      
      // Agregar páginas del rango
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Siempre mostrar última página
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando lugares...</p>
        </div>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-gray-600 text-lg font-medium">No se encontraron lugares</p>
        <p className="text-gray-500 text-sm mt-2">
          Intentá buscar con otros términos o filtros
        </p>
      </div>
    );
  }

  return (
    <div id="place-list-top">
      {/* Header con contador */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {places.length} {places.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Grid de lugares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPlaces.map((place, index) => {
          const lat = place.latitud || place.geometry?.location?.lat;
          const lng = place.longitud || place.geometry?.location?.lng;
          const distance = lat && lng ? calculateDistance(lat, lng) : null;

          return (
            <PlaceCard
              key={place.iD_Comercio || place.place_id || `place-${index}`}
              place={place}
              onClick={onPlaceClick}
              distance={distance}
            />
          );
        })}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Info de resultados */}
          <p className="text-sm text-gray-500">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, places.length)} de {places.length} lugares
          </p>

          {/* Controles de paginación */}
          <div className="flex items-center gap-1">
            {/* Ir al inicio */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Primera página"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>

            {/* Anterior */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Siguiente */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Ir al final */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Última página"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceList;
