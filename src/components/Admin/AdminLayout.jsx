// AdminLayout.jsx - Layout unificado para panel de administración
import { useState } from 'react';
import { Menu, X, ChevronDown, User, LogOut, ChevronRight, Home, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from './AdminSidebar';
import NotificationPanel from '../Notifications/NotificationPanel';

const AdminLayout = ({ 
  children, 
  title, 
  subtitle, 
  actions 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.nombreUsuario || user?.nombre || 'Admin';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Mapeo de rutas a nombres legibles para breadcrumbs
  const routeNames = {
    'admin': 'Dashboard',
    'usuarios': 'Usuarios',
    'comercios': 'Comercios',
    'publicidades': 'Publicidades',
    'resenias': 'Reseñas',
    'reservas': 'Reservas',
    'reportes': 'Reportes',
    'roles': 'Roles',
    'tipos-comercio': 'Tipos de Comercio',
    'configuracion': 'Configuración'    
  };

  // Construir breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;
    return { name, path, isLast };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Contenido Principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* TopBar con gradiente sutil */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Botón menú móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Acciones del lado derecho */}
            <div className="flex items-center gap-3">
              {/* Campana de notificaciones */}
              <NotificationPanel />

              {/* Separador */}
              <div className="h-8 w-px bg-gray-200"></div>

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <span className="text-white font-semibold text-sm">{initials}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
                      {/* Header del dropdown */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">{user?.correo || 'admin@dondesalimos.com'}</p>
                      </div>
                      
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium">Mi Perfil</span>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium">Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="px-6 py-3 bg-white/50 border-b border-gray-100">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {breadcrumbs.slice(1).map((crumb) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  {crumb.isLast ? (
                    <span className="font-medium text-gray-900">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Header */}
        {(title || actions) && (
          <div className="px-6 py-5 bg-white border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Icono decorativo */}
                <div className="hidden sm:flex w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-500 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenido */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay para celu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;