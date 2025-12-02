// Footer.jsx - Footer profesional con información de contacto y redes sociales
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Heart,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/dondesalimos', color: 'hover:text-blue-500' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/dondesalimos', color: 'hover:text-pink-500' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/dondesalimos', color: 'hover:text-sky-500' },
  ];

  // Función para manejar navegación con hash (scroll a secciones)
  const handleHashLink = (e, hash) => {
    e.preventDefault();
    
    // Si ya estamos en la página principal
    if (location.pathname === '/') {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra página, navegar a home y luego hacer scroll
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const quickLinks = [
    { name: 'Inicio', path: '/', isHash: false },
    { name: 'Quiénes Somos', path: '/#about', hash: '#about', isHash: true },
    { name: 'Registrar mi Comercio', path: '/login?rol=comercio', isHash: false },
    { name: 'Términos y Condiciones', path: '/terminos', isHash: false, scrollTop: true },
    { name: 'Política de Privacidad', path: '/privacidad', isHash: false, scrollTop: true },
  ];

  const categories = [
    { name: 'Bares', path: '/?tipo=1' },
    { name: 'Boliches', path: '/?tipo=2' },
    { name: 'Con música en vivo', path: '/?genero=rock' },
    { name: 'Electrónica', path: '/?genero=techno' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Sección principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Columna 1: Logo e info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="¿Dónde Salimos?" 
                className="w-12 h-12 rounded-xl object-contain"
              />
              <div>
                <h3 className="font-bold text-xl">¿Dónde Salimos?</h3>
                <p className="text-gray-400 text-sm">Tu guía de salidas nocturnas</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Descubrí los mejores bares y boliches de tu ciudad. 
              Reservá tu lugar y disfrutá de la noche.
            </p>
            
            {/* Redes sociales */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2: Links rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.isHash ? (
                    <a
                      href={link.path}
                      onClick={(e) => handleHashLink(e, link.hash)}
                      className="text-gray-400 hover:text-pink-400 transition text-sm flex items-center gap-1 cursor-pointer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => link.scrollTop && window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-gray-400 hover:text-pink-400 transition text-sm flex items-center gap-1"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Categorías */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Explorá</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="text-gray-400 hover:text-pink-400 transition text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-white">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  CABA, Argentina
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <a href="tel:+5493764000000" className="text-gray-400 hover:text-pink-400 transition text-sm">
                  +54 9 376 400-0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <a href="mailto:info@dondesalimos.com" className="text-gray-400 hover:text-pink-400 transition text-sm">
                  info@dondesalimos.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Lunes a Viernes<br />9:00 a 18:00 hs
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Separador con gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>

      {/* Copyright */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} DondeSalimos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;