// ReviewModal.jsx - Modal de reseña para usuarios
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
      console.error('Error checking reservations:', error);
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
      console.error('Error checking review cooldown:', error);
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
      console.error('Error validating review eligibility:', error);
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
        puntuacion: rating,
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
      console.error('Error al crear reseña:', error);
      
      const errorMessage = error.response?.data;
      
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('inactiv') || errorMessage.includes('desactivado')) {
          setError('Tu cuenta está inactiva. Contactá al administrador.');
        } else if (errorMessage.includes('reserva aprobada') || errorMessage.includes('sin reserva')) {
          setError('Necesitás una reserva aprobada para dejar una reseña.');
        } else if (errorMessage.includes('ya tienes una reseña') || errorMessage.includes('reseña pendiente') || errorMessage.includes('reseña aprobada')) {
          setError('Ya tenés una reseña aprobada o pendiente para este comercio.');
        } else if (errorMessage.includes('puntuación')) {
          setError('La puntuación debe estar entre 1 y 5.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Error al enviar la reseña. Intentá nuevamente.');
      }
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-gradient-to-b from-[#1a1a2e] to-[#16162a] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-violet-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white overflow-hidden">
            {/* Decoraciones */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              {/* Estrellas decorativas */}
              <Star className="absolute top-4 right-16 w-6 h-6 text-yellow-300/40 fill-yellow-300/40" />
              <Star className="absolute bottom-6 left-16 w-4 h-4 text-yellow-300/30 fill-yellow-300/30" />
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
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
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
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-violet-300/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300 font-medium">Validando permisos...</p>
              </div>
            ) : !canReview ? (
              // No puede dejar reseña
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                  <AlertCircle className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No podés dejar una reseña
                </h3>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto">{validationMessage}</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-violet-500/20 text-violet-300 rounded-xl hover:bg-violet-500/30 transition font-medium border border-violet-500/30"
                >
                  Entendido
                </button>
              </div>
            ) : successMessage ? (
              // Éxito
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¡Gracias por tu reseña!</h3>
                <p className="text-gray-400">{successMessage}</p>
              </div>
            ) : (
              // Formulario
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de estrellas */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
                    <Star className="w-4 h-4 text-yellow-400" />
                    ¿Cómo calificás tu experiencia?
                    <span className="text-violet-400">*</span>
                  </label>
                  
                  <div className="flex flex-col items-center gap-4 p-6 bg-violet-500/10 rounded-2xl border border-violet-500/20">
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
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                                : 'fill-gray-600 text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    
                    {/* Indicador */}
                    {currentRating > 0 && (
                      <div className="text-center animate-in fade-in duration-200">
                        <span className="text-4xl">{ratingInfo.emoji}</span>
                        <p className="text-white font-semibold mt-1">{ratingInfo.text}</p>
                        <p className="text-sm text-gray-400">{currentRating} de 5 estrellas</p>
                      </div>
                    )}
                    
                    {currentRating === 0 && (
                      <p className="text-gray-500 text-sm">Tocá las estrellas para calificar</p>
                    )}
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Tu comentario
                    <span className="text-violet-400">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className={`
                      w-full px-4 py-3 bg-[#252540] border-2 rounded-xl transition-all outline-none resize-none text-white placeholder-gray-500
                      ${error && !comment.trim()
                        ? 'border-red-500/50 bg-red-500/10'
                        : 'border-violet-500/30 hover:border-violet-500/50 focus:border-violet-500 focus:bg-[#2a2a4a]'
                      }
                    `}
                    rows={4}
                    placeholder="Contanos tu experiencia en este lugar..."
                    maxLength={500}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">Mínimo 10 caracteres</p>
                    <p className="text-xs text-gray-500">{comment.length}/500</p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition font-medium disabled:opacity-50 border border-gray-600/50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
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