import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// =========================================================================
// ATEM WEB MANAGER - VITE CONFIGURATION (v2.34.0)
// =========================================================================

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});