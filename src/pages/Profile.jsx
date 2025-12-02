// Profile.jsx - Página de Perfil
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Shield, LogOut, Edit2, Save, X,
  Calendar, Star, MapPin, TrendingUp, Clock, CheckCircle,
  AlertCircle, Trash2, Store, Eye, Sparkles, ChevronRight
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

  // Estados de actividad
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
      loadUserActivity();
    }
  }, [user]);

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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Info del usuario */}
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user?.nombreUsuario}</h1>
                <div className="flex items-center gap-2 text-purple-300/80">
                  <Shield className="w-4 h-4" />
                  <span>{getRoleDescriptionById(user?.iD_RolUsuario)}</span>
                </div>
              </div>
            </div>

            {/* Botón editar */}
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:bg-white/20 transition-colors self-start md:self-auto"
              >
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            )}
          </div>

          {/* Info cards en el hero */}
          <div className="mt-8 flex flex-wrap gap-4">
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

          {/* Formulario de edición */}
          {isEditing && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-in slide-in-from-top duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-500" />
                Editar Perfil
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-purple-500" />
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={editedData.nombreUsuario}
                    onChange={(e) => setEditedData({...editedData, nombreUsuario: e.target.value})}
                    className={inputClass(false)}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-purple-500" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={editedData.telefono}
                    onChange={(e) => setEditedData({...editedData, telefono: e.target.value.replace(/\D/g, '')})}
                    placeholder="Ej: 1156789012"
                    className={inputClass(false)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 inline mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Últimas reservas y reseñas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Últimas Reservas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Últimas Reservas
                </h3>
                <button 
                  onClick={() => navigate('/mis-reservas')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900">
                              {reserva.comercio?.nombre || 'Comercio'}
                            </p>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${estado.bgColor} ${estado.textColor}`}>
                              {estado.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatFecha(reserva.fechaReserva)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {reserva.horaReserva?.substring(0, 5)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Últimas Reseñas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Últimas Reseñas
                </h3>
                <button 
                  onClick={() => navigate('/mis-resenias')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Ver todas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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
          </div>

          {/* Acciones de cuenta */}
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

              <button
                onClick={handleDeleteAccount}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-semibold border-2 border-red-200"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar Cuenta
              </button>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;