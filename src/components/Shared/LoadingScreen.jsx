// src/components/Shared/LoadingScreen.jsx
const LoadingScreen = ({ message = '' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
      <div className="text-center">
        <img 
          src="/logo.png" 
          alt="Cargando..." 
          className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse object-contain"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        {message && <p className="text-gray-400">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingScreen;