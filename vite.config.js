import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// =========================================================================
// ATEM WEB MANAGER - VITE CONFIGURATION (v2.41.0)
// =========================================================================

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true // Automatically launches localhost:3000 in default browser
  }
});