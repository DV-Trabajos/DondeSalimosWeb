// AdminSidebar.jsx - Sidebar del panel de administración
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Store, Megaphone, Star, Calendar,
  Menu, X, Shield, Tag, Sparkles
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin', 
      exact: true,
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Users, 
      label: 'Usuarios', 
      path: '/admin/usuarios',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Store, 
      label: 'Comercios', 
      path: '/admin/comercios',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Megaphone, 
      label: 'Publicidades', 
      path: '/admin/publicidades',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Star, 
      label: 'Reseñas', 
      path: '/admin/resenias',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Calendar, 
      label: 'Reservas', 
      path: '/admin/reservas',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Shield, 
      label: 'Roles', 
      path: '/admin/roles',
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      icon: Tag, 
      label: 'Tipos de Comercio', 
      path: '/admin/tipos-comercio',
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path, item.exact);

    return (
      <Link
        to={item.path}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
          active
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {/* Icono con gradiente cuando está activo */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
          active 
            ? 'bg-white/20' 
            : `bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100`
        }`}>
          <Icon className={`w-5 h-5 transition-colors duration-300 ${
            active 
              ? 'text-white' 
              : 'text-gray-500 group-hover:text-white'
          }`} />
        </div>
        
        {/* Icono normal cuando no tiene el mouse arriba */}
        {!active && (
          <div className="absolute left-3 w-9 h-9 rounded-lg flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
            <Icon className="w-5 h-5 text-gray-500" />
          </div>
        )}
        
        {isOpen && (
          <span className={`font-medium transition-colors duration-300 ${
            active ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
          }`}>
            {item.label}
          </span>
        )}

        {/* Indicador de activo */}
        {active && (
          <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 flex flex-col shadow-xl ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header con gradiente */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
          </div>
          
          <div className="relative h-16 flex items-center justify-between px-4">
            {isOpen ? (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 hover:opacity-80 transition group"
                title="Volver al Inicio"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/20 transition">
                  <img 
                    src="/logo.png" 
                    alt="DondeSalimos" 
                    className="w-7 h-7 rounded-lg object-contain"
                  />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">Admin</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span className="text-xs text-gray-300">Panel de control</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center hover:opacity-80 transition"
                title="Volver al Inicio"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition">
                  <img 
                    src="/logo.png" 
                    alt="DondeSalimos" 
                    className="w-7 h-7 rounded-lg object-contain"
                  />
                </div>
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition text-white hidden lg:block"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú Principal */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isOpen && (
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Menú Principal
              </p>
            </div>
          )}
          
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem key={index} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Dónde Salimos?</p>
                <p className="text-xs text-gray-400">Panel Administrativo</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar;