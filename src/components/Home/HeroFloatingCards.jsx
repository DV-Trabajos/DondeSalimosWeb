// HeroFloatingCards.jsx - Hero con tarjetas flotantes 3D y efecto parallax
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, MapPin } from 'lucide-react';

const HeroFloatingCards = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Manejar movimiento del mouse para efecto parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    
    setMousePosition({ x, y });
  };

  // Reset cuando el mouse sale
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Stats
  const stats = [
    { value: '500+', label: 'Lugares' },
    { value: '10K+', label: 'Usuarios' },
    { value: '4.8★', label: 'Rating' },
  ];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white min-h-[600px]"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna izquierda - Contenido */}
          <div className="text-center lg:text-left z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              +500 lugares disponibles
            </div>
            
            {/* Título */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Dónde{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                salimos?
              </span>
            </h1>
            
            {/* Descripción */}
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Descubrí los mejores bares y boliches de tu ciudad. 
              Reservá tu lugar y disfrutá de la mejor noche.
            </p>
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold text-lg hover:opacity-90 transition shadow-lg hover:shadow-pink-500/25 hover:scale-105 transform duration-300"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#mapa"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#mapa')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-white/20 transition border border-white/20"
              >
                <Play className="w-5 h-5" />
                Ver cómo funciona
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 justify-center lg:justify-start">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha - Tarjetas flotantes 3D */}
          <div className="hidden lg:block relative h-[450px]">
            {/* Contenedor de tarjetas con perspectiva */}
            <div 
              className="relative w-full h-full"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Tarjeta grande principal */}
              <div 
                className="absolute top-0 right-0 w-80 h-52 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-500 to-purple-600 shadow-2xl shadow-purple-500/30 transition-transform duration-200 ease-out"
                style={{
                  transform: `
                    rotateY(${mousePosition.x * 15}deg) 
                    rotateX(${-mousePosition.y * 15}deg)
                    translateZ(50px)
                  `,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Brillo interior */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 to-transparent"></div>
                {/* Patrón decorativo */}
                <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
              </div>

              {/* Tarjeta "Bar La Esquina" */}
              <div 
                className="absolute top-32 right-[-20px] w-64 bg-white rounded-2xl shadow-xl p-4 transition-transform duration-200 ease-out"
                style={{
                  transform: `
                    rotateY(${mousePosition.x * 10}deg) 
                    rotateX(${-mousePosition.y * 10}deg)
                    translateZ(80px)
                  `,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Imagen placeholder */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 mb-3"></div>
                
                <h3 className="font-bold text-gray-900 text-lg">Bar La Esquina</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-3 h-3 text-pink-500" />
                  <span>Centro, Posadas</span>
                </div>
              </div>

              {/* Tarjeta "Club Nocturno" */}
              <div 
                className="absolute bottom-10 right-20 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 transition-transform duration-200 ease-out"
                style={{
                  transform: `
                    rotateY(${mousePosition.x * 20}deg) 
                    rotateX(${-mousePosition.y * 20}deg)
                    translateZ(100px)
                  `,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Icono */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xl">🪩</span>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900">Club Nocturno</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 text-xs font-medium">Abierto ahora</span>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos flotantes */}
              <div 
                className="absolute top-10 left-10 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 opacity-60 blur-sm transition-transform duration-300"
                style={{
                  transform: `
                    translateX(${mousePosition.x * 30}px) 
                    translateY(${mousePosition.y * 30}px)
                  `,
                }}
              ></div>
              
              <div 
                className="absolute bottom-20 left-20 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-50 blur-sm transition-transform duration-300"
                style={{
                  transform: `
                    translateX(${mousePosition.x * -20}px) 
                    translateY(${mousePosition.y * -20}px)
                  `,
                }}
              ></div>

              <div 
                className="absolute top-40 left-0 w-8 h-8 rounded-full bg-pink-400 opacity-40 transition-transform duration-300"
                style={{
                  transform: `
                    translateX(${mousePosition.x * 40}px) 
                    translateY(${mousePosition.y * 40}px)
                  `,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none" 
          className="w-full h-16 sm:h-24"
        >
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroFloatingCards;
