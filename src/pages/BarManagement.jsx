// BarManagement.jsx - Gestión de comercios
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ComercioCard from '../components/BarManagement/ComercioCard';
import ComercioForm from '../components/BarManagement/ComercioForm';
import { getComerciosByUsuario } from '../services/comerciosService';
import { 
  Plus, Store, Loader, CheckCircle, Clock, XCircle, 
  Sparkles, TrendingUp, Users, Calendar
} from 'lucide-react';

// COMPONENTE STAT CARD
const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor, iconBg }) => (
  <div className={`${bgColor} ${borderColor} border-2 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 group`}>
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
      </div>
    </div>
  </div>
);

// COMPONENTE PRINCIPAL
const BarManagement = () => {
  const [comercios, setComercios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingComercio, setEditingComercio] = useState(null);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.iD_Usuario) {
      loadComercios();
    }
  }, [user]);

  const loadComercios = async () => {
    try {
      setIsLoading(true);
      const data = await getComerciosByUsuario(user.iD_Usuario);
      setComercios(data || []);
    } catch (error) {
      console.error('Error cargando comercios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = comercios.length;
    const visibles = comercios.filter(c => c.estado === true).length;
    const pendientes = comercios.filter(c => c.estado === false && !c.motivoRechazo).length;
    const rechazados = comercios.filter(c => c.estado === false && c.motivoRechazo).length;
    
    return { total, visibles, pendientes, rechazados };
  }, [comercios]);

  const handleEdit = (comercio) => {
    setEditingComercio(comercio);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingComercio(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingComercio(null);
    loadComercios();
  };

  const handleNew = () => {
    setEditingComercio(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ComercioForm
        comercio={editingComercio}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mini Hero */}
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
        {/* Decoraciones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <Store className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-purple-300/80 text-sm font-medium">Panel de gestión</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Mis Comercios</h1>
              <p className="text-purple-200/70">Gestioná tus bares y restaurantes</p>
            </div>
            
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all font-semibold shadow-lg shadow-purple-500/25 self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Nuevo Comercio
            </button>
          </div>

          {/* Mini Stats en el Hero */}
          <div className="mt-8 inline-flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-300" />
              <span className="text-white font-semibold">{stats.total}</span>
              <span className="text-purple-300/70 text-sm">comercios</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">{stats.visibles}</span>
              <span className="text-purple-300/70 text-sm">visibles</span>
            </div>
            {stats.pendientes > 0 && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-semibold">{stats.pendientes}</span>
                  <span className="text-purple-300/70 text-sm">pendientes</span>
                </div>
              </>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={Store} 
              label="Total" 
              value={stats.total} 
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
              iconBg="bg-blue-100"
            />
            <StatCard 
              icon={CheckCircle} 
              label="Visibles" 
              value={stats.visibles} 
              color="text-emerald-600"
              bgColor="bg-emerald-50"
              borderColor="border-emerald-100"
              iconBg="bg-emerald-100"
            />
            <StatCard 
              icon={Clock} 
              label="Pendientes" 
              value={stats.pendientes} 
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
              iconBg="bg-amber-100"
            />
            <StatCard 
              icon={XCircle} 
              label="Rechazados" 
              value={stats.rechazados} 
              color="text-red-500"
              bgColor="bg-red-50"
              borderColor="border-red-100"
              iconBg="bg-red-100"
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando comercios...</p>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!isLoading && comercios.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No tenés comercios registrados
              </h3>
              <p className="text-gray-500 mb-6">
                Comenzá agregando tu primer bar o restaurante
              </p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
              >
                <Plus className="w-5 h-5" />
                Crear Mi Primer Comercio
              </button>
            </div>
          )}

          {/* Grid de comercios */}
          {!isLoading && comercios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comercios.map((comercio) => (
                <ComercioCard
                  key={comercio.iD_Comercio}
                  comercio={comercio}
                  onEdit={() => handleEdit(comercio)}
                  onReload={loadComercios}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarManagement;