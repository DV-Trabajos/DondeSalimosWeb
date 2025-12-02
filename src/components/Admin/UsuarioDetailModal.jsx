// UsuarioDetailModal.jsx - Modal de detalles de usuario
import { useEffect, useCallback } from 'react';
import { X, User, Mail, Shield, Calendar, CheckCircle, XCircle, Phone, Clock, AlertTriangle, Sparkles, Hash } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const UsuarioDetailModal = ({ usuario, isOpen, onClose }) => {
  // Cerrar formulario con tecla ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !usuario) return null;

  // Obtener configuración del rol (solo para badges, no para header)
  const getRoleConfig = (roleId) => {
    switch(roleId) {
      case 2: 
        return { 
          name: 'Administrador', 
          icon: '👑', 
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 3: 
        return { 
          name: 'Comercio', 
          icon: '🏪', 
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200'
        };
      case 16: 
        return { 
          name: 'Usuario', 
          icon: '👤', 
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      default: 
        return { 
          name: 'Desconocido', 
          icon: '❓', 
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const roleConfig = getRoleConfig(usuario.iD_RolUsuario);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 p-6 text-white overflow-hidden">
            {/* Decoraciones de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Info del usuario */}
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                {roleConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{usuario.nombreUsuario}</h2>
                <p className="text-white/80 text-sm mt-1">{usuario.correo}</p>
              </div>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            
            {/* Badges de estado y rol */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* Estado */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${
                usuario.estado 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  usuario.estado 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-br from-red-500 to-rose-500'
                }`}>
                  {usuario.estado 
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <XCircle className="w-5 h-5 text-white" />
                  }
                </div>
                <div>
                  <p className={`text-xs font-medium ${usuario.estado ? 'text-emerald-600' : 'text-red-600'}`}>Estado</p>
                  <p className={`font-semibold ${usuario.estado ? 'text-emerald-700' : 'text-red-700'}`}>
                    {usuario.estado ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>

              {/* Rol */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 ${roleConfig.bgColor} ${roleConfig.borderColor}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${roleConfig.textColor}`}>Rol</p>
                  <p className={`font-semibold ${roleConfig.textColor}`}>{roleConfig.name}</p>
                </div>
              </div>

              {/* Solicitud de reactivación */}
              {usuario.solicitudReactivacion && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 bg-amber-50 border-amber-200">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600">Solicitud</p>
                    <p className="font-semibold text-amber-700">Reactivación pendiente</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información de contacto */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={<Mail className="w-5 h-5 text-violet-500" />}
                  label="Correo electrónico"
                  value={usuario.correo}
                />

                <InfoItem 
                  icon={<Calendar className="w-5 h-5 text-violet-500" />}
                  label="Fecha de registro"
                  value={formatDate(usuario.fechaCreacion)}
                />

                {usuario.telefono && (
                  <InfoItem 
                    icon={<Phone className="w-5 h-5 text-violet-500" />}
                    label="Teléfono"
                    value={usuario.telefono}
                  />
                )}
              </div>
            </div>

            {/* Motivo de rechazo si existe */}
            {usuario.motivoRechazo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Motivo de desactivación</h3>
                    <p className="text-red-700">{usuario.motivoRechazo}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25"
              >
                Cerrar
              </button>
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

export default UsuarioDetailModal;