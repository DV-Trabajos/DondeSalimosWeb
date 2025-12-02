import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimización para axios y otras dependencias
  optimizeDeps: {
    include: ['axios'],
  },
  
  // Configuración de build
  build: {
    commonjsOptions: {
      include: [/axios/, /node_modules/],
    },
  },
  
  // Configuración del servidor
  server: {
    port: 5173,
    host: true,
  },
  
  // Resolver alias (opcional pero útil)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
