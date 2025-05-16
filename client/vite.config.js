import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5001', // Proxy API requests to your Express backend
    },
  },
})
