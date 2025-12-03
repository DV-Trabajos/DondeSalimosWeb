// GoogleLoginButton.jsx - Botón de login/registro con Google
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

//Componente de botón para autenticación con Google
const GoogleLoginButton = ({ 
  isRegistering = false, 
  selectedRole = ROLES.USUARIO_COMUN,
  onSuccess,
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithGoogle, registerWithGoogle } = useAuth();

  //Maneja el éxito de la autenticación con Google
  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    
    try {
      const idToken = credentialResponse.credential;

      let result;

      if (isRegistering) {
        // MODO REGISTRO
        try {
          result = await registerWithGoogle(idToken, selectedRole);
          
          if (result.success) {

            if (onSuccess) {
              onSuccess(result.user);
            }
          } else if (result.alreadyRegistered) {
            // Usuario ya está registrado            
            if (onError) {
              onError({
                alreadyRegistered: true,
                message: result.message || 'Este usuario ya está registrado. Por favor, inicia sesión.',
              });
            }
          }
        } catch (error) {
          console.error('Error en registro:', error);
          
          if (onError) {
            onError({
              message: error.message || 'Error al registrar el usuario. Por favor, intenta nuevamente.',
              error,
            });
          }
        }

      } else {
        // MODO LOGIN
        
        result = await loginWithGoogle(idToken);

        if (result.success) {
          
          if (onSuccess) {
            onSuccess(result.user);
          }

        } else if (result.needsRegistration) {
          // Usuario no está registrado          
          if (onError) {
            onError({
              needsRegistration: true,
              message: result.message || 'Usuario no registrado. Por favor, regístrate primero.',
            });
          }

        } else {
          // Otro tipo de error
          
          if (onError) {
            onError({
              message: result.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.',
            });
          }
        }
      }

    } catch (error) {
      
      if (onError) {
        onError({
          message: error.message || 'Error inesperado en la autenticación. Por favor, intenta nuevamente.',
          error,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  //Maneja el error de Google OAuth (no de la API)
  const handleError = () => {
    
    if (onError) {
      onError({
        message: 'Error al conectar con Google. Por favor, verifica tu conexión e intenta nuevamente.',
      });
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-3 px-4 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
          <span className="text-gray-700 font-medium">
            {isRegistering ? 'Registrando...' : 'Iniciando sesión...'}
          </span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={!isRegistering}
          text={isRegistering ? 'signup_with' : 'signin_with'}
          shape="rectangular"
          size="large"
          theme="outline"
          width="100%"
          locale="es"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;