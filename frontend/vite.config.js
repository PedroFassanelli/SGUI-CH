import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Requests to /api are forwarded to the backend, so the frontend uses
    // relative URLs and the browser sees a single origin (no CORS needed).
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Reset every mock's calls and implementation between tests.
    mockReset: true,
  },
});
