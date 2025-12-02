// RolModal.jsx - Modal unificado para ver/crear/editar roles
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Shield, Save, Loader2, AlertTriangle, Sparkles,
  CheckCircle, Users, Hash, Eye, Edit, Trash2
} from 'lucide-react';
import { isSystemRole, getRoleIcon, getRoleColor } from '../../services/rolesUsuarioService';

// Tipos de modal
export const ROL_MODAL_TYPES = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete'
};

const RolModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  rol = null,
  type = ROL_MODAL_TYPES.VIEW,
  usuariosCount = 0 // Cantidad de usuarios usando este rol
}) => {
  const [formData, setFormData] = useState({ descripcion: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = type === ROL_MODAL_TYPES.VIEW;
  const isCreateMode = type === ROL_MODAL_TYPES.CREATE;
  const isEditMode = type === ROL_MODAL_TYPES.EDIT;
  const isDeleteMode = type === ROL_MODAL_TYPES.DELETE;

  // Cerrar formulario con tecla ESC
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

  // Cargar datos si es modo edición o vista
  useEffect(() => {
    if (isOpen) {
      if (rol && (isEditMode || isViewMode)) {
        setFormData({
          descripcion: rol.descripcion || rol.Descripcion || ''
        });
      } else {
        setFormData({ descripcion: '' });
      }
      setErrors({});
    }
  }, [isOpen, rol, isEditMode, isViewMode]);

  if (!isOpen) return null;

  const rolId = rol?.iD_RolUsuario || rol?.ID_RolUsuario;
  const isSystem = rolId ? isSystemRole(rolId) : false;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 3) {
      newErrors.descripcion = 'La descripción debe tener al menos 3 caracteres';
    } else if (formData.descripcion.trim().length > 50) {
      newErrors.descripcion = 'La descripción no puede superar los 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (isDeleteMode) {
      setIsSubmitting(true);
      try {
        await onSubmit(rol);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...rol,
        descripcion: formData.descripcion.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setFormData({ descripcion: value });
    if (errors.descripcion) {
      setErrors({});
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Configuración según tipo de modal
  const getModalConfig = () => {
    switch (type) {
      case ROL_MODAL_TYPES.CREATE:
        return {
          title: 'Nuevo Rol',
          subtitle: 'Crea un nuevo rol de usuario',
          icon: Shield,
          buttonText: 'Crear Rol'
        };
      case ROL_MODAL_TYPES.EDIT:
        return {
          title: 'Editar Rol',
          subtitle: 'Modifica la descripción del rol',
          icon: Edit,
          buttonText: 'Guardar Cambios'
        };
      case ROL_MODAL_TYPES.DELETE:
        return {
          title: 'Eliminar Rol',
          subtitle: '¿Estás seguro de eliminar este rol?',
          icon: Trash2,
          buttonText: 'Eliminar',
          isDanger: true
        };
      default: // VIEW
        return {
          title: 'Detalle del Rol',
          subtitle: `ID: #${rolId}`,
          icon: Eye,
          buttonText: 'Cerrar'
        };
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
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
                <IconComponent className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{config.title}</h2>
                <p className="text-white/80 text-sm mt-1">{config.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6">
            
            {/* Modo DELETE */}
            {isDeleteMode && rol && (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-700 mb-4">
                  ¿Estás seguro de eliminar el rol <strong>"{rol.descripcion || rol.Descripcion}"</strong>?
                </p>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              </div>
            )}

            {/* Modo VIEW */}
            {isViewMode && rol && (
              <>
                {/* Badge de sistema */}
                {isSystem && (
                  <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Rol del sistema (no editable)</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Descripción */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-2xl">
                        {getRoleIcon ? getRoleIcon(rolId) : '👤'}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Nombre del Rol</p>
                        <p className="text-lg font-bold text-gray-900">{rol.descripcion || rol.Descripcion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Usuarios usando este rol */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Usuarios con este rol</p>
                        <p className="text-lg font-bold text-gray-900">{usuariosCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Modo CREATE o EDIT */}
            {(isCreateMode || isEditMode) && (
              <form onSubmit={handleSubmit}>
                {/* Alerta si es rol del sistema */}
                {isEditMode && isSystem && (
                  <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Rol del sistema (no editable)</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="w-4 h-4 text-violet-500" />
                    Descripción del Rol
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={handleChange}
                    disabled={isSystem}
                    maxLength={50}
                    placeholder="Ej: Supervisor, Moderador..."
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all ${
                      errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    } ${isSystem ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.descripcion ? (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.descripcion}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${formData.descripcion.length > 45 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {formData.descripcion.length}/50
                    </span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-5 bg-gray-50">
            <div className="flex justify-end gap-3">
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}

              {(isCreateMode || isEditMode) && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (isEditMode && isSystem)}
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
                      {config.buttonText}
                    </>
                  )}
                </button>
              )}

              {isDeleteMode && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/25 inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      {config.buttonText}
                    </>
                  )}
                </button>
              )}

              {isViewMode && (
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/25"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolModal;