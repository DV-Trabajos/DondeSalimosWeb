// ReviewModal.jsx - Modal de reseña
import { useState, useEffect, useCallback } from 'react';
import { 
  X, Star, AlertCircle, CheckCircle, Loader, 
  Sparkles, MessageSquare, MapPin, Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { createResenia, getAllResenias } from '../../services/reseniasService';
import { getReservasByUsuario } from '../../services/reservasService';

const ReviewModal = ({ isOpen, onClose, comercio, onSuccess }) => {
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados de validación
  const [isValidating, setIsValidating] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Cerrar formulario con tecla ESC
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && comercio && user) {
      resetForm();
      validateReviewEligibility();
    }
  }, [isOpen, comercio, user]);

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setError('');
    setSuccessMessage('');
    setIsValidating(true);
    setCanReview(false);
    setValidationMessage('');
  };

  // Verificar si tiene reserva aprobada en los últimos 7 días
  const checkReservationLast7Days = async () => {
    try {
      const reservas = await getReservasByUsuario(user.iD_Usuario);
      
      if (!reservas || reservas.length === 0) {
        return false;
      }

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      const validReservations = reservas.filter((reserva) => {
        const reservaDate = new Date(reserva.fechaReserva);
        
        return (
          reserva.iD_Comercio === comercio.iD_Comercio &&
          reserva.estado === true &&
          reservaDate >= sevenDaysAgo &&
          reservaDate <= today
        );
      });

      return validReservations.length > 0;
    } catch (error) {
      return false;
    }
  };

  // Verificar cooldown de 7 días entre reseñas
  const checkReviewCooldown = async () => {
    try {
      const allResenias = await getAllResenias();
      
      const myReviews = allResenias.filter(
        r => r.iD_Usuario === user.iD_Usuario && r.iD_Comercio === comercio.iD_Comercio
      );

      if (myReviews.length === 0) {
        return true;
      }

      const lastReview = myReviews.sort(
        (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
      )[0];

      const lastReviewDate = new Date(lastReview.fechaCreacion);
      const today = new Date();
      const daysDifference = Math.floor((today - lastReviewDate) / (1000 * 60 * 60 * 24));

      return daysDifference >= 7;
    } catch (error) {
      return false;
    }
  };

  // Validar elegibilidad para reseñar
  const validateReviewEligibility = async () => {
    try {
      setIsValidating(true);

      // 1. Verificar si tiene reserva en los últimos 7 días
      const hasRecentReservation = await checkReservationLast7Days();
      
      if (!hasRecentReservation) {
        setCanReview(false);
        setValidationMessage('Necesitás una reserva aprobada en los últimos 7 días para dejar una reseña.');
        setIsValidating(false);
        return;
      }

      // 2. Verificar cooldown
      const canReviewNow = await checkReviewCooldown();
      
      if (!canReviewNow) {
        setCanReview(false);
        setValidationMessage('Ya dejaste una reseña recientemente. Debés esperar 7 días para dejar otra.');
        setIsValidating(false);
        return;
      }

      // Puede dejar reseña
      setCanReview(true);
      setValidationMessage('¡Podés dejar tu reseña!');
      
    } catch (error) {
      setCanReview(false);
      setValidationMessage('Error al validar. Intentá nuevamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Seleccioná una calificación');
      return;
    }

    if (!comment.trim()) {
      setError('Escribí un comentario');
      return;
    }

    if (comment.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reseniaData = {
        iD_Usuario: user.iD_Usuario,
        iD_Comercio: comercio.iD_Comercio,
        calificacion: rating,
        comentario: comment.trim(),
        estado: false,
        fechaCreacion: new Date().toISOString(),
      };

      await createResenia(reseniaData);

      setSuccessMessage('¡Reseña enviada! Está pendiente de aprobación.');

      setTimeout(() => {
        onSuccess && onSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      setError(error.response?.data || 'Error al enviar la reseña. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Obtener texto y emoji según rating
  const getRatingInfo = (value) => {
    const ratings = {
      1: { text: 'Muy malo', emoji: '😞' },
      2: { text: 'Malo', emoji: '😕' },
      3: { text: 'Regular', emoji: '😐' },
      4: { text: 'Bueno', emoji: '😊' },
      5: { text: '¡Excelente!', emoji: '😍' }
    };
    return ratings[value] || { text: '', emoji: '' };
  };

  if (!isOpen) return null;
  if (!comercio) return null;

  const currentRating = hoveredRating || rating;
  const ratingInfo = getRatingInfo(currentRating);

  return (
    <div className="fixed inset-0 z-[10002] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente amarillo/naranja */}
          <div className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 p-6 text-white overflow-hidden">
            {/* Decoraciones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              {/* Estrellas decorativas */}
              <Star className="absolute top-4 right-16 w-6 h-6 text-yellow-200/40 fill-yellow-200/40" />
              <Star className="absolute bottom-6 left-16 w-4 h-4 text-yellow-200/30 fill-yellow-200/30" />
            </div>
            
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-200 text-yellow-200" />
                <span className="text-white/90 text-sm font-medium">Dejá tu opinión</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{comercio.nombre}</h2>
              {comercio.direccion && (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{comercio.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
            {isValidating ? (
              // Validando...
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Validando permisos...</p>
              </div>
            ) : !canReview ? (
              // No puede dejar reseña
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No podés dejar una reseña
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">{validationMessage}</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Entendido
                </button>
              </div>
            ) : successMessage ? (
              // Éxito
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Gracias por tu reseña!</h3>
                <p className="text-gray-600">{successMessage}</p>
              </div>
            ) : (
              // Formulario
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de estrellas */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4">
                    <Star className="w-4 h-4 text-amber-500" />
                    ¿Cómo calificás tu experiencia?
                    <span className="text-orange-500">*</span>
                  </label>
                  
                  <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    {/* Estrellas */}
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-all duration-150 hover:scale-110 focus:outline-none focus:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors ${
                              star <= currentRating
                                ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    
                    {/* Indicador */}
                    {currentRating > 0 && (
                      <div className="text-center animate-in fade-in duration-200">
                        <span className="text-4xl">{ratingInfo.emoji}</span>
                        <p className="text-gray-700 font-semibold mt-1">{ratingInfo.text}</p>
                        <p className="text-sm text-gray-500">{currentRating} de 5 estrellas</p>
                      </div>
                    )}
                    
                    {currentRating === 0 && (
                      <p className="text-gray-400 text-sm">Tocá las estrellas para calificar</p>
                    )}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Tu comentario
                    <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`
                      w-full px-4 py-3 bg-gray-50 border-2 rounded-xl transition-all outline-none resize-none
                      ${error && !comment.trim()
                        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
                      }
                    `}
                    rows="4"
                    placeholder="Contanos tu experiencia en este lugar..."
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">Mínimo 10 caracteres</p>
                    <p className={`text-xs ${comment.length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                      {comment.length}/10
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Tu reseña será revisada antes de publicarse. ¡Gracias por compartir tu experiencia!
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Star className="w-5 h-5" />
                        Enviar Reseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;