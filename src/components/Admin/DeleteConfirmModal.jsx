// DeleteConfirmModal.jsx - Modal de confirmación para eliminar comercio
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, comercio, isDeleting = false }) => {
  if (!isOpen || !comercio) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header compacto */}
          <div className="bg-red-600 text-white px-5 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold">Confirmar Eliminación</h2>
            </div>
            {!isDeleting && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-red-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Contenido compacto */}
          <div className="p-5">
            <div className="mb-4">
              <p className="text-base font-semibold text-gray-900 mb-2">
                ¿Eliminar "{comercio.nombre}"?
              </p>
              <p className="text-sm text-gray-600">
                Esta acción es <span className="font-bold text-red-600">permanente</span> y eliminará:
              </p>
            </div>

            {/* Lista compacta de consecuencias */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <ul className="space-y-1 text-sm text-red-800">
                <li className="flex items-center gap-2">
                  <span className="text-red-600">•</span>
                  <span>El comercio y su información</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">•</span>
                  <span>Todas las reservas</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">•</span>
                  <span>Todas las publicidades</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">•</span>
                  <span>Todas las reseñas</span>
                </li>
              </ul>
            </div>

            {/* Botones compactos */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;