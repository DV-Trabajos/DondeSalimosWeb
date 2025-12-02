// WelcomeHero.jsx - Mini hero compacto para usuarios autenticados
import { Sparkles, Sun, Moon, Coffee, MapPin } from 'lucide-react';

const WelcomeHero = ({ user, placesCount = 0 }) => {
  // Obtener saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: '¡Buenos días', icon: Sun, emoji: '☀️' };
    if (hour >= 12 && hour < 19) return { text: '¡Buenas tardes', icon: Coffee, emoji: '🌤️' };
    return { text: '¡Buenas noches', icon: Moon, emoji: '🌙' };
  };

  const greeting = getGreeting();
  const displayName = user?.nombreUsuario?.split(' ')[0] || user?.nombre?.split(' ')[0] || 'Usuario';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Contenido centrado */}
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white/80 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>¿Qué planes tenés para hoy?</span>
          </div>
          
          {/* Saludo principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {greeting.text}, <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{displayName}</span>! {greeting.emoji}
          </h1>
          
          {/* Subtítulo */}
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6">
            Descubrí los mejores lugares cerca tuyo y reservá tu próxima salida
          </p>

          {/* Stats rápidos */}
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-400" />
              <span className="text-white font-medium">{placesCount || '74'} lugares</span>
              <span className="text-gray-400">cerca tuyo</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-gray-300">Buscando en vivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-14">
          <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 34C1200 36 1320 36 1380 36L1440 36V60H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default WelcomeHero;