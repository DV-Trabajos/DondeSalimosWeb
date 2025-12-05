// CreateComercioModal.jsx - Modal para crear/editar comercio desde panel admin
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Save, MapPin, Loader2, Store, User, Mail, Phone, FileText, 
  Clock, AlertTriangle, CheckCircle, Upload, Hash, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { formatCUITOnType, getErrorCUIT } from '../../utils/cuitValidator';
import { convertImageToBase64, convertBase64ToImage } from '../../utils/formatters';
import { getAllTiposComercio, filterActiveTipos } from '../../services/tiposComercioService';

const CreateComercioModal = ({ isOpen, onClose, onSubmit, usuarios = [], comercio = null }) => {
  const isEditMode = !!comercio;
  const isRechazado = comercio && !comercio.estado && comercio.motivoRechazo;

  const [formData, setFormData] = useState({
    iD_Usuario: '',
    nombre: '',
    direccion: '',
    telefono: '',
    correo: '',
    nroDocumento: '',
    tipoDocumento: 'CUIT',
    iD_TipoComercio: '',
    capacidad: '',
    mesas: '',
    generoMusical: '',
    horaIngreso: '',
    horaCierre: '',
    imagen: null,
    estado: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tiposComercio, setTiposComercio] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

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

  // Cargar tipos de comercio
  useEffect(() => {
    if (isOpen) {
      loadTiposComercio();
    }
  }, [isOpen]);

  const loadTiposComercio = async () => {
    try {
      setLoadingTipos(true);
      const tipos = await getAllTiposComercio();
      const tiposActivos = filterActiveTipos(tipos);
      setTiposComercio(tiposActivos);
    } catch (error) {
      console.error('Error cargando tipos de comercio:', error);
      setTiposComercio([]);
    } finally {
      setLoadingTipos(false);
    }
  };

  // Cargar datos en modo edición
  useEffect(() => {
    if (isOpen && comercio) {
      const formatTime = (time) => {
        if (!time) return '';
        return time.toString().substring(0, 5);
      };
      
      setFormData({
        iD_Usuario: comercio.iD_Usuario ? String(comercio.iD_Usuario) : '',
        nombre: comercio.nombre || '',
        direccion: comercio.direccion || '',
        telefono: comercio.telefono || '',
        correo: comercio.correo || '',
        nroDocumento: formatCUITOnType(comercio.nroDocumento || ''),
        tipoDocumento: (comercio.tipoDocumento || 'CUIT').trim(),
        iD_TipoComercio: comercio.iD_TipoComercio ? String(comercio.iD_TipoComercio) : '',
        capacidad: comercio.capacidad ? String(comercio.capacidad) : '',
        mesas: comercio.mesas ? String(comercio.mesas) : '',
        generoMusical: comercio.generoMusical || '',
        horaIngreso: formatTime(comercio.horaIngreso),
        horaCierre: formatTime(comercio.horaCierre),
        imagen: null,
        estado: comercio.estado || false,
      });
      
      // Usar convertBase64ToImage para generar URL válida
      if (comercio.foto) {
        setImagePreview(convertBase64ToImage(comercio.foto));
      }
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, comercio]);

  const resetForm = () => {
    setFormData({
      iD_Usuario: '',
      nombre: '',
      direccion: '',
      telefono: '',
      correo: '',
      nroDocumento: '',
      tipoDocumento: 'CUIT',
      iD_TipoComercio: '',
      capacidad: '',
      mesas: '',
      generoMusical: '',
      horaIngreso: '',
      horaCierre: '',
      imagen: null,
      estado: false,
    });
    setErrors({});
    setImagePreview(null);
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.iD_Usuario) newErrors.iD_Usuario = 'Selecciona un propietario';
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    const cuitError = getErrorCUIT(formData.nroDocumento);
    if (cuitError) newErrors.nroDocumento = cuitError;

    if (!isEditMode && !formData.imagen && !imagePreview) {
      newErrors.imagen = 'La imagen es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'nroDocumento') {
      setFormData(prev => ({ ...prev, [name]: formatCUITOnType(value) }));
    } else if (name === 'telefono') {
      const onlyNumbers = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNumbers }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      // Usar convertBase64ToImage para generar URL válida para el preview
      setImagePreview(convertBase64ToImage(base64));
      setErrors(prev => ({ ...prev, imagen: '' }));
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      setErrors(prev => ({ ...prev, imagen: 'Error al procesar la imagen' }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formatTimeToTimeSpan = (time) => {
        if (!time) return null;
        return `${time}:00`;
      };

      const cleanCUIT = formData.nroDocumento.replace(/-/g, '');

      const dataToSubmit = {
        iD_Usuario: parseInt(formData.iD_Usuario),
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono || null,
        correo: formData.correo.trim(),
        nroDocumento: cleanCUIT,
        tipoDocumento: formData.tipoDocumento,
        iD_TipoComercio: formData.iD_TipoComercio ? parseInt(formData.iD_TipoComercio) : 1,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : 0,
        mesas: formData.mesas ? parseInt(formData.mesas) : 0,
        generoMusical: formData.generoMusical || null,
        horaIngreso: formatTimeToTimeSpan(formData.horaIngreso),
        horaCierre: formatTimeToTimeSpan(formData.horaCierre),
        foto: formData.imagen || (isEditMode ? comercio.foto : null),
        estado: isRechazado ? false : formData.estado,
        motivoRechazo: isRechazado ? null : (comercio?.motivoRechazo || null),
        fechaCreacion: isEditMode ? comercio.fechaCreacion : new Date().toISOString(),
      };

      if (isEditMode) {
        dataToSubmit.iD_Comercio = comercio.iD_Comercio;
        dataToSubmit.latitud = comercio.latitud;
        dataToSubmit.longitud = comercio.longitud;
      }

      await onSubmit(dataToSubmit);
      handleClose();
    } catch (error) {
      console.error('Error al guardar comercio:', error);
      setErrors({ submit: 'Error al guardar el comercio. Intenta nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Filtrar usuarios con rol de comercio (rol 3) y activos
  const usuariosComercio = usuarios.filter(u => u.iD_RolUsuario === 3 && u.estado);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Editar Comercio' : 'Nuevo Comercio'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {isEditMode ? 'Modifica los datos del comercio' : 'Completa los datos para registrar un nuevo comercio'}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Alerta si es rechazado */}
            {isRechazado && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Comercio rechazado</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      <strong>Motivo:</strong> {comercio.motivoRechazo}
                    </p>
                    <p className="text-sm text-amber-600 mt-2">
                      Al guardar, el comercio volverá a estado "Pendiente" para revisión.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error general */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* INFORMACIÓN BÁSICA */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={<User />} label="Propietario" required error={errors.iD_Usuario}>
                  <select
                    name="iD_Usuario"
                    value={formData.iD_Usuario}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.iD_Usuario ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar propietario...</option>
                    {usuariosComercio.map(user => (
                      <option key={user.iD_Usuario} value={String(user.iD_Usuario)}>
                        {user.nombreUsuario} - {user.correo}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField icon={<Store />} label="Nombre del Comercio" required error={errors.nombre}>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: La Farola Bar"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </FormField>

                <FormField icon={<Store />} label="Tipo de Comercio" required>
                  <select
                    name="iD_TipoComercio"
                    value={formData.iD_TipoComercio}
                    onChange={handleChange}
                    disabled={loadingTipos}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300 ${loadingTipos ? 'bg-gray-100' : ''}`}
                  >
                    {loadingTipos ? (
                      <option value="">Cargando tipos...</option>
                    ) : tiposComercio.length === 0 ? (
                      <option value="">No hay tipos disponibles</option>
                    ) : (
                      <>
                        <option value="">Seleccionar tipo...</option>
                        {tiposComercio.map((tipo) => (
                          <option 
                            key={tipo.iD_TipoComercio || tipo.ID_TipoComercio} 
                            value={tipo.iD_TipoComercio || tipo.ID_TipoComercio}
                          >
                            {tipo.descripcion || tipo.Descripcion}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </FormField>

                <FormField icon={<MapPin />} label="Dirección" required error={errors.direccion}>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, ciudad"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.direccion ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            {/* CONTACTO */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={<Phone />} label="Teléfono">
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 1156789012"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>

                <FormField icon={<Mail />} label="Correo Electrónico" required error={errors.correo}>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="comercio@email.com"
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            {/* INFORMACIÓN FISCAL */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Información Fiscal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={<FileText />} label="Tipo de Documento" required>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  >
                    <option value="CUIT">CUIT</option>
                    <option value="CUIL">CUIL</option>
                    <option value="DNI">DNI</option>
                  </select>
                </FormField>

                {/* Tipo de documento seleccionado */}
                <FormField icon={<Hash />} label={`Número de ${formData.tipoDocumento}`} required error={errors.nroDocumento}>
                  <input
                    type="text"
                    name="nroDocumento"
                    value={formData.nroDocumento}
                    onChange={handleChange}
                    placeholder="XX-XXXXXXXX-X"
                    maxLength={13}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.nroDocumento ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </FormField>
              </div>
            </div>

            {/* DETALLES DEL LOCAL */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Detalles del Local
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField icon={<User />} label="Capacidad (personas)">
                  <input
                    type="number"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleChange}
                    placeholder="Ej: 100"
                    min="0"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>

                <FormField icon={<Store />} label="Número de Mesas">
                  <input
                    type="number"
                    name="mesas"
                    value={formData.mesas}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    min="0"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>

                <FormField icon={<Sparkles />} label="Género Musical">
                  <input
                    type="text"
                    name="generoMusical"
                    value={formData.generoMusical}
                    onChange={handleChange}
                    placeholder="Ej: Rock, Electrónica"
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>
              </div>
            </div>

            {/* HORARIOS DE ATENCIÓN */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horarios de Atención
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={<Clock />} label="Hora de Apertura">
                  <input
                    type="time"
                    name="horaIngreso"
                    value={formData.horaIngreso}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>

                <FormField icon={<Clock />} label="Hora de Cierre">
                  <input
                    type="time"
                    name="horaCierre"
                    value={formData.horaCierre}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all border-gray-200 hover:border-gray-300"
                  />
                </FormField>
              </div>
            </div>

            {/* IMAGEN */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagen del Comercio
              </h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-violet-400 transition-colors">
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
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

            {/* ESTADO (solo en edición y no rechazado) */}
            {isEditMode && !isRechazado && (
              <div className="mb-6">
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
                        <span className="font-medium text-gray-900">Comercio Aprobado</span>
                        <p className="text-xs text-gray-500">El comercio será visible para los usuarios</p>
                      </div>
                    </div>
                  </label>
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
                    {isEditMode ? 'Actualizar' : 'Crear Comercio'}
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

// Componente auxiliar para campos
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

export default CreateComercioModal;