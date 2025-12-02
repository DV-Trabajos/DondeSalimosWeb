// AdminBreadcrumbs.jsx - Breadcrumbs para navegación en el panel admin
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const AdminBreadcrumbs = () => {
  const location = useLocation();
  
  // Mapeo de rutas a nombres legibles
  const routeNames = {
    'admin': 'Administración',
    'usuarios': 'Usuarios',
    'comercios': 'Comercios',
    'publicidades': 'Publicidades',
    'resenias': 'Reseñas',
    'reservas': 'Reservas',
    'reportes': 'Reportes',
    'roles': 'Roles de Usuario',
    'tipos-comercio': 'Tipos de Comercio',
    'configuracion': 'Configuración'    
  };

  // Construir breadcrumbs desde la ruta actual
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;
    
    return {
      name,
      path,
      isLast
    };
  });

  // Si no hay breadcrumbs o solo está en /admin, no mostrar nada
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {/* Home link */}
      <Link
        to="/admin"
        className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>

      {/* Breadcrumbs */}
      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {crumb.isLast ? (
            <span className="text-gray-900 font-semibold">{crumb.name}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumbs;
