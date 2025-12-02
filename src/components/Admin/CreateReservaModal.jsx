// CreateReservaModal.jsx - Modal para crear/editar reserva
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Calendar, Users, Clock, User, Store, Save, Loader2,
  AlertTriangle, Sparkles, CheckCircle, CalendarClock, Timer,
  Plus, Minus
} from 'lucide-react';

const CreateReservaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  reserva = null, 
  usuarios = [], 
  comercios = [] 
}) => {
  const isEditMode = !!reserva;
  
  const [formData, setFormData] = useState({
    iD_Usuario: '',
    iD_Comercio: '',
    fecha: '',
    hora: '',
    comensales: 1,
    tiempoTolerancia: '00:15:00',
    estado: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opciones de tiempo de tolerancia
  const TOLERANCIAS = [
    { value: '00:15:00', label: '15 min', icon: '⏱️' },
    { value: '00:30:00', label: '30 min', icon: '🕐' },
    { value: '01:00:00', label: '1 hora', icon: '🕐' },
    { value: '02:00:00', label: '2 horas', icon: '🕑' }
  ];

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
    if (isOpen) {
      if (isEditMode && reserva) {
        const fechaReserva = new Date(reserva.fechaReserva);
        const fecha = fechaReserva.toISOString().split('T')[0];
        const hora = fechaReserva.toTimeString().slice(0, 5);

        setFormData({
          iD_Usuario: reserva.iD_Usuario ? String(reserva.iD_Usuario) : '',
          iD_Comercio: reserva.iD_Comercio ? String(reserva.iD_Comercio) : '',
          fecha: fecha,
          hora: hora,
          comensales: reserva.comensales || 1,
          tiempoTolerancia: reserva.tiempoTolerancia || '00:15:00',
          estado: reserva.estado ?? true
        });
      } else {
        setFormData({
          iD_Usuario: '',
          iD_Comercio: '',
          fecha: '',
          hora: '',
          comensales: 1,
          tiempoTolerancia: '00:15:00',
          estado: true
        });
        setErrors({});
      }
    }
  }, [isOpen, reserva, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.iD_Usuario) {
      newErrors.iD_Usuario = 'Debes seleccionar un usuario';
    }
    if (!formData.iD_Comercio) {
      newErrors.iD_Comercio = 'Debes seleccionar un comercio';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.hora) {
      newErrors.hora = 'La hora es requerida';
    }
    if (formData.comensales < 1) {
      newErrors.comensales = 'Mínimo 1 comensal';
    }
    if (formData.comensales > 50) {
      newErrors.comensales = 'Máximo 50 comensales';
    }

    // Validar que no sea fecha/hora pasada (solo en crear)
    if (!isEditMode && formData.fecha && formData.hora) {
      const fechaHoraSeleccionada = new Date(`${formData.fecha}T${formData.hora}`);
      const ahora = new Date();
      if (fechaHoraSeleccionada < ahora) {
        newErrors.fecha = 'No puedes seleccionar una fecha/hora pasada';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Combinar fecha y hora
      const fechaReserva = new Date(`${formData.fecha}T${formData.hora}`);

      const dataToSubmit = {
        iD_Usuario: parseInt(formData.iD_Usuario),
        iD_Comercio: parseInt(formData.iD_Comercio),
        fechaReserva: fechaReserva.toISOString(),
        comensales: formData.comensales,
        tiempoTolerancia: formData.tiempoTolerancia,
        estado: formData.estado,
        fechaCreacion: isEditMode ? reserva.fechaCreacion : new Date().toISOString()
      };

      if (isEditMode) {
        dataToSubmit.iD_Reserva = reserva.iD_Reserva;
        // Si estaba rechazada, limpiar motivo
        if (reserva.motivoRechazo) {
          dataToSubmit.motivoRechazo = null;
        }
      }

      await onSubmit(dataToSubmit);
      handleClose();

    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error al guardar la reserva. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        iD_Usuario: '',
        iD_Comercio: '',
        fecha: '',
        hora: '',
        comensales: 1,
        tiempoTolerancia: '00:15:00',
        estado: true
      });
      setErrors({});
      onClose();
    }
  };

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtener fecha máxima (60 días)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  // Ajustar comensales
  const adjustComensales = (delta) => {
    const newValue = formData.comensales + delta;
    if (newValue >= 1 && newValue <= 50) {
      handleChange('comensales', newValue);
    }
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Reserva' : 'Nueva Reserva'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isEditMode ? 'Modifica los datos de la reserva' : 'Crea una nueva reserva para un comercio'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Error general */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Sección: Usuario y Comercio */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Usuario y Comercio
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

            {/* Sección: Fecha y Hora */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Fecha y Hora de la Reserva
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Fecha
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange('fecha', e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.fecha ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.fecha && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.fecha}
                    </p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 text-violet-500" />
                    Hora
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleChange('hora', e.target.value)}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.hora ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  {errors.hora && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.hora}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Cantidad de Comensales */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Cantidad de Comensales
              </h3>
              
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => adjustComensales(-1)}
                    disabled={formData.comensales <= 1}
                    className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-violet-300 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    <Minus className="w-6 h-6 text-gray-600" />
                  </button>
                  
                  <div className="text-center">
                    <input
                      type="number"
                      value={formData.comensales}
                      onChange={(e) => handleChange('comensales', parseInt(e.target.value) || 1)}
                      min={1}
                      max={50}
                      className="w-20 text-center text-4xl font-bold text-gray-900 border-0 bg-transparent focus:outline-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.comensales === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => adjustComensales(1)}
                    disabled={formData.comensales >= 50}
                    className="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-violet-300 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                {errors.comensales && (
                  <p className="text-red-600 text-sm mt-3 text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.comensales}
                  </p>
                )}
              </div>
            </div>

            {/* Sección: Tiempo de Tolerancia */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Tiempo de Tolerancia
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                {TOLERANCIAS.map((tolerancia) => {
                  const isSelected = formData.tiempoTolerancia === tolerancia.value;
                  return (
                    <button
                      key={tolerancia.value}
                      type="button"
                      onClick={() => handleChange('tiempoTolerancia', tolerancia.value)}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected 
                          ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/20' 
                          : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{tolerancia.icon}</div>
                      <div className={`font-bold text-sm ${isSelected ? 'text-violet-700' : 'text-gray-900'}`}>
                        {tolerancia.label}
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
                      <span className="font-medium text-gray-900">Reserva Aprobada</span>
                      <p className="text-xs text-gray-500">La reserva será confirmada automáticamente</p>
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
                    {isEditMode ? 'Actualizar' : 'Crear Reserva'}
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

export default CreateReservaModal;