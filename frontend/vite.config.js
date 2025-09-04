import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // automatically open browser on server start
    host: true, // expose to network
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // useful for debugging
  },
  // Resolve imports
  resolve: {
    alias: {
      '@': '/src', // allows @/components/... imports
    }
  },
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }
})
