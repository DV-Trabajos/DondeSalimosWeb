// MisPublicidades.jsx - Gestión de publicidades
import { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Eye, Clock, CheckCircle, XCircle, 
  AlertCircle, Trash2, Calendar, CreditCard, DollarSign,
  Sparkles, TrendingUp, ImagePlus, Store, ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import PagoPublicidadModal from '../components/Publicidad/PagoPublicidadModal';
import DeletePublicidadModal from '../components/Publicidad/DeletePublicidadModal';
import { useNotification } from '../hooks/useNotification';
import { getComerciosByUsuario } from '../services/comerciosService';
import { 
  getPublicidadesByUsuario,
  createPublicidad,
  deletePublicidad,
  formatTimeSpanToDays,
} from '../services/publicidadesService';
import { convertBase64ToImage } from '../utils/formatters';
import { calcularPrecioPublicidad } from '../services/pagosService';

// CONSTANTES DE PRECIOS
const PRECIOS = {
  7: 45000,
  15: 75000,
  30: 140000,
};

// COMPONENTE PRINCIPAL
const MisPublicidades = () => {
  const { user } = useAuth();
  const { success, error: showError, warning } = useNotification();
  
  // Estados principales
  const [comercios, setComercios] = useState([]);
  const [publicidades, setPublicidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Estados del formulario
  const [selectedComercio, setSelectedComercio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('7');
  const [imagen, setImagen] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Estados de modales
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [publicidadToPay, setPublicidadToPay] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publicidadToDelete, setPublicidadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar datos
  useEffect(() => {
    if (user?.iD_Usuario) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const comerciosData = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(comerciosData || []);
      
      const comercioIds = (comerciosData || []).map(c => c.iD_Comercio);
      const publicidadesData = await getPublicidadesByUsuario(user.iD_Usuario, comercioIds);
      
      setPublicidades(publicidadesData || []);
      
    } catch (err) {
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    total: publicidades.length,
    activas: publicidades.filter(p => p.estado && p.pago && !isExpired(p)).length,
    pendientes: publicidades.filter(p => !p.estado && !p.motivoRechazo).length,
    sinPagar: publicidades.filter(p => p.estado && !p.pago).length,
    rechazadas: publicidades.filter(p => !p.estado && p.motivoRechazo).length,
    totalVisualizaciones: publicidades.reduce((sum, p) => sum + (p.visualizaciones || 0), 0),
  };

  function isExpired(pub) {
    const fechaCreacion = new Date(pub.fechaCreacion || pub.FechaCreacion);
    const dias = formatTimeSpanToDays(pub.tiempo || pub.Tiempo);
    const fechaExpiracion = new Date(fechaCreacion);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + dias);
    return fechaExpiracion <= new Date();
  }

  function getDiasRestantes(pub) {
    const fechaCreacion = new Date(pub.fechaCreacion || pub.FechaCreacion);
    const dias = formatTimeSpanToDays(pub.tiempo || pub.Tiempo);
    const fechaExpiracion = new Date(fechaCreacion);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + dias);
    const diffTime = fechaExpiracion - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const getNombreComercio = (pub) => {
    if (pub?.comercio?.nombre) return pub.comercio.nombre;
    const comercio = comercios.find(c => c.iD_Comercio === pub?.iD_Comercio);
    return comercio?.nombre || 'Comercio';
  };

  const getEstadoInfo = (pub) => {
    if (!pub.estado && pub.motivoRechazo) {
      return { 
        estado: 'rechazada', 
        texto: 'Rechazada', 
        bgColor: 'bg-red-100', 
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }
    if (!pub.estado) {
      return { 
        estado: 'pendiente', 
        texto: 'Pendiente aprobación', 
        bgColor: 'bg-amber-100', 
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200'
      };
    }
    if (!pub.pago) {
      return { 
        estado: 'sinPagar', 
        texto: 'Sin pagar', 
        bgColor: 'bg-orange-100', 
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      };
    }
    const diasRestantes = getDiasRestantes(pub);
    if (diasRestantes <= 0) {
      return { 
        estado: 'expirada', 
        texto: 'Expirada', 
        bgColor: 'bg-gray-100', 
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200'
      };
    }
    return { 
      estado: 'activa', 
      texto: `Activa (${diasRestantes}d)`, 
      bgColor: 'bg-emerald-100', 
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    };
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('La imagen no puede superar los 5MB');
      return;
    }

    try {
      const compressedBase64 = await compressImage(file, 800, 0.7);
      setImagen(compressedBase64);
      setImagePreview(compressedBase64);
    } catch (err) {
      showError('Error al procesar la imagen');
    }
  };

  const compressImage = (file, maxWidth, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64.split(',')[1]);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedComercio) {
      warning('Selecciona un comercio');
      return;
    }
    if (!descripcion.trim()) {
      warning('Ingresa una descripción');
      return;
    }
    if (!imagen) {
      warning('Sube una imagen para la publicidad');
      return;
    }

    setCreating(true);
    
    try {      
      const publicidadData = {
        iD_Comercio: parseInt(selectedComercio),
        descripcion: descripcion.trim(),
        tiempo: parseInt(duracion),
        imagen: imagen,
        visualizaciones: 0,
        estado: false,
        pago: false,
        fechaCreacion: new Date().toISOString(),
      };

      await createPublicidad(publicidadData);
      success('¡Publicidad creada! Está pendiente de aprobación.');
      
      setSelectedComercio('');
      setDescripcion('');
      setDuracion('7');
      setImagen(null);
      setImagePreview(null);
      setShowForm(false);
      
      await loadData();
      
    } catch (err) {
      showError('Error al crear la publicidad');
    } finally {
      setCreating(false);
    }
  };

  const handlePagar = (pub) => {
    setPublicidadToPay(pub);
    setShowPagoModal(true);
  };

  const handleDelete = (pub) => {
    setPublicidadToDelete(pub);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!publicidadToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePublicidad(publicidadToDelete.iD_Publicidad);
      success('Publicidad eliminada correctamente');
      setShowDeleteModal(false);
      setPublicidadToDelete(null);
      await loadData();
    } catch (err) {
      showError('Error al eliminar la publicidad');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mini Hero - Se muestra siempre, incluso en loading */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <Megaphone className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-purple-300/80 text-sm font-medium">Panel de gestión</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Publicidades</h1>
              <p className="text-purple-200/70">Gestioná las publicidades de tus comercios</p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-purple-500/25 self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Nueva Publicidad
            </button>
          </div>

          {/* Mini Stats en el Hero */}
          <div className="mt-8 inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{stats.total}</span>
              <span className="text-purple-300/70 text-sm">publicidades</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">{stats.activas}</span>
              <span className="text-purple-300/70 text-sm">activas</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold">{stats.pendientes}</span>
              <span className="text-purple-300/70 text-sm">pendientes</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{stats.totalVisualizaciones}</span>
              <span className="text-purple-300/70 text-sm">vistas</span>
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
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Cargando publicidades...</p>
            </div>
          ) : (
            <>
              {/* Formulario de Nueva Publicidad */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Crear Nueva Publicidad
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selección de comercio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Store className="w-4 h-4 inline mr-1" />
                        Comercio *
                      </label>
                      <select
                        value={selectedComercio}
                        onChange={(e) => setSelectedComercio(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                      >
                        <option value="">Seleccionar comercio</option>
                        {comercios.map(c => (
                          <option key={c.iD_Comercio} value={c.iD_Comercio}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                        placeholder="Describe tu publicidad (promociones, eventos especiales...)"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
                      />
                    </div>

                    {/* Duración */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Duración *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(PRECIOS).map(([dias, precio]) => (
                          <label
                            key={dias}
                            className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              duracion === dias 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="duracion"
                              value={dias}
                              checked={duracion === dias}
                              onChange={(e) => setDuracion(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-2xl font-bold text-gray-900">{dias}</span>
                            <span className="text-sm text-gray-500">días</span>
                            <span className="mt-2 text-sm font-semibold text-purple-600">
                              {formatPrecio(precio)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Imagen */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <ImagePlus className="w-4 h-4 inline mr-1" />
                        Imagen *
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={`data:image/jpeg;base64,${imagePreview}`}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagen(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer">
                            <ImagePlus className="w-12 h-12 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 font-medium">
                              Clic para subir imagen
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                              PNG, JPG hasta 5MB
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setSelectedComercio('');
                          setDescripcion('');
                          setDuracion('7');
                          setImagen(null);
                          setImagePreview(null);
                        }}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition disabled:opacity-50"
                      >
                        {creating ? 'Creando...' : 'Crear Publicidad'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de publicidades */}
              {publicidades.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tenés publicidades</h3>
                  <p className="text-gray-500 mb-6">Creá tu primera publicidad para promocionar tu comercio</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Publicidad
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicidades.map(pub => {
                    const estadoInfo = getEstadoInfo(pub);
                    const diasDuracion = formatTimeSpanToDays(pub.tiempo || pub.Tiempo);
                    const precio = calcularPrecioPublicidad(diasDuracion);
                    
                    return (
                      <div 
                        key={pub.iD_Publicidad} 
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                      >
                        {/* Imagen */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          {pub.imagen ? (
                            <img 
                              src={convertBase64ToImage(pub.imagen)} 
                              alt="Publicidad"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <Megaphone className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          
                          {/* Badge de estado */}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${estadoInfo.bgColor} ${estadoInfo.textColor} border ${estadoInfo.borderColor}`}>
                              {estadoInfo.texto}
                            </span>
                          </div>

                          {/* Logo comercio */}
                          <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                            <Store className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        
                        {/* Contenido */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">{getNombreComercio(pub)}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {pub.descripcion || 'Sin descripción'}
                          </p>

                          {/* Información */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{pub.visualizaciones || 0} vistas</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{diasDuracion} días</span>
                            </div>
                          </div>

                          {/* Motivo de rechazo si existe */}
                          {pub.motivoRechazo && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                              <p className="text-xs text-red-600 font-medium">Motivo de rechazo:</p>
                              <p className="text-sm text-red-700">{pub.motivoRechazo}</p>
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="space-y-2">
                            {/* Botón de pagar si aplica */}
                            {pub.estado && !pub.pago && (
                              <button
                                onClick={() => handlePagar(pub)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                              >
                                <CreditCard className="w-4 h-4" />
                                Pagar para Activar
                              </button>
                            )}
                            
                            {/* Permitir eliminar: pendientes, rechazadas O sin pagar */}
                            {(estadoInfo.estado === 'rechazada' || estadoInfo.estado === 'pendiente' || estadoInfo.estado === 'sinPagar') && (
                              <button
                                onClick={() => handleDelete(pub)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      <PagoPublicidadModal
        isOpen={showPagoModal}
        onClose={() => {
          setShowPagoModal(false);
          setPublicidadToPay(null);
        }}
        publicidad={publicidadToPay}
        comercioNombre={publicidadToPay ? getNombreComercio(publicidadToPay) : ''}
      />

      <DeletePublicidadModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPublicidadToDelete(null);
        }}
        onConfirm={confirmDelete}
        publicidad={publicidadToDelete}
        nombreComercio={publicidadToDelete ? getNombreComercio(publicidadToDelete) : ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MisPublicidades;