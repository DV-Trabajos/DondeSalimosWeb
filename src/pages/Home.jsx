// Home.jsx - Hero + Mapa público + Secciones informativas + Footer
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import SearchBar from '../components/Home/SearchBar';
import GoogleMapView from '../components/Home/GoogleMapView';
import PlaceList from '../components/Home/PlaceList';
import PlaceDetailModal from '../components/Home/PlaceDetailModal';
import PublicidadViewerModal from '../components/Home/PublicidadViewerModal';
import PublicidadesCarousel from '../components/Home/PublicidadesCarousel';
import ReservaModal from '../components/Reservations/ReservaModal';
import ReviewModal from '../components/Reviews/ReviewModal';
import WelcomeHero from '../components/Home/WelcomeHero';
import HeroFloatingCards from '../components/Home/HeroFloatingCards';
import {
  getAllComercios,
  filterApprovedComercios,
  filterComerciosByType,
  sortComerciosByDistance,
  geocodeAddress,
} from '../services/comerciosService';
import { nearbySearch, normalizeGooglePlace } from '../services/googleMapsService';
import { 
  MapPin, List, Loader, AlertCircle, ArrowRight, Play,
  Calendar, Star, Music, Users, Shield, Clock, 
  CheckCircle, Mail, Phone, Send
} from 'lucide-react';

const Home = () => {
  // Auth
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  
  // Estados para modales
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedComercioForAction, setSelectedComercioForAction] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // Estados para historias (publicidades)
  const [selectedPublicidad, setSelectedPublicidad] = useState(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    genres: [],
    sortBy: 'name',
  });
  const [includeGooglePlaces, setIncludeGooglePlaces] = useState(true);

  // Estado para newsletter
  const [email, setEmail] = useState('');
  const [showNewsletterSuccess, setShowNewsletterSuccess] = useState(false);

  // Location hook
  const { 
    location, 
    latitude, 
    longitude, 
    isLoading: locationLoading,
    setManualLocation
  } = useLocation();

  // Ubicación por defecto (CABA)
  const DEFAULT_LOCATION = {
    latitude: 34.3559,
    longitude: 58.2255,
  };

  // Datos estáticos
  const features = [
    {
      icon: MapPin,
      title: 'Encontrá lugares cerca tuyo',
      description: 'Descubrí bares y boliches cerca de tu ubicación con nuestro mapa interactivo.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Calendar,
      title: 'Reservá tu lugar',
      description: 'Hacé reservas online de manera fácil y rápida. Sin esperas ni llamadas.',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: Star,
      title: 'Leé reseñas reales',
      description: 'Conocé la opinión de otros usuarios antes de elegir a dónde ir.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Music,
      title: 'Filtrá por género musical',
      description: 'Encontrá el lugar perfecto según tu estilo: rock, electrónica, cumbia y más.',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const stats = [
    { value: '500+', label: 'Lugares' },
    { value: '10K+', label: 'Usuarios' },
    { value: '4.8★', label: 'Rating' },
  ];

  // Usar ubicación por defecto si no hay después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!location && !locationLoading) {
        setManualLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [location, locationLoading, setManualLocation]);

  // Cargar lugares cuando tengamos ubicación
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      loadPlaces();
    }
  }, [latitude, longitude, includeGooglePlaces]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [places, filters, latitude, longitude]);

  // Función de geocodificación mejorada
  const geocodificarComercio = async (comercio, userLat, userLng) => {
    if (comercio.latitud && comercio.longitud && 
        !isNaN(comercio.latitud) && !isNaN(comercio.longitud) &&
        comercio.latitud !== 0 && comercio.longitud !== 0) {
      return { ...comercio, isLocal: true };
    }

    if (!comercio.direccion || comercio.direccion.trim() === '') {
      const offsetLat = (Math.random() - 0.5) * 0.02;
      const offsetLng = (Math.random() - 0.5) * 0.02;
      return {
        ...comercio,
        latitud: userLat + offsetLat,
        longitud: userLng + offsetLng,
        isLocal: true,
        coordenadasAproximadas: true,
      };
    }

    try {
      const coords = await geocodeAddress(comercio.direccion);
      if (coords && coords.lat && coords.lng) {
        return { ...comercio, latitud: coords.lat, longitud: coords.lng, isLocal: true };
      }
    } catch (geoError) {
      console.warn(`${comercio.nombre}: Error geocodificando`);
    }

    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;
    return {
      ...comercio,
      latitud: userLat + offsetLat,
      longitud: userLng + offsetLng,
      isLocal: true,
      coordenadasAproximadas: true,
    };
  };

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const comercios = await getAllComercios();
      const comerciosAprobados = filterApprovedComercios(comercios || []);

      const comerciosConCoordenadas = await Promise.all(
        comerciosAprobados.map(comercio => 
          geocodificarComercio(comercio, latitude, longitude)
        )
      );

      let allPlaces = comerciosConCoordenadas;

      if (includeGooglePlaces && latitude && longitude) {
        try {
          const googlePlaces = await nearbySearch(latitude, longitude, 10000, 'bar');
          const normalizedGooglePlaces = (googlePlaces || []).map(normalizeGooglePlace);
          allPlaces = [...comerciosConCoordenadas, ...normalizedGooglePlaces];
        } catch (googleError) {
          console.warn('Error al cargar lugares de Google:', googleError);
        }
      }

      setPlaces(allPlaces);

    } catch (err) {
      setError('Error al cargar los lugares. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...places];

    if (filters.type !== 'all') {
      result = filterComerciosByType(result, parseInt(filters.type));
    }

    if (filters.searchTerm?.trim()) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(place =>
        place.nombre?.toLowerCase().includes(search) ||
        place.direccion?.toLowerCase().includes(search) ||
        place.descripcion?.toLowerCase().includes(search)
      );
    }

    if (filters.genres && filters.genres.length > 0) {
      result = result.filter(place => {
        if (!place.isLocal) return true;
        if (!place.generoMusical) return false;
        const generoComercio = place.generoMusical.toLowerCase();
        return filters.genres.some(genre => 
          generoComercio.includes(genre.replace('_', ' '))
        );
      });
    }

    if (filters.sortBy === 'distance' && latitude && longitude) {
      result = sortComerciosByDistance(result, latitude, longitude);
    } else if (filters.sortBy === 'rating') {
      result = result.sort((a, b) => (b.calificacionPromedio || b.rating || 0) - (a.calificacionPromedio || a.rating || 0));
    } else {
      result = result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }

    setFilteredPlaces(result);
  };

  // Handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  // Handler para reserva - requiere login
  const handleOpenReserva = (comercio) => {
    if (!isAuthenticated) {
      setSelectedComercioForAction(comercio);
      setPendingAction('reserva');
      setShowLoginPrompt(true);
      setIsModalOpen(false);
      return;
    }
    setIsModalOpen(false);
    setSelectedPlace(null);
    setSelectedComercioForAction(comercio);
    setShowReservaModal(true);
  };

  // Handler para reseña - requiere login
  const handleOpenReview = (comercio) => {
    if (!isAuthenticated) {
      setSelectedComercioForAction(comercio);
      setPendingAction('review');
      setShowLoginPrompt(true);
      setIsModalOpen(false);
      return;
    }
    setIsModalOpen(false);
    setSelectedPlace(null);
    setSelectedComercioForAction(comercio);
    setShowReviewModal(true);
  };

  const handleStoryPress = (publicidad) => {
    setSelectedPublicidad(publicidad);
    setViewerVisible(true);
  };

  const handleViewOnMap = (publicidad) => {
    const comercio = places.find(p => p.iD_Comercio === publicidad.iD_Comercio);
    if (comercio) {
      setViewerVisible(false);
      setSelectedPublicidad(null);
      handlePlaceClick(comercio);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    setShowNewsletterSuccess(true);
    setEmail('');
    
    setTimeout(() => {
      setShowNewsletterSuccess(false);
    }, 4000);
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { returnTo: '/', action: pendingAction, comercio: selectedComercioForAction } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section - Diferente según autenticación */}
      {isAuthenticated ? (
        <WelcomeHero user={user} placesCount={filteredPlaces.length} />
      ) : (
        <HeroFloatingCards />
      )}

      {/* Sección del Mapa */}
      <section id="mapa" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Título de sección */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Explorá los mejores lugares
            </h2>
            <p className="text-gray-600">
              {filteredPlaces.length} lugares disponibles cerca tuyo
            </p>
          </div>

          {/* Carrusel de Publicidades/Promociones */}
          <div className="mt-4">
            <PublicidadesCarousel onVerEnMapa={handleStoryPress} />
          </div>

          {/* Toggle Mapa/Lista */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="inline-flex rounded-xl p-1 bg-white shadow-lg border border-gray-200">
              <button
                onClick={() => setViewMode('map')}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${viewMode === 'map'
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-purple-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <MapPin className="w-4 h-4" />
                <span>Mapa</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${viewMode === 'list'
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-purple-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <List className="w-4 h-4" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {/* Barra de búsqueda con filtros - Debajo del toggle */}
          <div className="mb-6">
            <SearchBar
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />
          </div>

          {/* Contenido del mapa/lista */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Cargando lugares...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadPlaces}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reintentar
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <GoogleMapView
              places={filteredPlaces}
              userLocation={location}
              selectedPlace={selectedPlace}
              onPlaceClick={handlePlaceClick}
              onStoryPress={handleStoryPress}
            />
          ) : (
            <PlaceList
              places={filteredPlaces}
              onPlaceClick={handlePlaceClick}
              userLocation={location}
            />
          )}
        </div>
      </section>

      {/* Features Section - Solo para no logueados */}
      {!isAuthenticated && (
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Todo lo que necesitás para salir
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encontrá, reservá y disfrutá. Así de simple.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section - Solo para no logueados */}
      {!isAuthenticated && (
        <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Somos <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">DondeSalimos</span>
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Nacimos con una misión clara: conectar a las personas con los mejores lugares para disfrutar de la noche. 
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Creemos que salir debería ser fácil y divertido. Por eso creamos una plataforma que te permite descubrir nuevos lugares, leer reseñas de otros usuarios y reservar tu mesa en segundos.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br ${
                        i === 0 ? 'from-pink-400 to-pink-600' :
                        i === 1 ? 'from-purple-400 to-purple-600' :
                        i === 2 ? 'from-blue-400 to-blue-600' :
                        'from-green-400 to-green-600'
                      }`}></div>
                    ))}
                  </div>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">+10,000</span> usuarios confían en nosotros
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Reservas seguras</h3>
                      <p className="text-gray-500 text-sm">Confirmación instantánea</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Reseñas verificadas</h3>
                      <p className="text-gray-500 text-sm">De usuarios reales</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">24/7 disponible</h3>
                      <p className="text-gray-500 text-sm">Cuando vos quieras</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA para comercios - Solo para no logueados */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Tenés un bar o boliche?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Registrate gratis y empezá a recibir reservas online. 
              Aumentá tu visibilidad y llegá a miles de clientes potenciales.
            </p>
            <Link to="/login" state={{ register: true, role: 3 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition"
            >
              Registrar mi comercio
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Contact Section - Solo para no logueados */}
      {!isAuthenticated && (
        <section id="contact" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  ¿Tenés alguna consulta?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Estamos acá para ayudarte. Escribinos y te responderemos a la brevedad.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <a href="mailto:dondesalimosad@gmail.com" className="text-gray-900 font-medium hover:text-pink-600 transition">
                        dondesalimosad@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">WhatsApp</p>
                      <a href="https://wa.me/5491155631987" className="text-gray-900 font-medium hover:text-purple-600 transition">
                        +54 9 11 5563-1987
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Ubicación</p>
                      <p className="text-gray-900 font-medium">CABA, Argentina</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Suscribite a nuestro newsletter
                </h3>
                <p className="text-gray-600 mb-6">
                  Recibí las mejores promos y eventos en tu email.
                </p>

                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    Suscribirme
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                <p className="text-gray-500 text-sm mt-4">
                  No spam. Podés desuscribirte cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />

      {/* Modales */}
      {isModalOpen && selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onOpenReserva={handleOpenReserva}
          onOpenReview={handleOpenReview}
        />
      )}

      <PublicidadViewerModal
        isOpen={viewerVisible}
        publicidad={selectedPublicidad}
        onClose={() => setViewerVisible(false)}
        onViewOnMap={handleViewOnMap}
      />

      {showReservaModal && selectedComercioForAction && (
        <ReservaModal
          isOpen={showReservaModal}
          comercio={selectedComercioForAction}
          onClose={() => {
            setShowReservaModal(false);
            setSelectedComercioForAction(null);
          }}
          onSuccess={() => {
            setShowReservaModal(false);
            setSelectedComercioForAction(null);
          }}
        />
      )}

      {showReviewModal && selectedComercioForAction && (
        <ReviewModal
          isOpen={showReviewModal}
          comercio={selectedComercioForAction}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedComercioForAction(null);
          }}
          onSuccess={() => {
            setShowReviewModal(false);
            setSelectedComercioForAction(null);
          }}
        />
      )}

      {/* Modal de Login Requerido */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {pendingAction === 'reserva' ? (
                  <Calendar className="w-8 h-8 text-white" />
                ) : (
                  <Star className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {pendingAction === 'reserva' ? 'Iniciá sesión para reservar' : 'Iniciá sesión para opinar'}
              </h3>
              <p className="text-gray-600 mb-6">
                {pendingAction === 'reserva' 
                  ? 'Necesitás una cuenta para hacer reservas en los comercios.'
                  : 'Necesitás una cuenta para dejar reseñas y compartir tu experiencia.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setPendingAction(null);
                    setSelectedComercioForAction(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Newsletter Success */}
      {showNewsletterSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Gracias por suscribirte!</h3>
            <p className="text-gray-600">
              Pronto recibirás las mejores promos y eventos en tu email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;