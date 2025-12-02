// PaymentCallback.jsx - Página de retorno de Mercado Pago
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, Home, Megaphone } from 'lucide-react';
import Header from '../components/Shared/Header';
import { verificarPago } from '../services/pagosService';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // loading, success, failure, pending
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    processPaymentReturn();
  }, []);

  const processPaymentReturn = async () => {
    try {
      // Obtener parámetros de la URL
      const collectionStatus = searchParams.get('collection_status') || searchParams.get('status');
      const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
      const externalReference = searchParams.get('external_reference');
      const preferenceId = searchParams.get('preference_id');

      if (!paymentId) {
        setStatus('failure');
        setError('No se recibió información del pago');
        return;
      }

      // Verificar el pago con el backend
      if (collectionStatus === 'approved' || collectionStatus === 'success') {
        try {
          const result = await verificarPago(paymentId, preferenceId);
          setPaymentInfo(result);
          setStatus('success');
        } catch (err) {
          // Si falla la verificación pero el status es approved, igual mostrar éxito
          setStatus('success');
          setPaymentInfo({
            publicidadId: externalReference,
            paymentStatus: collectionStatus
          });
        }
      } else if (collectionStatus === 'pending' || collectionStatus === 'in_process') {
        setStatus('pending');
        setPaymentInfo({
          publicidadId: externalReference,
          paymentStatus: collectionStatus
        });
      } else {
        setStatus('failure');
        setPaymentInfo({
          publicidadId: externalReference,
          paymentStatus: collectionStatus
        });
      }

    } catch (error) {
      setStatus('failure');
      setError('Error al procesar el pago');
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary mx-auto"></div>,
          title: 'Verificando pago...',
          description: 'Por favor espera mientras confirmamos tu pago con Mercado Pago.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
      
      case 'success':
        return {
          icon: <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />,
          title: '¡Pago Exitoso!',
          description: 'Tu publicidad ha sido activada correctamente. Ahora es visible para todos los usuarios.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      
      case 'pending':
        return {
          icon: <Clock className="w-20 h-20 text-yellow-500 mx-auto" />,
          title: 'Pago Pendiente',
          description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme y tu publicidad será activada automáticamente.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
        };
      
      case 'failure':
        return {
          icon: <XCircle className="w-20 h-20 text-red-500 mx-auto" />,
          title: 'Pago No Completado',
          description: error || 'El pago no pudo ser procesado. Por favor intenta nuevamente.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      
      default:
        return {
          icon: <AlertCircle className="w-20 h-20 text-gray-500 mx-auto" />,
          title: 'Estado Desconocido',
          description: 'No pudimos determinar el estado de tu pago.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      
      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className={`${content.bgColor} rounded-xl shadow-lg p-8 text-center`}>
            {/* Icono */}
            <div className="mb-6">
              {content.icon}
            </div>
            
            {/* Título */}
            <h1 className={`text-3xl font-bold ${content.color} mb-4`}>
              {content.title}
            </h1>
            
            {/* Descripción */}
            <p className="text-gray-700 text-lg mb-6">
              {content.description}
            </p>
            
            {/* Información del pago */}
            {paymentInfo && status !== 'loading' && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Detalles del pago:</h3>
                <div className="space-y-2 text-sm">
                  {paymentInfo.publicidadId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Publicidad:</span>
                      <span className="font-medium">#{paymentInfo.publicidadId}</span>
                    </div>
                  )}
                  {paymentInfo.paymentStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-medium capitalize">{paymentInfo.paymentStatus}</span>
                    </div>
                  )}
                  {searchParams.get('payment_id') && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Pago MP:</span>
                      <span className="font-medium">{searchParams.get('payment_id')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/mis-publicidades')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                <Megaphone className="w-5 h-5" />
                Ver Mis Publicidades
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                <Home className="w-5 h-5" />
                Ir al Inicio
              </button>
            </div>
            
            {/* Mensaje adicional según estado */}
            {status === 'success' && (
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <p className="text-green-800 text-sm">
                  🎉 <strong>¡Felicidades!</strong> Tu publicidad ya está activa y visible en el carrusel principal.
                  Podrás ver las estadísticas de visualizaciones en tu panel.
                </p>
              </div>
            )}
            
            {status === 'pending' && (
              <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⏳ <strong>Importante:</strong> Los pagos en efectivo o transferencia pueden demorar hasta 48 horas en acreditarse.
                  Tu publicidad se activará automáticamente una vez confirmado el pago.
                </p>
              </div>
            )}
            
            {status === 'failure' && (
              <div className="mt-6 p-4 bg-red-100 rounded-lg">
                <p className="text-red-800 text-sm">
                  ❌ <strong>No te preocupes:</strong> No se realizó ningún cargo. Puedes intentar nuevamente desde tu panel de publicidades.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
