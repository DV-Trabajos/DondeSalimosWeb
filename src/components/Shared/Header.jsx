// Header.jsx - Componente Header
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, User, LogOut, Menu, X, Store, 
  Megaphone, LayoutDashboard, ChevronDown, Star, Bell,
  MapPin, Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationPanel from '../Notifications/NotificationPanel';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    logout();
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  const handleHashNavigation = (e, hash) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Determinar el rol del usuario
  const isAdmin = user?.iD_RolUsuario === 2;
  const isComercio = user?.iD_RolUsuario === 3;

  // Obtener nombre para mostrar
  const displayName = user?.nombreUsuario || user?.nombre || 'Usuario';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Componente de Link de navegación
  const NavLink = ({ to, active, icon, children, highlight = false, onClick, badge = null }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm
        ${active
          ? highlight
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
            : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-purple-700 border border-purple-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      {icon}
      <span>{children}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );

  // Componente para links de navegación pública (no logueados)
  const PublicNavLink = ({ href, onClick, children }) => (
    <a
      href={href}
      onClick={onClick}
      className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium transition-colors relative group"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
    </a>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Dónde Salimos?" 
                className="w-10 h-10 rounded-xl shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300 object-contain"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Dónde Salimos?
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-1 bg-gray-50/80 rounded-2xl p-1.5 border border-gray-100">
                {/* Inicio */}
                <NavLink 
                  to="/" 
                  active={isActive('/')} 
                  icon={<Home className="w-4 h-4" />}
                >
                  Inicio
                </NavLink>

                {/* NAVEGACIÓN PARA ADMIN */}
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    active={location.pathname.startsWith('/admin')} 
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    highlight
                  >
                    Panel Admin
                  </NavLink>
                )}

                {/* NAVEGACIÓN PARA COMERCIO */}
                {isComercio && !isAdmin && (
                  <>
                    <NavLink 
                      to="/mis-comercios" 
                      active={isActive('/mis-comercios')} 
                      icon={<Store className="w-4 h-4" />}
                    >
                      Mis Comercios
                    </NavLink>
                    <NavLink 
                      to="/mis-reservas"
                      active={isActive('/mis-reservas')} 
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Reservas
                    </NavLink>
                    <NavLink 
                      to="/mis-publicidades" 
                      active={isActive('/mis-publicidades')} 
                      icon={<Megaphone className="w-4 h-4" />}
                    >
                      Publicidades
                    </NavLink>
                  </>
                )}

                {/* NAVEGACIÓN PARA USUARIO COMÚN */}
                {!isAdmin && !isComercio && (
                  <>
                    <NavLink 
                      to="/mis-reservas"
                      active={isActive('/mis-reservas')} 
                      icon={<Calendar className="w-4 h-4" />}
                    >
                      Mis Reservas
                    </NavLink>
                    <NavLink 
                      to="/mis-resenias"
                      active={isActive('/mis-resenias')} 
                      icon={<Star className="w-4 h-4" />}
                    >
                      Mis Reseñas
                    </NavLink>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <PublicNavLink 
                  href="#mapa"
                  onClick={(e) => handleHashNavigation(e, '#mapa')}
                >
                  Explorar
                </PublicNavLink>
                <PublicNavLink 
                  href="#features"
                  onClick={(e) => handleHashNavigation(e, '#features')}
                >
                  Características
                </PublicNavLink>
                <PublicNavLink 
                  href="#about"
                  onClick={(e) => handleHashNavigation(e, '#about')}
                >
                  Nosotros
                </PublicNavLink>
                <PublicNavLink 
                  href="#contact"
                  onClick={(e) => handleHashNavigation(e, '#contact')}
                >
                  Contacto
                </PublicNavLink>
              </div>
            )}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notificaciones */}
                <NotificationPanel />

                {/* Menú de usuario */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`
                      flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200
                      ${userMenuOpen 
                        ? 'bg-purple-50 ring-2 ring-purple-200' 
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isAdmin ? 'Admin' : isComercio ? 'Comercio' : 'Usuario'}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown del usuario */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Info del usuario */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.correo}</p>
                          </div>
                        </div>
                        {/* Badge de rol */}
                        <div className="mt-3">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-purple-500/20 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200">
                              <LayoutDashboard className="w-3.5 h-3.5" />
                              Administrador
                            </span>
                          ) : isComercio ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500/10 to-pink-500/20 text-pink-700 text-xs font-semibold rounded-lg border border-pink-200">
                              <Store className="w-3.5 h-3.5" />
                              Dueño de Comercio
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-blue-500/20 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                              <User className="w-3.5 h-3.5" />
                              Usuario
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Links */}
                      <div className="py-2 px-2">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Mi Perfil</p>
                            <p className="text-xs text-gray-400">Ver y editar tu información</p>
                          </div>
                        </Link>
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2 px-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Cerrar Sesión</p>
                            <p className="text-xs text-red-400">Salir de tu cuenta</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
                >
                  Comenzar
                </Link>
              </div>
            )}

            {/* Botón menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white animate-in slide-in-from-top duration-200">
            <nav className="space-y-1 px-2">
              {isAuthenticated ? (
                <>
                  {/* Usuario info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl mb-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-semibold">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-600">{user?.correo}</p>
                      </div>
                    </div>
                  </div>

                  <NavLink 
                    to="/" 
                    active={isActive('/')} 
                    icon={<Home className="w-4 h-4" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inicio
                  </NavLink>

                  {isAdmin && (
                    <NavLink 
                      to="/admin" 
                      active={location.pathname.startsWith('/admin')} 
                      icon={<LayoutDashboard className="w-4 h-4" />}
                      highlight
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Panel Admin
                    </NavLink>
                  )}

                  {isComercio && !isAdmin && (
                    <>
                      <NavLink 
                        to="/mis-comercios" 
                        active={isActive('/mis-comercios')} 
                        icon={<Store className="w-4 h-4" />}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mis Comercios
                      </NavLink>
                      <NavLink 
                        to="/mis-reservas"
                        active={isActive('/mis-reservas')} 
                        icon={<Calendar className="w-4 h-4" />}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reservas
                      </NavLink>
                      <NavLink 
                        to="/mis-publicidades" 
                        active={isActive('/mis-publicidades')} 
                        icon={<Megaphone className="w-4 h-4" />}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Publicidades
                      </NavLink>
                    </>
                  )}

                  {!isAdmin && !isComercio && (
                    <>
                      <NavLink 
                        to="/mis-reservas"
                        active={isActive('/mis-reservas')} 
                        icon={<Calendar className="w-4 h-4" />}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mis Reservas
                      </NavLink>
                      <NavLink 
                        to="/mis-resenias"
                        active={isActive('/mis-resenias')} 
                        icon={<Star className="w-4 h-4" />}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mis Reseñas
                      </NavLink>
                    </>
                  )}

                  <div className="border-t border-gray-100 my-3"></div>
                  
                  <NavLink 
                    to="/profile"
                    active={isActive('/profile')} 
                    icon={<User className="w-4 h-4" />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 w-full text-left rounded-xl text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <a 
                    href="#mapa" 
                    onClick={(e) => {
                      handleHashNavigation(e, '#mapa');
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    Explorar
                  </a>
                  <a 
                    href="#features" 
                    onClick={(e) => {
                      handleHashNavigation(e, '#features');
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    Características
                  </a>
                  <a 
                    href="#about" 
                    onClick={(e) => {
                      handleHashNavigation(e, '#about');
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    Nosotros
                  </a>
                  <a 
                    href="#contact" 
                    onClick={(e) => {
                      handleHashNavigation(e, '#contact');
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    Contacto
                  </a>
                  <div className="border-t border-gray-100 my-3"></div>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-center font-medium shadow-lg"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;