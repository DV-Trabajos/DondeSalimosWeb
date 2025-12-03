// ReservaModal.jsx - Modal de reserva con notificaciones toast
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Calendar, Clock, Users, AlertCircle, CheckCircle, 
  Loader, Info, Sparkles, Plus, Minus, MapPin
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createReserva } from '../../services/reservasService';
import { useNotification } from '../../hooks/useNotification';

const ReservaModal = ({ isOpen, onClose, comercio, onSuccess }) => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    cantidadPersonas: 1,
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      resetForm();
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  const resetForm = () => {
    setFormData({
      fecha: '',
      hora: '',
      cantidadPersonas: 1,
    });
    setErrors({});
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10) || 0;
    return hours * 60 + minutes;
  };

  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    return `${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`;
  };

  const isNightSchedule = () => {
    const apertura = parseTimeToMinutes(comercio?.horaIngreso);
    const cierre = parseTimeToMinutes(comercio?.horaCierre);
    if (apertura === null || cierre === null) return false;
    return cierre < apertura;
  };

  const isWithinBusinessHours = (hora) => {
    if (!comercio?.horaIngreso || !comercio?.horaCierre) return true;
    
    const horaSeleccionada = parseTimeToMinutes(hora);
    const apertura = parseTimeToMinutes(comercio.horaIngreso);
    const cierre = parseTimeToMinutes(comercio.horaCierre);

    if (horaSeleccionada === null) return false;

    if (isNightSchedule()) {
      return horaSeleccionada >= apertura || horaSeleccionada <= cierre;
    } else {
      return horaSeleccionada >= apertura && horaSeleccionada <= cierre;
    }
  };

  const getHorarioInfo = () => {
    if (!comercio?.horaIngreso || !comercio?.horaCierre) {
      return null;
    }

    const apertura = formatTimeForDisplay(comercio.horaIngreso);
    const cierre = formatTimeForDisplay(comercio.horaCierre);

    if (isNightSchedule()) {
      return { apertura, cierre, isNight: true };
    }
    return { apertura, cierre, isNight: false };
  };
  
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'Seleccioná una fecha';
    }

    if (!formData.hora) {
      newErrors.hora = 'Seleccioná una hora';
    } else if (!isWithinBusinessHours(formData.hora)) {
      const horario = getHorarioInfo();
      if (horario?.isNight) {
        newErrors.hora = `Horario: ${horario.apertura} a ${horario.cierre} (día siguiente)`;
      } else if (horario) {
        newErrors.hora = `Horario: ${horario.apertura} a ${horario.cierre}`;
      }
    }

    if (!formData.cantidadPersonas || formData.cantidadPersonas < 1) {
      newErrors.cantidadPersonas = 'Mínimo 1 persona';
    }

    const capacidadMaxima = comercio?.capacidad || 0;
    if (capacidadMaxima > 0 && formData.cantidadPersonas > capacidadMaxima) {
      newErrors.cantidadPersonas = `Capacidad máxima: ${capacidadMaxima} personas`;
    }

    if (formData.fecha && formData.hora) {
      const localDateStr = `${formData.fecha}T${formData.hora}`;
      const selectedDate = new Date(localDateStr);
      const now = new Date();
      
      if (selectedDate < now) {
        newErrors.fecha = 'No podés reservar en fechas pasadas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const adjustPersonas = (delta) => {
    const capacidadMaxima = comercio?.capacidad || 50;
    const newValue = formData.cantidadPersonas + delta;
    if (newValue >= 1 && newValue <= capacidadMaxima) {
      handleChange('cantidadPersonas', newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Construir fecha en zona horaria LOCAL del usuario
      const localDateStr = `${formData.fecha}T${formData.hora}`;
      const localDate = new Date(localDateStr);
      const fechaReservaISO = localDate.toISOString();

      const reservaData = {
        iD_Usuario: user.iD_Usuario,
        iD_Comercio: comercio.iD_Comercio,
        fechaReserva: fechaReservaISO,
        tiempoTolerancia: '00:15:00',
        comensales: parseInt(formData.cantidadPersonas),
        estado: false,
        fechaCreacion: new Date().toISOString(),
        motivoRechazo: null,
      };

      await createReserva(reservaData);

      success('¡Reserva creada exitosamente! Está pendiente de aprobación.', 5000);

      handleClose();
      onSuccess && onSuccess();

    } catch (error) {
      let errorMessage = '';
      
      if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Error al crear la reserva';
      }

      let userMessage = '';
      
      if (errorMessage.toLowerCase().includes('inactiv') || 
          errorMessage.toLowerCase().includes('desactivad')) {
        userMessage = 'Tu cuenta está desactivada. Contactá al administrador para reactivarla.';
      } else if (errorMessage.toLowerCase().includes('pendiente')) {
        userMessage = 'Ya tenés una reserva pendiente de aprobación para este comercio en esta fecha.';
      } else if (errorMessage.toLowerCase().includes('aprobada')) {
        userMessage = 'Ya tenés una reserva confirmada para este comercio en esta fecha.';
      } else if (errorMessage.toLowerCase().includes('comercio') && 
                 errorMessage.toLowerCase().includes('disponible')) {
        userMessage = 'Este comercio no está disponible para reservas en este momento.';
      } else {
        userMessage = errorMessage;
      }

      showError(userMessage, 6000);

    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;
  if (!comercio) return null;

  const capacidadMaxima = comercio.capacidad || 50;
  const horarioInfo = getHorarioInfo();

  return (
    <div className="fixed inset-0 z-[10001] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 p-6 text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white/80 text-sm font-medium">Nueva reserva</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{comercio.nombre}</h2>
              {comercio.direccion && (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{comercio.direccion}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {horarioInfo && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Horario: {horarioInfo.apertura} a {horarioInfo.cierre}
                      {horarioInfo.isNight && ' (día siguiente)'}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Fecha
                  <span className="text-pink-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`
                    w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none
                    ${errors.fecha 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                    }
                  `}
                />
                {errors.fecha && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Hora
                  <span className="text-pink-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => handleChange('hora', e.target.value)}
                  className={`
                    w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none
                    ${errors.hora 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                    }
                  `}
                />
                {errors.hora && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.hora}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Cantidad de personas
                  <span className="text-pink-500">*</span>
                </label>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustPersonas(-1)}
                    disabled={formData.cantidadPersonas <= 1}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.cantidadPersonas}
                      onChange={(e) => handleChange('cantidadPersonas', parseInt(e.target.value) || 1)}
                      min="1"
                      max={capacidadMaxima}
                      className={`
                        w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-center text-lg font-semibold transition-all outline-none
                        ${errors.cantidadPersonas 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-purple-500'
                        }
                      `}
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => adjustPersonas(1)}
                    disabled={formData.cantidadPersonas >= capacidadMaxima}
                    className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Capacidad máxima: {capacidadMaxima} personas
                </p>
                
                {errors.cantidadPersonas && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cantidadPersonas}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Reservando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Reserva
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaModal;