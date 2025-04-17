import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Directorio raíz del proyecto
  server: {
    port: 3000, // Cambia el puerto si lo necesitas
  },
  build: {
    outDir: 'dist', // Carpeta de salida para la compilación
  },
});