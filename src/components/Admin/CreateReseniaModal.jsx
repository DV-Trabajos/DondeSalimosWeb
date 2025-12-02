// CreateReseniaModal.jsx - Modal para crear/editar reseña
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Star, User, Store, MessageSquare, Save, Loader2,
  AlertTriangle, Sparkles, CheckCircle
} from 'lucide-react';

const CreateReseniaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  usuarios = [], 
  comercios = [],
  resenia = null 
}) => {
  const isEditMode = !!resenia;

  const [formData, setFormData] = useState({
    iD_Usuario: '',
    iD_Comercio: '',
    puntuacion: 5,
    comentario: '',
    estado: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Cerrar formulario con tecla ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Cargar datos si es modo edición
  useEffect(() => {
    if (isOpen && resenia) {
      setFormData({
        iD_Usuario: resenia.iD_Usuario ? String(resenia.iD_Usuario) : '',
        iD_Comercio: resenia.iD_Comercio ? String(resenia.iD_Comercio) : '',
        puntuacion: resenia.puntuacion || 5,
        comentario: resenia.comentario || '',
        estado: resenia.estado ?? true
      });
    } else if (isOpen && !resenia) {
      setFormData({
        iD_Usuario: '',
        iD_Comercio: '',
        puntuacion: 5,
        comentario: '',
        estado: true
      });
      setErrors({});
    }
  }, [isOpen, resenia]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.iD_Usuario) {
      newErrors.iD_Usuario = 'Debes seleccionar un usuario';
    }

    if (!formData.iD_Comercio) {
      newErrors.iD_Comercio = 'Debes seleccionar un comercio';
    }

    if (!formData.comentario || formData.comentario.trim().length < 10) {
      newErrors.comentario = 'El comentario debe tener al menos 10 caracteres';
    }

    if (formData.puntuacion < 1 || formData.puntuacion > 5) {
      newErrors.puntuacion = 'La puntuación debe ser entre 1 y 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const dataToSubmit = {
        iD_Usuario: parseInt(formData.iD_Usuario),
        iD_Comercio: parseInt(formData.iD_Comercio),
        puntuacion: formData.puntuacion,
        comentario: formData.comentario.trim(),
        estado: formData.estado,
        fechaCreacion: isEditMode ? resenia.fechaCreacion : new Date().toISOString()
      };

      if (isEditMode) {
        dataToSubmit.iD_Resenia = resenia.iD_Resenia;
        // Si está en modo edición y estaba rechazada, limpiar motivo
        if (resenia.motivoRechazo) {
          dataToSubmit.motivoRechazo = null;
        }
      }

      await onSubmit(dataToSubmit);

      // Reset form
      setFormData({
        iD_Usuario: '',
        iD_Comercio: '',
        puntuacion: 5,
        comentario: '',
        estado: true
      });
      setErrors({});

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Emojis según puntuación
  const getRatingEmoji = (rating) => {
    const emojis = {
      1: '😞',
      2: '😕',
      3: '😐',
      4: '😊',
      5: '😍'
    };
    return emojis[rating] || '⭐';
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: '¡Excelente!'
    };
    return texts[rating] || '';
  };

  // Filtrar usuarios activos
  const usuariosActivos = usuarios.filter(u => u.estado);

  // Filtrar comercios activos
  const comerciosActivos = comercios.filter(c => c.estado);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-6 text-white overflow-hidden">
            {/* Decoraciones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Star className="w-7 h-7 fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Reseña' : 'Nueva Reseña'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isEditMode ? 'Modifica los datos de la reseña' : 'Crea una nueva reseña para un comercio'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Sección: Usuario y Comercio */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usuario */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-violet-500" />
                    Usuario
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.iD_Usuario}
                    onChange={(e) => handleChange('iD_Usuario', e.target.value)}
                    disabled={isEditMode}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.iD_Usuario ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuariosActivos.map((u) => (
                      <option key={u.iD_Usuario} value={u.iD_Usuario}>
                        {u.nombreUsuario}
                      </option>
                    ))}
                  </select>
                  {errors.iD_Usuario && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.iD_Usuario}
                    </p>
                  )}
                </div>

                {/* Comercio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Store className="w-4 h-4 text-violet-500" />
                    Comercio
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.iD_Comercio}
                    onChange={(e) => handleChange('iD_Comercio', e.target.value)}
                    disabled={isEditMode}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.iD_Comercio ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Seleccionar comercio...</option>
                    {comerciosActivos.map((c) => (
                      <option key={c.iD_Comercio} value={c.iD_Comercio}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.iD_Comercio && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.iD_Comercio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Puntuación */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Puntuación
              </h3>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                {/* Selector de estrellas */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleChange('puntuacion', star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-all ${
                          star <= (hoveredRating || formData.puntuacion)
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Indicador con emoji */}
                <div className="text-center">
                  <span className="text-4xl">{getRatingEmoji(hoveredRating || formData.puntuacion)}</span>
                  <p className="text-gray-700 font-semibold mt-2">
                    {getRatingText(hoveredRating || formData.puntuacion)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {hoveredRating || formData.puntuacion} de 5 estrellas
                  </p>
                </div>
              </div>
              {errors.puntuacion && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.puntuacion}
                </p>
              )}
            </div>

            {/* Sección: Comentario */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentario
              </h3>
              
              <div>
                <textarea
                  value={formData.comentario}
                  onChange={(e) => handleChange('comentario', e.target.value)}
                  placeholder="Escribe tu opinión sobre el comercio..."
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none ${
                    errors.comentario ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.comentario ? (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.comentario}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400">Mínimo 10 caracteres</span>
                  )}
                  <span className={`text-xs ${formData.comentario.length < 10 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {formData.comentario.length} caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Sección: Estado */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Estado
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.estado}
                    onChange={(e) => handleChange('estado', e.target.checked)}
                    className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-5 h-5 ${formData.estado ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <div>
                      <span className="font-medium text-gray-900">Reseña Aprobada</span>
                      <p className="text-xs text-gray-500">La reseña será visible públicamente</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditMode ? 'Actualizar' : 'Crear Reseña'}
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

export default CreateReseniaModal;
