// Profile.jsx - Página de Perfil (con vista diferenciada por rol)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Shield, LogOut, Edit2, Save, X,
  Calendar, Star, MapPin, TrendingUp, Clock, CheckCircle,
  AlertCircle, Trash2, Store, Eye, Sparkles, ChevronRight,
  Users, Megaphone, LayoutDashboard, Tag
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import { getRoleDescriptionById } from '../utils/roleHelper';
import { actualizarUsuario, eliminarUsuario } from '../services/usuariosService';
import { getReservasByUsuario } from '../services/reservasService';
import { getAllResenias } from '../services/reseniasService';
import { getComerciosByUsuario } from '../services/comerciosService';

// COMPONENTE STAT CARD
const StatCard = ({ icon: Icon, label, value, subValue, color, bgColor, borderColor, iconBg }) => (
  <div className={`${bgColor} ${borderColor} border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1">{subValue}</p>
        )}
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

// COMPONENTE INFO ITEM
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
      <Icon className="w-5 h-5 text-purple-500" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  </div>
);

// COMPONENTE PRINCIPAL
const Profile = () => {
  const { user, logout, isAdmin, isBarOwner, updateUserData } = useAuth();
  const navigate = useNavigate();

  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    nombreUsuario: '',
    telefono: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Estados de actividad (solo para usuarios no-admin)
  const [reservas, setReservas] = useState([]);
  const [resenias, setResenias] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    totalReservas: 0,
    reservasAprobadas: 0,
    totalResenias: 0,
    promedioCalificaciones: 0,
    comerciosActivos: 0
  });

  useEffect(() => {
    if (user) {
      setEditedData({
        nombreUsuario: user.nombreUsuario || '',
        telefono: user.telefono || ''
      });
      
      // Solo cargar actividad si NO es admin
      if (!isAdmin) {
        loadUserActivity();
      } else {
        setLoading(false);
      }
    }
  }, [user, isAdmin]);

  const loadUserActivity = async () => {
    try {
      setLoading(true);

      // Cargar reservas del usuario
      const userReservas = await getReservasByUsuario(user.iD_Usuario);
      setReservas(userReservas.slice(0, 5));

      // Cargar reseñas del usuario
      const allResenias = await getAllResenias();
      const userResenias = allResenias.filter(r => r.iD_Usuario === user.iD_Usuario);
      setResenias(userResenias.slice(0, 5));

      // Si es dueño, cargar comercios
      let userComercios = [];
      if (isBarOwner) {
        userComercios = await getComerciosByUsuario(user.iD_Usuario);
        setComercios(userComercios);
      }

      // Calcular estadísticas
      calculateStats(userReservas, userResenias, userComercios);

    } catch (err) {
      console.error('Error cargando actividad:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reservasList, reseniasList, comerciosList = []) => {
    const comerciosActivos = comerciosList.filter(c => c.estado).length;
    
    const promedioCalif = reseniasList.length > 0
      ? reseniasList.reduce((sum, r) => sum + (r.calificacion || r.puntuacion || 0), 0) / reseniasList.length
      : 0;

    setStats({
      totalReservas: reservasList.length,
      reservasAprobadas: reservasList.filter(r => r.estado === true).length,
      totalResenias: reseniasList.length,
      promedioCalificaciones: promedioCalif,
      comerciosActivos: comerciosActivos
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      nombreUsuario: user.nombreUsuario || '',
      telefono: user.telefono || ''
    });
    setError('');
  };

  const handleSave = async () => {
    if (!editedData.nombreUsuario.trim()) {
      setError('El nombre de usuario es obligatorio');
      return;
    }

    if (editedData.telefono && editedData.telefono.length < 8) {
      setError('El teléfono debe tener al menos 8 dígitos');
      return;
    }

    if (editedData.telefono && editedData.telefono.length > 15) {
      setError('El teléfono no puede tener más de 15 caracteres');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const updatedUser = {
        ...user,
        nombreUsuario: editedData.nombreUsuario.trim(),
        telefono: editedData.telefono || null,
      };

      await actualizarUsuario(user.iD_Usuario, updatedUser);
      
      if (updateUserData) {
        updateUserData(updatedUser);
      }

      setIsEditing(false);
      alert('Perfil actualizado correctamente');

    } catch (err) {
      setError('No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción NO se puede deshacer.\n\n' +
      'Se eliminarán:\n' +
      '- Tu perfil\n' +
      '- Todas tus reservas\n' +
      '- Todas tus reseñas\n' +
      (isBarOwner ? '- Todos tus comercios y sus datos asociados\n' : '')
    );

    if (!confirmacion) return;

    const confirmacionFinal = window.confirm(
      '¿REALMENTE deseas eliminar tu cuenta? Esta es tu última oportunidad para cancelar.'
    );

    if (!confirmacionFinal) return;

    try {
      await eliminarUsuario(user.iD_Usuario);
      alert('Tu cuenta ha sido eliminada exitosamente.');
      logout();
      navigate('/');
    } catch (err) {
      alert('No se pudo eliminar la cuenta. Por favor contacta a soporte.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getReservaEstado = (reserva) => {
    if (reserva.estado === true) {
      return { text: 'Aprobada', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' };
    } else if (reserva.motivoRechazo) {
      return { text: 'Rechazada', bgColor: 'bg-red-100', textColor: 'text-red-700' };
    }
    return { text: 'Pendiente', bgColor: 'bg-amber-100', textColor: 'text-amber-700' };
  };

  // Input class helper
  const inputClass = (hasError) => `
    w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none
    ${hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
    }
  `;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Info del usuario */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {user?.nombreUsuario || 'Usuario'}
                </h1>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isAdmin 
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30' 
                      : isBarOwner 
                        ? 'bg-pink-500/20 text-pink-200 border border-pink-400/30'
                        : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                  }`}>
                    {isAdmin ? '👑 Administrador' : isBarOwner ? '🏪 Dueño de Comercio' : '👤 Usuario'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón editar */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              <Edit2 className="w-5 h-5" />
              Editar Perfil
            </button>
          </div>

          {/* Info adicional */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
              <Mail className="w-5 h-5 text-purple-300" />
              <span className="text-white">{user?.correo}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
              <Clock className="w-5 h-5 text-purple-300" />
              <span className="text-white">Miembro desde {formatFecha(user?.fechaCreacion)}</span>
            </div>
            {user?.telefono && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <Phone className="w-5 h-5 text-purple-300" />
                <span className="text-white">{user.telefono}</span>
              </div>
            )}
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
        <div className="max-w-6xl mx-auto">

          {/* VISTA PARA ADMINISTRADOR */}
          {isAdmin ? (
            <>
              {/* Stats Cards para Admin */}
              <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2">
                <StatCard
                  icon={Shield}
                  label="Rol"
                  value="Administrador"
                  subValue="Gestión completa del sistema"
                  color="text-purple-600"
                  bgColor="bg-white"
                  borderColor="border-purple-200"
                  iconBg="bg-purple-100"
                />
                <StatCard
                  icon={user?.estado ? CheckCircle : AlertCircle}
                  label="Estado de Cuenta"
                  value={user?.estado ? 'Activo' : 'Inactivo'}
                  subValue={user?.estado ? 'Cuenta funcionando correctamente' : 'Cuenta deshabilitada'}
                  color={user?.estado ? 'text-emerald-600' : 'text-red-600'}
                  bgColor="bg-white"
                  borderColor="border-gray-100"
                  iconBg={user?.estado ? 'bg-emerald-100' : 'bg-red-100'}
                />
              </div>

              {/* Accesos Rápidos de Administración */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-purple-500" />
                  Accesos Rápidos de Administración
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => navigate('/admin/usuarios')}
                    className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center group"
                  >
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Usuarios</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/comercios')}
                    className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors text-center group"
                  >
                    <Store className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Comercios</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/publicidades')}
                    className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center group"
                  >
                    <Megaphone className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Publicidades</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/resenias')}
                    className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-center group"
                  >
                    <Star className="w-8 h-8 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Reseñas</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/roles')}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center group"
                  >
                    <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Roles</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/tipos-comercio')}
                    className="p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors text-center group"
                  >
                    <Tag className="w-8 h-8 text-pink-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">Tipos Comercio</span>
                  </button>
                </div>

                {/* Botón para ir al Panel completo */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Ir al Panel de Administración
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Información de la cuenta (Admin) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Información de la Cuenta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={User} label="Nombre de Usuario" value={user?.nombreUsuario || 'Sin nombre'} />
                  <InfoItem icon={Mail} label="Correo Electrónico" value={user?.correo || 'Sin correo'} />
                  <InfoItem icon={Phone} label="Teléfono" value={user?.telefono || 'No especificado'} />
                  <InfoItem icon={Clock} label="Fecha de Registro" value={formatFecha(user?.fechaCreacion)} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* VISTA PARA USUARIO COMÚN Y DUEÑO DE COMERCIO */}
              
              {/* Stats Cards */}
              <div className={`grid gap-4 mb-8 ${isBarOwner ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
                <StatCard
                  icon={Calendar}
                  label="Reservas"
                  value={stats.totalReservas}
                  subValue={`${stats.reservasAprobadas} confirmadas`}
                  color="text-blue-600"
                  bgColor="bg-white"
                  borderColor="border-gray-100"
                  iconBg="bg-blue-100"
                />
                <StatCard
                  icon={Star}
                  label="Reseñas"
                  value={stats.totalResenias}
                  subValue={`Promedio: ${stats.promedioCalificaciones.toFixed(1)} ⭐`}
                  color="text-amber-600"
                  bgColor="bg-white"
                  borderColor="border-gray-100"
                  iconBg="bg-amber-100"
                />
                {isBarOwner ? (
                  <StatCard
                    icon={Store}
                    label="Comercios"
                    value={comercios.length}
                    subValue={`${stats.comerciosActivos} activos`}
                    color="text-emerald-600"
                    bgColor="bg-white"
                    borderColor="border-gray-100"
                    iconBg="bg-emerald-100"
                  />
                ) : (
                  <StatCard
                    icon={MapPin}
                    label="Lugares"
                    value={new Set(reservas.map(r => r.iD_Comercio)).size}
                    subValue="visitados"
                    color="text-emerald-600"
                    bgColor="bg-white"
                    borderColor="border-gray-100"
                    iconBg="bg-emerald-100"
                  />
                )}
                <StatCard
                  icon={user?.estado ? CheckCircle : AlertCircle}
                  label="Estado"
                  value={user?.estado ? 'Activo' : 'Inactivo'}
                  color={user?.estado ? 'text-emerald-600' : 'text-red-600'}
                  bgColor="bg-white"
                  borderColor="border-gray-100"
                  iconBg={user?.estado ? 'bg-emerald-100' : 'bg-red-100'}
                />
              </div>

              {/* Actividad reciente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Últimas Reservas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Últimas Reservas
                    </h3>
                    <button
                      onClick={() => navigate('/mis-reservas')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : reservas.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No tenés reservas aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservas.map((reserva) => {
                        const estado = getReservaEstado(reserva);
                        return (
                          <div
                            key={reserva.iD_Reserva}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {reserva.comercio?.nombre || 'Comercio'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatFecha(reserva.fechaReserva)}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.bgColor} ${estado.textColor}`}>
                              {estado.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Últimas Reseñas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      Últimas Reseñas
                    </h3>
                    <button
                      onClick={() => navigate('/mis-resenias')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : resenias.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No dejaste reseñas aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resenias.map((resenia) => (
                        <div
                          key={resenia.iD_Resenia}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">
                              {resenia.comercio?.nombre || 'Comercio'}
                            </p>
                            {renderStars(resenia.calificacion || resenia.puntuacion || 0)}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {resenia.comentario}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFecha(resenia.fechaCreacion)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SECCIÓN COMÚN: Acciones de cuenta */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Acciones de Cuenta
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>

              {/* Solo mostrar eliminar cuenta si NO es admin */}
              {!isAdmin && (
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-semibold border-2 border-red-200"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar Cuenta
                </button>
              )}
            </div>

            {!isAdmin && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Advertencia</p>
                    <p className="text-amber-700 text-sm mt-1">
                      La eliminación de cuenta es permanente y no se puede deshacer.
                      Se eliminarán todos tus datos incluyendo reservas, reseñas
                      {isBarOwner && ', comercios y publicidades'}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* MODAL DE EDICIÓN */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Editar Perfil</h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={editedData.nombreUsuario}
                  onChange={(e) => setEditedData({ ...editedData, nombreUsuario: e.target.value })}
                  className={inputClass(false)}
                  placeholder="Tu nombre de usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={editedData.telefono}
                  onChange={(e) => setEditedData({ ...editedData, telefono: e.target.value })}
                  className={inputClass(false)}
                  placeholder="Tu número de teléfono"
                  maxLength={15}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editedData.telefono?.length || 0}/15 caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;