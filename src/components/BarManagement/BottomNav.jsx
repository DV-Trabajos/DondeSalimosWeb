import { Home, Calendar, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const esRutaActiva = (ruta) => {
    return location.pathname === ruta;
  };

  const handleReservasClick = () => {
    // Si el usuario tiene rol de comercio, ir a reservas del comercio
    // Si no, ir a mis reservas como usuario
    if (user?.rol === 'Comercio') {
      navigate('/reservas-comercio');
    } else {
      navigate('/mis-reservas');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {/* Home */}
          <button
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              esRutaActiva('/home')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Inicio</span>
          </button>

          {/* Reservas */}
          <button
            onClick={handleReservasClick}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              esRutaActiva('/reservas-comercio') || esRutaActiva('/mis-reservas') || esRutaActiva('/reservas')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Reservas</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              esRutaActiva('/profile')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
