// App.jsx - Configuración completa de rutas
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import ToastContainer from './components/Notifications/ToastContainer';
import LoadingScreen from './components/Shared/LoadingScreen';
import './components/Modals/modals.css';

// Páginas públicas
import Login from './pages/Login';
import Home from './pages/Home';
import TerminosCondiciones from './pages/TerminosCondiciones';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';

// Páginas de usuario autenticado
import Profile from './pages/Profile';
import MisReservas from './pages/MisReservas';
import MisResenias from './pages/MisResenias';

// Páginas de dueño de comercio (rol 3)
import BarManagement from './pages/BarManagement';
import MisPublicidades from './pages/MisPublicidades';

// Páginas de administrador (rol 2)
import AdminPanel from './pages/AdminPanel';
import AdminComercios from './pages/admin/AdminComercios';
import AdminPublicidades from './pages/admin/AdminPublicidades';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminResenias from './pages/admin/AdminResenias';
import AdminReservas from './pages/admin/AdminReservas';
import AdminRoles from './pages/admin/AdminRoles';
import AdminTiposComercio from './pages/admin/AdminTiposComercio';

// Páginas de pagos
import PaymentCallback from './pages/PaymentCallback';

// COMPONENTES DE PROTECCIÓN DE RUTAS
// Ruta protegida - requiere autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Cargando..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Ruta para dueños de comercio (rol 3) - Los administradores (rol 2) también tienen acceso
const ComercioRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Cargando..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Rol 3 = Usuario Comercio, Rol 2 = Admin (también puede acceder)
  if (user?.iD_RolUsuario !== 3 && user?.iD_RolUsuario !== 2) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Ruta para administradores (rol 2)
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Cargando..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.iD_RolUsuario !== 2) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Ruta pública - redirige si ya está autenticado (solo para login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Cargando..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// APP PRINCIPAL - RUTAS
const AppRoutes = () => {
  return (
    <Routes>
      {/* RUTA PRINCIPAL*/}
      {/* Home público y muestra hero + mapa para todos */}
      <Route path="/" element={<Home />} />
      
      {/* RUTA DE LOGIN */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* RUTAS LEGALES (PÚBLICAS) */}
      <Route path="/terminos" element={<TerminosCondiciones />} />
      <Route path="/privacidad" element={<PoliticaPrivacidad />} />
      
      {/* RUTAS DE USUARIO AUTENTICADO */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* RESERVAS - Se adapta automáticamente según el rol */}
      <Route 
        path="/mis-reservas" 
        element={
          <ProtectedRoute>
            <MisReservas />
          </ProtectedRoute>
        } 
      />

      {/* MIS RESEÑAS - Para usuarios comunes */}
      <Route 
        path="/mis-resenias" 
        element={
          <ProtectedRoute>
            <MisResenias />
          </ProtectedRoute>
        } 
      />
      
      {/* RUTAS DE DUEÑO DE COMERCIO */}
      <Route 
        path="/mis-comercios" 
        element={
          <ComercioRoute>
            <BarManagement />
          </ComercioRoute>
        } 
      />
      
      <Route 
        path="/mis-publicidades" 
        element={
          <ComercioRoute>
            <MisPublicidades />
          </ComercioRoute>
        } 
      />
      
      {/* RUTAS DE ADMINISTRADOR */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/comercios" 
        element={
          <AdminRoute>
            <AdminComercios />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/publicidades" 
        element={
          <AdminRoute>
            <AdminPublicidades />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/usuarios" 
        element={
          <AdminRoute>
            <AdminUsuarios />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/resenias" 
        element={
          <AdminRoute>
            <AdminResenias />
          </AdminRoute>
        } 
      />

      <Route 
        path="/admin/reservas" 
        element={
          <AdminRoute>
            <AdminReservas />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/roles" 
        element={
          <AdminRoute>
            <AdminRoles />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/tipos-comercio" 
        element={
          <AdminRoute>
            <AdminTiposComercio />
          </AdminRoute>
        } 
      />
      
      {/* RUTA DE PAGO */}
      <Route 
        path="/payment/callback" 
        element={
          <ProtectedRoute>
            <PaymentCallback />
          </ProtectedRoute>
        } 
      />
      
      {/* RUTA 404 */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-3xl">404</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Página no encontrada</h1>
              <p className="text-gray-400 mb-8">La página que buscás no existe o fue movida.</p>
              <a 
                href="/" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <AppRoutes />
            <ToastContainer />
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;