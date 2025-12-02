// ComercioForm.jsx - Formulario de comercio
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Save, Loader2, MapPin, Clock, Image as ImageIcon, 
  AlertCircle, Store, Mail, Phone, FileText, Users, 
  Music, ChevronDown, Sparkles, Building2, CreditCard,
  ArrowLeft, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import Header from '../Shared/Header';
import { formatCUITOnType, getErrorCUIT } from '../../utils/cuitValidator';
import { convertImageToBase64, convertBase64ToImage } from '../../utils/formatters';
import { createComercio, updateComercio } from '../../services/comerciosService';
import { getAllTiposComercio, filterActiveTipos } from '../../services/tiposComercioService';

// COMPONENTE CAMPO DE FORMULARIO
const FormField = ({ icon: Icon, label, required, error, children, hint }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      {Icon && <Icon className="w-4 h-4 text-purple-500" />}
      {label}
      {required && <span className="text-pink-500">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
    )}
    {error && (
      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

// COMPONENTE PRINCIPAL
const ComercioForm = ({ comercio, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { success, error: showError, warning } = useNotification();
  const isEditing = !!comercio;

  // Estado para tipos de comercio
  const [tiposComercio, setTiposComercio] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    nroDocumento: '',
    tipoDocumento: 'CUIT',
    iD_TipoComercio: 1,
    capacidad: '',
    mesas: '',
    generoMusical: '',
    horaIngreso: '',
    horaCierre: '',
    foto: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Cargar tipos de comercio
  useEffect(() => {
    loadTiposComercio();
  }, []);

  const loadTiposComercio = async () => {
    try {
      setLoadingTipos(true);
      const tipos = await getAllTiposComercio();
      const tiposActivos = filterActiveTipos(tipos);
      setTiposComercio(tiposActivos);
    } catch (error) {
      console.error('Error cargando tipos de comercio:', error);
      showError('Error al cargar los tipos de comercio');
    } finally {
      setLoadingTipos(false);
    }
  };

  // Cargar datos si es edición
  useEffect(() => {
    if (comercio) {
      setFormData({
        nombre: comercio.nombre || '',
        direccion: comercio.direccion || '',
        telefono: comercio.telefono || '',
        correo: comercio.correo || '',
        nroDocumento: formatCUITOnType(comercio.nroDocumento || ''),
        tipoDocumento: comercio.tipoDocumento || 'CUIT',
        iD_TipoComercio: comercio.iD_TipoComercio || 1,
        capacidad: comercio.capacidad?.toString() || '',
        mesas: comercio.mesas?.toString() || '',
        generoMusical: comercio.generoMusical || '',
        horaIngreso: formatTimeForInput(comercio.horaIngreso) || '',
        horaCierre: formatTimeForInput(comercio.horaCierre) || '',
        foto: comercio.foto || null,
      });

      if (comercio.foto) {
        setImagePreview(convertBase64ToImage(comercio.foto));
      }
    }
  }, [comercio]);

  // Formatear hora para input
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeString;
  };

  // Formatear hora para enviar
  const formatTimeForSubmit = (timeString) => {
    if (!timeString) return null;
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    }
    return timeString;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Formateo CUIT
    if (name === 'nroDocumento') {
      newValue = formatCUITOnType(value);
      const errorCUIT = getErrorCUIT(newValue);
      setErrors(prev => ({ ...prev, nroDocumento: errorCUIT }));
    }

    // Solo números para capacidad y mesas
    if ((name === 'capacidad' || name === 'mesas') && value && !/^\d+$/.test(value)) {
      return;
    }

    // Solo números para teléfono
    if (name === 'telefono') {
      newValue = value.replace(/\D/g, '').slice(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Limpiar error
    if (errors[name] && name !== 'nroDocumento') {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, foto: 'Solo se permiten archivos de imagen' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, foto: 'La imagen no debe superar 5MB' }));
      return;
    }

    try {
      const base64 = await convertImageToBase64(file);
      setFormData(prev => ({ ...prev, foto: base64 }));
      setImagePreview(base64);
      setErrors(prev => ({ ...prev, foto: null }));
    } catch (error) {
      console.error('Error procesando imagen:', error);
      setErrors(prev => ({ ...prev, foto: 'Error al procesar la imagen' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 8) {
      newErrors.telefono = 'El teléfono debe tener al menos 8 dígitos';
    }

    const cuitError = getErrorCUIT(formData.nroDocumento);
    if (cuitError) {
      newErrors.nroDocumento = cuitError;
    }

    if (formData.horaIngreso && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaIngreso)) {
      newErrors.horaIngreso = 'Formato inválido (HH:MM)';
    }

    if (formData.horaCierre && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.horaCierre)) {
      newErrors.horaCierre = 'Formato inválido (HH:MM)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor corregí los errores del formulario');
      return;
    }

    try {
      setIsLoading(true);

      let imagenParaEnviar = null;
      if (formData.foto) {
        imagenParaEnviar = formData.foto.includes('base64,') 
          ? formData.foto.split('base64,')[1] 
          : formData.foto;
      } else if (isEditing && comercio.foto) {
        imagenParaEnviar = comercio.foto;
      }

      const cuitLimpio = formData.nroDocumento.replace(/-/g, '');

      const dataToSend = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono,
        correo: formData.correo.trim(),
        nroDocumento: cuitLimpio,
        tipoDocumento: formData.tipoDocumento,
        iD_TipoComercio: parseInt(formData.iD_TipoComercio),
        capacidad: parseInt(formData.capacidad) || 0,
        mesas: parseInt(formData.mesas) || 0,
        generoMusical: formData.generoMusical.trim() || null,
        horaIngreso: formatTimeForSubmit(formData.horaIngreso),
        horaCierre: formatTimeForSubmit(formData.horaCierre),
        foto: imagenParaEnviar,
        iD_Usuario: user.iD_Usuario,
        estado: isEditing ? comercio.estado : false,
        motivoRechazo: isEditing ? null : null,
        fechaCreacion: isEditing ? comercio.fechaCreacion : new Date().toISOString(),
      };

      if (isEditing) {
        dataToSend.iD_Comercio = comercio.iD_Comercio;
        await updateComercio(comercio.iD_Comercio, dataToSend);
        success('¡Comercio actualizado exitosamente!');
      } else {
        await createComercio(dataToSend);
        success('¡Comercio creado! Está pendiente de aprobación.');
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (error) {
      console.error('Error guardando comercio:', error);
      
      let errorMessage = 'No se pudo guardar el comercio.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Input class helper
  const inputClass = (hasError) => `
    w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300'
    }
  `;

  const selectClass = (hasError) => `
    w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none appearance-none
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300'
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <Store className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-purple-300/80 text-sm font-medium">
                  {isEditing ? 'Editar comercio' : 'Nuevo comercio'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {isEditing ? comercio.nombre : 'Registrar Comercio'}
              </h1>
              <p className="text-purple-200/70 mt-1">
                {isEditing 
                  ? 'Modificá los datos de tu comercio'
                  : 'Completá los datos para registrar tu bar o restaurante'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0V60Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Mensaje de rechazo si existe */}
          {isEditing && comercio.motivoRechazo && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Comercio rechazado</h3>
                  <p className="text-red-700 text-sm mt-1">{comercio.motivoRechazo}</p>
                  <p className="text-red-600 text-xs mt-2">
                    Corregí los datos y guardá para volver a enviar a revisión.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECCIÓN: INFORMACIÓN BÁSICA */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <FormField icon={Store} label="Nombre del Comercio" required error={errors.nombre}>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ej: La Esquina Bar & Restaurant"
                      className={inputClass(errors.nombre)}
                      disabled={isLoading}
                    />
                  </FormField>
                </div>

                {/* Tipo de Comercio */}
                <FormField icon={Building2} label="Tipo de Comercio" required>
                  <div className="relative">
                    <select
                      name="iD_TipoComercio"
                      value={formData.iD_TipoComercio}
                      onChange={handleChange}
                      className={selectClass(false)}
                      disabled={isLoading || loadingTipos}
                    >
                      {loadingTipos ? (
                        <option value="">Cargando tipos...</option>
                      ) : tiposComercio.length === 0 ? (
                        <option value="">No hay tipos disponibles</option>
                      ) : (
                        tiposComercio.map((tipo) => (
                          <option key={tipo.iD_TipoComercio} value={tipo.iD_TipoComercio}>
                            {tipo.descripcion}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </FormField>

                {/* CUIT */}
                <FormField icon={CreditCard} label="CUIT" required error={errors.nroDocumento} hint="Formato: XX-XXXXXXXX-X">
                  <input
                    type="text"
                    name="nroDocumento"
                    value={formData.nroDocumento}
                    onChange={handleChange}
                    placeholder="XX-XXXXXXXX-X"
                    maxLength={13}
                    className={inputClass(errors.nroDocumento)}
                    disabled={isLoading}
                  />
                </FormField>
              </div>
            </div>

            {/* SECCIÓN: CONTACTO */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección */}
                <div className="md:col-span-2">
                  <FormField icon={MapPin} label="Dirección" required error={errors.direccion} hint="Incluí calle, número, ciudad y provincia">
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Ej: Av. Corrientes 1234, CABA, Buenos Aires"
                      className={inputClass(errors.direccion)}
                      disabled={isLoading}
                    />
                  </FormField>
                </div>

                {/* Teléfono */}
                <FormField icon={Phone} label="Teléfono" required error={errors.telefono}>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 1156789012"
                    className={inputClass(errors.telefono)}
                    disabled={isLoading}
                  />
                </FormField>

                {/* Correo */}
                <FormField icon={Mail} label="Correo electrónico" required error={errors.correo}>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="contacto@micomercio.com"
                    className={inputClass(errors.correo)}
                    disabled={isLoading}
                  />
                </FormField>
              </div>
            </div>

            {/* SECCIÓN: DETALLES DEL LOCAL */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                Detalles del Local
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Capacidad */}
                <FormField icon={Users} label="Capacidad" hint="Cantidad máxima de personas">
                  <input
                    type="text"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleChange}
                    placeholder="Ej: 100"
                    className={inputClass(false)}
                    disabled={isLoading}
                  />
                </FormField>

                {/* Mesas */}
                <FormField icon={Store} label="Número de Mesas">
                  <input
                    type="text"
                    name="mesas"
                    value={formData.mesas}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    className={inputClass(false)}
                    disabled={isLoading}
                  />
                </FormField>

                {/* Género Musical */}
                <FormField icon={Music} label="Género Musical">
                  <input
                    type="text"
                    name="generoMusical"
                    value={formData.generoMusical}
                    onChange={handleChange}
                    placeholder="Ej: Rock, Jazz, Electrónica"
                    className={inputClass(false)}
                    disabled={isLoading}
                  />
                </FormField>
              </div>
            </div>

            {/* SECCIÓN: HORARIOS */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                Horarios de Atención
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hora Apertura */}
                <FormField icon={Clock} label="Hora de Apertura" error={errors.horaIngreso} hint="Formato 24hs (ej: 18:00)">
                  <input
                    type="time"
                    name="horaIngreso"
                    value={formData.horaIngreso}
                    onChange={handleChange}
                    className={inputClass(errors.horaIngreso)}
                    disabled={isLoading}
                  />
                </FormField>

                {/* Hora Cierre */}
                <FormField icon={Clock} label="Hora de Cierre" error={errors.horaCierre} hint="Formato 24hs (ej: 03:00)">
                  <input
                    type="time"
                    name="horaCierre"
                    value={formData.horaCierre}
                    onChange={handleChange}
                    className={inputClass(errors.horaCierre)}
                    disabled={isLoading}
                  />
                </FormField>
              </div>
            </div>

            {/* SECCIÓN: IMAGEN */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-pink-600" />
                </div>
                Imagen del Comercio
              </h3>

              <div>
                <label className="cursor-pointer block">
                  <div className={`
                    border-2 border-dashed rounded-2xl p-8 text-center transition-all
                    ${imagePreview 
                      ? 'border-purple-300 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    }
                    ${errors.foto ? 'border-red-300 bg-red-50' : ''}
                  `}>
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-xl shadow-lg"
                        />
                        <p className="text-sm text-purple-600 mt-4">Click para cambiar la imagen</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">Click para subir una imagen</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (máx. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
                {errors.foto && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.foto}
                  </p>
                )}
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Guardar Cambios' : 'Crear Comercio'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComercioForm;