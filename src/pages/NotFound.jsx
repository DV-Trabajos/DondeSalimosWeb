// NotFound.jsx - Página 404
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-2">
            Página no encontrada
          </h2>
          <p className="text-white/90 text-lg">
            Lo sentimos, la página que buscas no existe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver Atrás
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
