// Login.jsx - Componente de Logeo
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import GoogleLoginButton from '../components/Auth/GoogleLoginButton';
import { ROLES } from '../utils/constants';
import { 
  Users, Store, Shield, Home, AlertCircle, CheckCircle, 
  MapPin, Star, Music, Calendar, ArrowLeft, Sparkles 
} from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES.USUARIO_COMUN);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta desde donde vino
  const from = location.state?.from?.pathname || '/';
  const returnAction = location.state?.action || null;
  const returnComercio = location.state?.comercio || null;

  // PREVENIR RECARGA AL APRETAR ENTER
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Opciones de roles para registro
  const roleOptions = [
    {
      id: ROLES.USUARIO_COMUN,
      name: 'Usuario',
      description: 'Buscá y reservá en bares y boliches',
      icon: Users,
    },
    {
      id: ROLES.USUARIO_COMERCIO,
      name: 'Dueño de Comercio',
      description: 'Gestioná tu bar o restaurante',
      icon: Store,
    },
  ];

  // Features decorativas
  const decorativeFeatures = [
    { icon: MapPin, text: 'Encontrá lugares cerca tuyo', color: 'from-pink-500 to-rose-500' },
    { icon: Calendar, text: 'Reservá tu lugar fácilmente', color: 'from-purple-500 to-violet-500' },
    { icon: Star, text: 'Leé reseñas de otros usuarios', color: 'from-amber-500 to-orange-500' },
    { icon: Music, text: 'Filtrá por género musical', color: 'from-cyan-500 to-blue-500' },
  ];

  const handleSuccess = (user) => {
    setError(null);
    setSuccessMessage(`¡Bienvenido, ${user.nombreUsuario || user.email}!`);

    setTimeout(() => {
      // Si vino con una acción pendiente, volver al home
      if (returnAction && returnComercio) {
        navigate('/', { 
          replace: true, 
          state: { 
            pendingAction: returnAction, 
            pendingComercio: returnComercio 
          } 
        });
      } else if (user.iD_RolUsuario === ROLES.ADMINISTRADOR) {
        navigate('/admin', { replace: true });
      } else if (user.iD_RolUsuario === ROLES.USUARIO_COMERCIO) {
        navigate('/mis-comercios', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 1500);
  };

  const handleError = (errorData) => {
    setSuccessMessage(null);

    if (errorData.needsRegistration) {
      setError(errorData.message || 'Usuario no registrado. Por favor, registrate primero.');
      setTimeout(() => {
        if (!isRegistering) {
          setIsRegistering(true);
        }
      }, 3000);
      return;
    }

    if (errorData.alreadyRegistered) {
      setError(errorData.message || 'Este usuario ya está registrado. Por favor, iniciá sesión.');
      setTimeout(() => {
        if (isRegistering) {
          setIsRegistering(false);
        }
      }, 3000);
      return;
    }

    setError(errorData.message || 'Error en la autenticación. Por favor, intentá nuevamente.');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con gradiente y elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Círculos decorativos animados */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Patrón de puntos sutil */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex">
        {/* Lado izquierdo - Info decorativa (solo desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <img 
                src="/logo.png" 
                alt="Dónde Salimos?" 
                className="w-12 h-12 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-105 transition object-contain"
              />
              <span className="text-2xl font-bold text-white">Dónde Salimos?</span>
            </Link>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Descubrí los mejores lugares para 
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"> salir</span>
            </h1>

            <p className="text-lg text-gray-300 mb-10">
              Explorá bares, boliches y restaurantes cerca tuyo. 
              Hacé reservas online y disfrutá de las mejores noches.
            </p>

            {/* Features mini */}
            <div className="space-y-4">
              {decorativeFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 text-gray-300 group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="group-hover:text-white transition">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-gray-400 text-sm">Lugares</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-gray-400 text-sm">Usuarios</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">4.8★</p>
                <p className="text-gray-400 text-sm">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            {/* Card del formulario */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10">
              {/* Header del formulario */}
              <div className="text-center mb-8">
                {/* Logo móvil */}
                <div className="lg:hidden mb-6">
                  <Link to="/" className="inline-flex items-center gap-2">
                    <img 
                      src="/logo.png" 
                      alt="Dónde Salimos?" 
                      className="w-10 h-10 rounded-xl object-contain"
                    />
                    <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                      Dónde Salimos?
                    </span>
                  </Link>
                </div>

                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                  {isRegistering ? (
                    <Sparkles className="w-8 h-8 text-white" />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isRegistering ? '¡Creá tu cuenta!' : '¡Bienvenido de nuevo!'}
                </h2>
                <p className="text-gray-600">
                  {isRegistering 
                    ? 'Registrate para empezar a explorar' 
                    : 'Iniciá sesión para continuar'}
                </p>
              </div>

              {/* Mensajes de error/éxito */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-green-700 text-sm">{successMessage}</p>
                </div>
              )}

              {isRegistering ? (
                <>
                  {/* MODO REGISTRO */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ¿Cómo vas a usar la app?
                    </label>
                    <div className="space-y-3">
                      {roleOptions.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => setSelectedRole(role.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {role.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {role.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <GoogleLoginButton
                    isRegistering={true}
                    selectedRole={selectedRole}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      ¿Ya tenés cuenta?{' '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-purple-600 font-semibold hover:text-purple-700 hover:underline"
                      >
                        Iniciá sesión
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* MODO LOGIN */}
                  <GoogleLoginButton
                    isRegistering={false}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      ¿No tenés cuenta?{' '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-purple-600 font-semibold hover:text-purple-700 hover:underline"
                      >
                        Registrate
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* Volver al inicio */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio
                </Link>
              </div>
            </div>

            {/* Texto legal */}
            <p className="text-center text-gray-400 text-xs mt-6 px-4">
              Al continuar, aceptás nuestros{' '}
              <Link to="/terminos" className="text-purple-400 hover:text-purple-300 underline">
                Términos de Servicio
              </Link>{' '}
              y{' '}
              <Link to="/privacidad" className="text-purple-400 hover:text-purple-300 underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Wave decoration en la parte inferior (mobile) */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 24C840 28 960 32 1080 34C1200 36 1320 36 1380 36L1440 36V60H0Z" fill="rgba(255,255,255,0.05)"/>
        </svg>
      </div>
    </div>
  );
};

export default Login;