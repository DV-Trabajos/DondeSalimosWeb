// Reservas.jsx - Página de Mis Reservas
import { useState, useEffect } from 'react';
import { Calendar, Filter, Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Shared/Header';
import ReservaCard from '../components/Reservations/ReservaCard';
import {
  getReservasByUser,
  deleteReserva,
  updateReserva,
  getFutureReservas,
  getPastReservas,
  filterReservasByEstado,
} from '../services/reservasService';

const Reservas = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'future', 'past'

  useEffect(() => {
    loadReservas();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [reservas, filterType]);

  const loadReservas = async () => {
    if (!user?.iD_Usuario) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getReservasByUser(user.iD_Usuario);
      
      // Ordenar por fecha descendente (más recientes primero)
      const sorted = data.sort((a, b) => 
        new Date(b.fechaReserva) - new Date(a.fechaReserva)
      );
      
      setReservas(sorted);
    } catch (err) {
      setError('Error al cargar tus reservas. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservas];

    switch (filterType) {
      case 'pending':
        filtered = filterReservasByEstado(filtered, null); // null = pendientes
        break;
      case 'approved':
        filtered = filterReservasByEstado(filtered, true);
        break;
      case 'rejected':
        filtered = filterReservasByEstado(filtered, false);
        break;
      case 'future':
        filtered = getFutureReservas(filtered);
        break;
      case 'past':
        filtered = getPastReservas(filtered);
        break;
      default:
        // 'all' - no filtrar
        break;
    }

    setFilteredReservas(filtered);
  };

  const handleCancelReserva = async (reserva) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await deleteReserva(reserva.iD_Reserva);
      await loadReservas();
      alert('Reserva cancelada exitosamente');
    } catch (err) {
      alert('Error al cancelar la reserva: ' + (err.message || 'Error desconocido'));
    }
  };

  // Calcular estadísticas
  const stats = {
    total: reservas.length,
    pending: filterReservasByEstado(reservas, null).length,
    approved: filterReservasByEstado(reservas, true).length,
    rejected: filterReservasByEstado(reservas, false).filter(r => r.motivoRechazo).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Reservas</h1>
          <p className="text-gray-600">
            Gestiona todas tus reservas en un solo lugar
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rechazadas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filtrar reservas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'approved', label: 'Confirmadas' },
              { value: 'rejected', label: 'Rechazadas' },
              { value: 'future', label: 'Próximas' },
              { value: 'past', label: 'Pasadas' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Lista de reservas */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          </div>
        ) : filteredReservas.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {reservas.length === 0 ? 'No tienes reservas aún' : 'No hay reservas con este filtro'}
            </h3>
            <p className="text-gray-500 mb-6">
              {reservas.length === 0 
                ? 'Comienza a explorar lugares y haz tu primera reserva'
                : 'Intenta con otro filtro para ver más reservas'
              }
            </p>
            {reservas.length === 0 && (
              <a
                href="/"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Explorar lugares
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {filteredReservas.map((reserva) => (
                <ReservaCard
                  key={reserva.iD_Reserva}
                  reserva={reserva}
                  onCancel={handleCancelReserva}
                  isOwner={false}
                />
              ))}
            </div>

            {/* Contador */}
            <div className="text-center text-gray-600">
              <p>
                Mostrando <strong>{filteredReservas.length}</strong> de{' '}
                <strong>{reservas.length}</strong> reservas
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reservas;