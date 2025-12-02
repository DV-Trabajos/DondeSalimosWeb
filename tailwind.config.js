/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de la marca DondeSalimos
        primary: '#7C3AED',        // Púrpura vibrante
        'primary-dark': '#5B21B6', // Púrpura oscuro
        'primary-light': '#A78BFA', // Púrpura claro
        
        // Colores del gradiente de la marca
        'brand-magenta': '#EC4899', // Magenta/Rosa
        'brand-purple': '#7C3AED',  // Púrpura
        'brand-purple-dark': '#5B21B6', // Púrpura oscuro
        
        // Colores secundarios
        secondary: '#1a1a2e',
        accent: '#16213e',
        
        // Colores de estado
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        // Gradiente principal de la marca
        'brand-gradient': 'linear-gradient(135deg, #EC4899 0%, #7C3AED 50%, #5B21B6 100%)',
        'brand-gradient-horizontal': 'linear-gradient(90deg, #EC4899 0%, #7C3AED 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #EC4899 0%, #7C3AED 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
        'brand-lg': '0 10px 30px 0 rgba(124, 58, 237, 0.3)',
      },
    },
  },
  plugins: [],
}