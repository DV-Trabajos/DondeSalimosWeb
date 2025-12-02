// ComercioDetailModal.jsx - Modal de detalles de comercio
import { 
  X, Store, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, 
  Clock, Users, Music, FileText, AlertTriangle, ExternalLink, Hash, Sparkles
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ComercioDetailModal = ({ comercio, isOpen, onClose }) => {
  if (!isOpen || !comercio) return null;

  // Configuración del estado (solo para badges)
  const getEstadoConfig = () => {
    if (comercio.estado && !comercio.motivoRechazo) {
      return {
        label: 'Aprobado',
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        gradient: 'from-emerald-500 to-teal-500'
      };
    }
    if (!comercio.estado && comercio.motivoRechazo) {
      return {
        label: 'Rechazado',
        icon: XCircle,
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        gradient: 'from-red-500 to-rose-500'
      };
    }
    return {
      label: 'Pendiente',
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-orange-500'
    };
  };

  const estadoConfig = getEstadoConfig();
  const EstadoIcon = estadoConfig.icon;

  // Formatear horarios
  const formatTime = (time) => {
    if (!time) return null;
    return time.toString().substring(0, 5);
  };

  const horaIngreso = formatTime(comercio.horaIngreso);
  const horaCierre = formatTime(comercio.horaCierre);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="relative h-48 overflow-hidden">
            {comercio.imagen ? (
              <>
                <img 
                  src={comercio.imagen} 
                  alt={comercio.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            )}
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Info del comercio sobre la imagen */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Store className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{comercio.nombre}</h2>
                  <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {comercio.direccion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            
            {/* Badges de estado */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Estado */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${estadoConfig.bg} ${estadoConfig.border}`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${estadoConfig.gradient} rounded-lg flex items-center justify-center`}>
                  <EstadoIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${estadoConfig.text} font-medium`}>Estado</p>
                  <p className={`${estadoConfig.text} font-semibold`}>{estadoConfig.label}</p>
                </div>
              </div>

              {/* Horario */}
              {horaIngreso && horaCierre && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-blue-50 border-blue-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Horario</p>
                    <p className="text-blue-700 font-semibold">{horaIngreso} - {horaCierre}</p>
                  </div>
                </div>
              )}

              {/* Capacidad */}
              {comercio.capacidad > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-purple-50 border-purple-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Capacidad</p>
                    <p className="text-purple-700 font-semibold">{comercio.capacidad} personas</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de Contacto */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={<Mail className="w-5 h-5 text-violet-500" />}
                  label="Correo"
                  value={comercio.correo}
                />
                
                {comercio.telefono && (
                  <InfoItem 
                    icon={<Phone className="w-5 h-5 text-violet-500" />}
                    label="Teléfono"
                    value={comercio.telefono}
                  />
                )}

                <InfoItem 
                  icon={<MapPin className="w-5 h-5 text-violet-500" />}
                  label="Dirección"
                  value={comercio.direccion}
                />

                <InfoItem 
                  icon={<Calendar className="w-5 h-5 text-violet-500" />}
                  label="Fecha de registro"
                  value={formatDate(comercio.fechaCreacion)}
                />
              </div>
            </div>

            {/* Información Fiscal */}
            {comercio.nroDocumento && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Información Fiscal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem 
                    icon={<FileText className="w-5 h-5 text-violet-500" />}
                    label="Tipo de documento"
                    value={comercio.tipoDocumento || 'CUIT'}
                  />
                  
                  <InfoItem 
                    icon={<Hash className="w-5 h-5 text-violet-500" />}
                    label="Número de documento"
                    value={comercio.nroDocumento}
                  />
                </div>
              </div>
            )}

            {/* Información Adicional */}
            {(comercio.mesas > 0 || comercio.generoMusical) && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Información Adicional
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comercio.mesas > 0 && (
                    <InfoItem 
                      icon={<Store className="w-5 h-5 text-violet-500" />}
                      label="Número de mesas"
                      value={comercio.mesas}
                    />
                  )}
                  
                  {comercio.generoMusical && (
                    <InfoItem 
                      icon={<Music className="w-5 h-5 text-violet-500" />}
                      label="Género Musical"
                      value={comercio.generoMusical}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Propietario */}
            {comercio.usuario && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Propietario
                </h3>
                
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{comercio.usuario.nombreUsuario}</p>
                    <p className="text-sm text-gray-500">{comercio.usuario.correo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Motivo de rechazo si existe */}
            {comercio.motivoRechazo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Motivo de rechazo</h3>
                    <p className="text-red-700">{comercio.motivoRechazo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium"
              >
                Cerrar
              </button>
              
              {comercio.latitud && comercio.longitud && (
                <a
                  href={`https://www.google.com/maps?q=${comercio.latitud},${comercio.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25 inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Ver en Mapa
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para items de información
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
    <div className="flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-gray-900 font-medium break-words">{value}</p>
    </div>
  </div>
);

export default ComercioDetailModal;