// MisReservas.jsx - Este componente se adapta automáticamente según el rol:
// - Usuario común: Solo ve "Mis Reservas"
// - Dueño de comercio: Ve tabs "Mis Reservas" y "Reservas Recibidas"
// - Administrador: Acceso completo a ambos tabs
import Reservas from '../components/Reservations/Reservas';

const MisReservas = () => {
  return <Reservas />;
};

export default MisReservas;
