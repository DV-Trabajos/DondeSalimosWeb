// ResenasAdmin.jsx - Moderación de reseñas
import { useState, useEffect } from 'react';
import { getAllResenias, deleteResena } from '../../services/reseniasService';
import { MessageSquare, Trash2, Star, Loader } from 'lucide-react';

const ResenasAdmin = () => {
  const [resenas, setResenas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResenas();
  }, []);

  const loadResenas = async () => {
    try {
      setIsLoading(true);
      const data = await getAllResenias();
      setResenas(data);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resena) => {
    if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return;

    try {
      await deleteResena(resena.iD_Resenia);
      alert('Reseña eliminada');
      loadResenas();
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      alert('Error al eliminar la reseña');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Moderación de Reseñas
        </h2>
      </div>

      <div className="space-y-4">
        {resenas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay reseñas para moderar
          </div>
        ) : (
          resenas.map((resena) => (
            <div
              key={resena.iD_Resenia}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{resena.calificacion}/5</span>
                  </div>
                  
                  <p className="text-gray-800 mb-2">{resena.comentario}</p>
                  
                  <div className="text-sm text-gray-600">
                    <span>Usuario ID: {resena.iD_Usuario}</span>
                    <span className="mx-2">•</span>
                    <span>Comercio ID: {resena.iD_Comercio}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(resena)}
                  className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  title="Eliminar reseña"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResenasAdmin;
