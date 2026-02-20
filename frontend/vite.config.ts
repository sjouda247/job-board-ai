import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Backend port for dev proxy. Set BACKEND_PORT=10000 if your backend runs on 10000.
const backendPort = process.env.BACKEND_PORT || '5001';
const proxyTarget = `http://localhost:${backendPort}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
