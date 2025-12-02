// src/pages/ReservasComercio.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getAllReservas, updateReserva } from '../services/reservasService';
import { getAllComercios } from '../services/comerciosService';
import { useAuth } from '../hooks/useAuth';

const ReservasComercio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [miComercio, setMiComercio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    confirmadas: 0,
    canceladas: 0,
    hoy: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const comerciosData = await getAllComercios();
      const miComercioData = comerciosData.find(c => c.iD_Usuario === user.iD_Usuario);
      
      if (!miComercioData) {
        setLoading(false);
        return;
      }

      setMiComercio(miComercioData);

      const todasReservas = await getAllReservas();
      const reservasMiComercio = todasReservas.filter(
        r => r.iD_Comercio === miComercioData.iD_Comercio
      );

      reservasMiComercio.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));

      setReservas(reservasMiComercio);
      calcularEstadisticas(reservasMiComercio);
      
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (reservasList) => {
    const hoy = new Date().toDateString();
    
    const stats = {
      total: reservasList.length,
      pendientes: reservasList.filter(r => !r.aprobada && r.estado).length,
      confirmadas: reservasList.filter(r => r.aprobada && r.estado).length,
      canceladas: reservasList.filter(r => !r.estado).length,
      hoy: reservasList.filter(r => new Date(r.fechaReserva).toDateString() === hoy).length
    };
    
    setEstadisticas(stats);
  };

  const handleCambiarEstado = async (idReserva, aprobar) => {
    try {
      const reserva = reservas.find(r => r.iD_Reserva === idReserva);
      const reservaActualizada = {
        ...reserva,
        aprobada: aprobar,
        estado: aprobar ? true : reserva.estado
      };

      await updateReserva(idReserva, reservaActualizada);
      
      const nuevasReservas = reservas.map(r => 
        r.iD_Reserva === idReserva ? reservaActualizada : r
      );
      
      setReservas(nuevasReservas);
      calcularEstadisticas(nuevasReservas);
      
    } catch (error) {
      alert('Error al actualizar el estado de la reserva');
    }
  };

  const reservasFiltradas = reservas.filter(reserva => {
    if (filtroEstado === 'pendientes' && (reserva.aprobada || !reserva.estado)) return false;
    if (filtroEstado === 'confirmadas' && (!reserva.aprobada || !reserva.estado)) return false;
    if (filtroEstado === 'canceladas' && reserva.estado) return false;

    if (busqueda && !reserva.usuario?.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getEstadoBadge = (reserva) => {
    if (!reserva.estado) {
      return { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, texto: 'Cancelada' };
    }
    if (reserva.aprobada) {
      return { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, texto: 'Confirmada' };
    }
    return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle, texto: 'Pendiente' };
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (!miComercio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes un comercio asociado</h2>
          <p className="text-gray-600 mb-6">Necesitas tener un comercio registrado para ver las reservas.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/bar-management')}
            className="text-white/90 hover:text-white mb-4"
          >
            ← Volver
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reservas Recibidas</h1>
              <p className="text-purple-100 mt-1">{miComercio.nombre}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-500">
            <p className="text-3xl font-bold text-purple-600">{estadisticas.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-500">
            <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500">
            <p className="text-3xl font-bold text-green-600">{estadisticas.confirmadas}</p>
            <p className="text-sm text-gray-600">Confirmadas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
            <p className="text-3xl font-bold text-red-600">{estadisticas.canceladas}</p>
            <p className="text-sm text-gray-600">Canceladas</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
            <p className="text-3xl font-bold text-blue-600">{estadisticas.hoy}</p>
            <p className="text-sm text-gray-600">Hoy</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="todas">Todas</option>
            <option value="pendientes">Pendientes</option>
            <option value="confirmadas">Confirmadas</option>
            <option value="canceladas">Canceladas</option>
          </select>
        </div>

        {reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay reservas</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {reservasFiltradas.map((reserva) => {
              const badge = getEstadoBadge(reserva);
              const Icon = badge.icon;
              
              return (
                <div key={reserva.iD_Reserva} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {reserva.usuario?.nombreUsuario || 'Cliente'}
                      </h3>
                      <p className="text-sm text-gray-600">{reserva.usuario?.email || ''}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 font-semibold flex items-center gap-2 ${badge.color}`}>
                      <Icon className="w-4 h-4" />
                      <span>{badge.texto}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">{formatearFecha(reserva.fechaReserva)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">{formatearHora(reserva.fechaReserva)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-sm">
                        {reserva.cantidadPersonas || reserva.comenzales || 1} personas
                      </span>
                    </div>
                  </div>

                  {reserva.comentarios && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">{reserva.comentarios}</p>
                    </div>
                  )}

                  {!reserva.aprobada && reserva.estado && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCambiarEstado(reserva.iD_Reserva, true)}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(reserva.iD_Reserva, false)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservasComercio;
