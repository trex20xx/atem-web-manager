import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// =========================================================================
// ATEM WEB MANAGER - VITE CONFIGURATION (v1.75)
// =========================================================================

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});