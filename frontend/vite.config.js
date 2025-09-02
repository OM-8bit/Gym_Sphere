import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ✅ Allow Docker external connections
    port: 3000,
    watch: {
      usePolling: true, // ✅ Better file watching in Docker
    },
    proxy: {
      '/api': { 
        target: process.env.DOCKER_ENV ? 'http://backend:8000' : 'http://localhost:8000',
        changeOrigin: true 
      }
    }
  },
  preview: {
    host: true,
    port: 4173,
  },
  css: { 
    postcss: false 
  }
})
