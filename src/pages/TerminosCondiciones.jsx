// TerminosCondiciones.jsx - Página de Términos y Condiciones
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Scale } from 'lucide-react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';

const TerminosCondiciones = () => {
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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Términos y Condiciones
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
                Bienvenido a <strong>¿Dónde Salimos?</strong>. Al acceder y utilizar nuestra plataforma, 
                aceptás estos términos y condiciones en su totalidad. Te recomendamos leerlos detenidamente 
                antes de usar nuestros servicios.
              </p>
            </section>

            {/* Sección 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">1. Uso de la Plataforma</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>
                  <strong>¿Dónde Salimos?</strong> es una plataforma que conecta usuarios con bares, 
                  boliches y establecimientos nocturnos, permitiendo explorar opciones, realizar reservas 
                  y dejar reseñas.
                </p>
                <p>Al usar nuestra plataforma, te comprometés a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionar información veraz y actualizada al registrarte.</li>
                  <li>Utilizar la plataforma de manera responsable y respetuosa.</li>
                  <li>No realizar acciones que perjudiquen el funcionamiento del servicio.</li>
                  <li>Ser mayor de 18 años para acceder a establecimientos con venta de alcohol.</li>
                </ul>
              </div>
            </section>

            {/* Sección 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">2. Cuentas de Usuario</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Existen dos tipos de cuentas en nuestra plataforma:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Usuario común:</strong> Puede explorar lugares, hacer reservas y dejar reseñas.
                  </li>
                  <li>
                    <strong>Usuario comercio:</strong> Puede registrar y gestionar sus establecimientos, 
                    recibir reservas y responder reseñas.
                  </li>
                </ul>
                <p>
                  Sos responsable de mantener la confidencialidad de tu cuenta y contraseña. 
                  Cualquier actividad realizada desde tu cuenta es tu responsabilidad.
                </p>
              </div>
            </section>

            {/* Sección 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">3. Reservas</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Las reservas realizadas a través de la plataforma están sujetas a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Disponibilidad del establecimiento.</li>
                  <li>Confirmación por parte del comercio.</li>
                  <li>Las políticas propias de cada establecimiento.</li>
                </ul>
                <p>
                  <strong>¿Dónde Salimos?</strong> actúa como intermediario y no es responsable por 
                  cancelaciones, cambios o incumplimientos por parte de los establecimientos.
                </p>
              </div>
            </section>

            {/* Sección 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">4. Contenido y Reseñas</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>Al publicar reseñas u otro contenido, garantizás que:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>El contenido es original y refleja tu experiencia real.</li>
                  <li>No contiene material ofensivo, difamatorio o ilegal.</li>
                  <li>No infringe derechos de terceros.</li>
                </ul>
                <p>
                  Nos reservamos el derecho de moderar, editar o eliminar contenido que viole 
                  estas condiciones sin previo aviso.
                </p>
              </div>
            </section>

            {/* Sección 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">5. Limitación de Responsabilidad</h2>
              </div>
              <div className="pl-13 space-y-3 text-gray-600">
                <p>
                  <strong>¿Dónde Salimos?</strong> proporciona la plataforma "tal cual" y no garantiza 
                  la exactitud de la información proporcionada por terceros (comercios y usuarios).
                </p>
                <p>No somos responsables por:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>La calidad de los servicios ofrecidos por los establecimientos.</li>
                  <li>Daños directos o indirectos derivados del uso de la plataforma.</li>
                  <li>Interrupciones temporales del servicio por mantenimiento o causas técnicas.</li>
                </ul>
              </div>
            </section>

            {/* Sección 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Modificaciones</h2>
              <p className="text-gray-600">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios serán publicados en esta página y, si son significativos, 
                te notificaremos por email. El uso continuado de la plataforma después de 
                los cambios implica tu aceptación de los nuevos términos.
              </p>
            </section>

            {/* Sección 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contacto</h2>
              <p className="text-gray-600">
                Si tenés preguntas sobre estos términos, podés contactarnos en:{' '}
                <a href="mailto:info@dondesalimos.com" className="text-purple-600 hover:underline">
                  info@dondesalimos.com
                </a>
              </p>
            </section>

            {/* Footer del documento */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Al utilizar <strong>¿Dónde Salimos?</strong>, confirmás que has leído, 
                entendido y aceptado estos Términos y Condiciones.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TerminosCondiciones;