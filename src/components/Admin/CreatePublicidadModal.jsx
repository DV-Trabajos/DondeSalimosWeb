// CreatePublicidadModal.jsx - Modal para crear/editar publicidad 
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Save, Megaphone, Loader2, Store, Image as ImageIcon, 
  Clock, AlertTriangle, Upload, Sparkles, Timer, CheckCircle,
  CreditCard, FileText
} from 'lucide-react';
import { convertImageToBase64, convertBase64ToImage, formatTimeSpanToDays } from '../../utils/formatters';

const CreatePublicidadModal = ({ isOpen, onClose, onSubmit, comercios = [], publicidad = null }) => {
  const isEditMode = !!publicidad;

  // Duraciones disponibles (en días)
  const DURACIONES = [
    { value: 7, label: '1 Semana', sublabel: '7 días', timeSpan: '7:00:00', icon: '📅' },
    { value: 15, label: '15 Días', sublabel: 'Quincenal', timeSpan: '15:00:00', icon: '📆' },
    { value: 30, label: '1 Mes', sublabel: '30 días', timeSpan: '30:00:00', icon: '🗓️' }
  ];

  const [formData, setFormData] = useState({
    iD_Comercio: '',
    descripcion: '',
    tiempo: '7:00:00',
    imagen: null,
    visualizaciones: 0,
    estado: false,
    pago: false,
    motivoRechazo: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Cerrar formulario con tecla Esc
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
    if (isOpen && publicidad) {
      setFormData({
        iD_Comercio: publicidad.iD_Comercio ? String(publicidad.iD_Comercio) : '',
        descripcion: publicidad.descripcion || '',
        tiempo: publicidad.tiempo || '7:00:00',
        imagen: null,
        visualizaciones: publicidad.visualizaciones || 0,
        estado: publicidad.estado || false,
        pago: publicidad.pago || false,
        motivoRechazo: publicidad.motivoRechazo || null
      });
      
      if (publicidad.imagen) {
        setImagePreview(convertBase64ToImage(publicidad.imagen));
      }
    } else if (isOpen && !publicidad) {
      setFormData({
        iD_Comercio: '',
        descripcion: '',
        tiempo: '7:00:00',
        imagen: null,
        visualizaciones: 0,
        estado: false,
        pago: false,
        motivoRechazo: null
      });
      setImagePreview(null);
      setErrors({});
    }
  }, [isOpen, publicidad]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDuracionSelect = (duracion) => {
    setFormData(prev => ({ ...prev, tiempo: duracion.timeSpan }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imagen: 'La imagen no puede superar 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imagen: 'Solo se permiten imágenes' }));
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setFormData(prev => ({ ...prev, imagen: base64 }));
      setImagePreview(base64);
      setErrors(prev => ({ ...prev, imagen: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, imagen: 'Error al procesar la imagen' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.iD_Comercio) {
      newErrors.iD_Comercio = 'Selecciona un comercio';
    }

    if (!isEditMode && !formData.imagen && !imagePreview) {
      newErrors.imagen = 'La imagen es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        iD_Comercio: parseInt(formData.iD_Comercio),
        descripcion: formData.descripcion || 'Publicidad',
        tiempo: formData.tiempo,
        visualizaciones: formData.visualizaciones || 0,
        estado: formData.estado,
        pago: formData.pago,
        motivoRechazo: formData.estado ? null : formData.motivoRechazo,
        fechaCreacion: isEditMode ? publicidad.fechaCreacion : new Date().toISOString()
      };

      if (formData.imagen) {
        dataToSubmit.imagen = formData.imagen;
      } else if (isEditMode && publicidad.imagen) {
        dataToSubmit.imagen = publicidad.imagen;
      }

      if (isEditMode) {
        dataToSubmit.iD_Publicidad = publicidad.iD_Publicidad;
      }

      await onSubmit(dataToSubmit);

      // Reset form
      setFormData({
        iD_Comercio: '',
        descripcion: '',
        tiempo: '7:00:00',
        imagen: null,
        visualizaciones: 0,
        estado: false,
        pago: false,
        motivoRechazo: null
      });
      setImagePreview(null);
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

  // Filtrar comercios aprobados y activos
  const comerciosActivos = comercios.filter(c => c.estado === true);

  // Obtener duración actual seleccionada
  const getDuracionActual = () => {
    return DURACIONES.find(d => d.timeSpan === formData.tiempo) || DURACIONES[0];
  };

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
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente VIOLETA OSCURO */}
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
                <Megaphone className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Publicidad' : 'Nueva Publicidad'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isEditMode ? 'Modifica los datos de la publicidad' : 'Crea una nueva publicidad para un comercio'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Sección: Comercio */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Comercio
              </h3>
              
              <FormField
                icon={<Store className="w-4 h-4" />}
                label="Seleccionar Comercio"
                required
                error={errors.iD_Comercio}
              >
                <select
                  name="iD_Comercio"
                  value={formData.iD_Comercio}
                  onChange={handleChange}
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
              </FormField>
            </div>

            {/* Sección: Duración */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Duración de la Publicidad
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {DURACIONES.map((duracion) => {
                  const isSelected = formData.tiempo === duracion.timeSpan;
                  return (
                    <button
                      key={duracion.value}
                      type="button"
                      onClick={() => handleDuracionSelect(duracion)}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20' 
                          : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{duracion.icon}</div>
                      <div className={`font-bold ${isSelected ? 'text-violet-700' : 'text-gray-900'}`}>
                        {duracion.label}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-violet-600' : 'text-gray-500'}`}>
                        {duracion.sublabel}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sección: Imagen */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagen de la Publicidad
              </h3>
              
              <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                errors.imagen ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-violet-400'
              }`}>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, imagen: null }));
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">Clic para subir imagen</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.imagen && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.imagen}
                </p>
              )}
            </div>

            {/* Sección: Descripción (opcional) */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descripción (Opcional)
              </h3>
              
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la publicidad..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300 resize-none"
              />
            </div>

            {/* Sección: Estado (solo en modo edición) */}
            {isEditMode && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Estado
                </h3>
                
                <div className="space-y-3">
                  {/* Estado de aprobación */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="estado"
                        checked={formData.estado}
                        onChange={handleChange}
                        className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
                      />
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-5 h-5 ${formData.estado ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <div>
                          <span className="font-medium text-gray-900">Publicidad Aprobada</span>
                          <p className="text-xs text-gray-500">La publicidad será visible para los usuarios</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Estado de pago */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="pago"
                        checked={formData.pago}
                        onChange={handleChange}
                        className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-5 h-5 ${formData.pago ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <div>
                          <span className="font-medium text-gray-900">Pago Confirmado</span>
                          <p className="text-xs text-gray-500">Marcar si el pago fue recibido</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
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
                    {isEditMode ? 'Actualizar' : 'Crear Publicidad'}
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

// Componente auxiliar para campos de formulario
const FormField = ({ icon, label, required, error, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      <span className="text-violet-500">{icon}</span>
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

export default CreatePublicidadModal;