// PoliticaPrivacidad.jsx - Página de Política de Privacidad
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Eye, Lock, Trash2, Mail } from 'lucide-react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';

const PoliticaPrivacidad = () => {
  const fechaActualizacion = "1 de Diciembre de 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 pt-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Política de Privacidad
                </h1>
                <p className="text-white/70">Última actualización: {fechaActualizacion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            
            {/* Introducción */}
            <section>
              <p className="text-gray-600 leading-relaxed">
                En <strong>¿Dónde Salimos?</strong> nos tomamos muy en serio la protección de tus datos personales. 
                Esta política explica qué información recopilamos, cómo la usamos y cuáles son tus derechos.
              </p>
            </section>

            {/* Sección 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">1. Información que Recopilamos</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Recopilamos la siguiente información cuando usás nuestra plataforma:</p>
                
                <h3 className="font-semibold text-gray-800 mt-4">Información de registro:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nombre y apellido</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono (opcional)</li>
                  <li>Información de tu cuenta de Google (si te registrás con Google)</li>
                </ul>

                <h3 className="font-semibold text-gray-800 mt-4">Información de uso:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Ubicación geográfica (para mostrar lugares cercanos)</li>
                  <li>Historial de reservas y reseñas</li>
                  <li>Preferencias de búsqueda</li>
                </ul>

                <h3 className="font-semibold text-gray-800 mt-4">Para comercios:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Datos del establecimiento (nombre, dirección, teléfono)</li>
                  <li>CUIT/CUIL del responsable</li>
                  <li>Imágenes del local</li>
                </ul>
              </div>
            </section>

            {/* Sección 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">2. Cómo Usamos tu Información</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Utilizamos tu información para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionarte acceso a la plataforma y sus funciones.</li>
                  <li>Procesar y gestionar tus reservas.</li>
                  <li>Mostrarte lugares cercanos basados en tu ubicación.</li>
                  <li>Enviarte notificaciones sobre tus reservas y actividad.</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario.</li>
                  <li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
                  <li>Comunicarnos contigo sobre actualizaciones importantes.</li>
                </ul>
                <p className="mt-4">
                  <strong>No vendemos ni compartimos tu información personal con terceros</strong> con 
                  fines publicitarios.
                </p>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">3. Seguridad de los Datos</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Implementamos medidas de seguridad para proteger tu información:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encriptación de datos sensibles.</li>
                  <li>Acceso restringido a información personal.</li>
                  <li>Autenticación segura mediante Google OAuth.</li>
                  <li>Monitoreo continuo de actividades sospechosas.</li>
                </ul>
                <p>
                  Sin embargo, ningún sistema es 100% seguro. Te recomendamos no compartir 
                  tu contraseña y cerrar sesión en dispositivos compartidos.
                </p>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">4. Tus Derechos</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Tenés derecho a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Acceder:</strong> Solicitar una copia de tus datos personales.
                  </li>
                  <li>
                    <strong>Rectificar:</strong> Corregir información incorrecta o desactualizada.
                  </li>
                  <li>
                    <strong>Eliminar:</strong> Solicitar la eliminación de tu cuenta y datos asociados.
                  </li>
                  <li>
                    <strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado.
                  </li>
                  <li>
                    <strong>Oposición:</strong> Oponerte al tratamiento de tus datos para ciertos fines.
                  </li>
                </ul>
                <p>
                  Para ejercer estos derechos, contactanos a{' '}
                  <a href="mailto:info@dondesalimos.com" className="text-purple-600 hover:underline">
                    info@dondesalimos.com
                  </a>
                </p>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">5. Retención de Datos</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Conservamos tu información mientras:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tu cuenta esté activa.</li>
                  <li>Sea necesario para cumplir con obligaciones legales.</li>
                  <li>Existan reservas o transacciones pendientes.</li>
                </ul>
                <p>
                  Al eliminar tu cuenta, tus datos personales serán eliminados en un plazo de 30 días, 
                  excepto aquellos que debamos conservar por obligaciones legales.
                </p>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookies y Tecnologías Similares</h2>
              <div className="text-gray-600 space-y-3">
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mantener tu sesión iniciada.</li>
                  <li>Recordar tus preferencias.</li>
                  <li>Analizar el uso de la plataforma para mejorarla.</li>
                </ul>
                <p>
                  Podés configurar tu navegador para rechazar cookies, aunque esto podría 
                  afectar algunas funciones de la plataforma.
                </p>
              </div>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cambios en esta Política</h2>
              <p className="text-gray-600">
                Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios 
                significativos por email o mediante un aviso en la plataforma. Te recomendamos 
                revisar esta página periódicamente.
              </p>
            </section>

            {/* Sección 8 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">8. Contacto</h2>
              </div>
              <p className="text-gray-600">
                Si tenés preguntas o inquietudes sobre esta política de privacidad, 
                podés contactarnos en:{' '}
                <a href="mailto:info@dondesalimos.com" className="text-purple-600 hover:underline">
                  info@dondesalimos.com
                </a>
              </p>
            </section>

            {/* Footer del documento */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Al utilizar <strong>¿Dónde Salimos?</strong>, confirmás que has leído y 
                aceptado esta Política de Privacidad.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaPrivacidad;