// InputModal.jsx - Modal con input para confirmaciones
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';

const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  expectedValue = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // ← Nuevo estado
  const inputRef = useRef(null);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
      setIsLoading(false);  // ← Reset loading
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    // Validaciones...
    if (expectedValue && inputValue.trim() !== expectedValue.trim()) {
      setError('El texto ingresado no coincide');
      return;
    }

    if (!expectedValue && inputValue.trim().length === 0) {
      setError('Debes ingresar un texto');
      return;
    }

    // Mostrar loading y esperar respuesta
    setIsLoading(true);
    
    try {
      if (typeof onConfirm === 'function') {
        await onConfirm(inputValue);
      }
    } catch (error) {
      console.error('Error en onConfirm:', error);
      setError('Ocurrió un error, intenta de nuevo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleConfirm();
    } else if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  const isMatch = expectedValue 
    ? inputValue.trim() === expectedValue.trim()
    : inputValue.trim().length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Overlay con blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con gradiente rojo de advertencia */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500" />
          
          {/* Efecto de glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500 rounded-full blur-3xl opacity-10"></div>
          </div>
          
          <div className="relative p-6">
            {/* Icono y título */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <ShieldAlert className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center">
                {title}
              </h3>
            </div>

            {/* Mensaje */}
            <div className="mb-5">
              <p className="text-gray-600 text-center leading-relaxed mb-4">
                {message}
              </p>

              {/* Valor esperado */}
              {expectedValue && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500 text-center mb-1">Escribe exactamente:</p>
                  <p className="text-center font-mono font-semibold text-gray-900">{expectedValue}</p>
                </div>
              )}

              {/* Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    error 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : isMatch && inputValue
                        ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                />
                
                {/* Indicador de coincidencia */}
                {inputValue && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                    isMatch ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}>
                    {isMatch ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Mensaje de error */}
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isMatch || isLoading}
                className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
                  isMatch && !isLoading
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputModal;