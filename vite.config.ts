import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The client lives in client/. `vite build` outputs to dist/, served by Firebase Hosting.
export default defineConfig({
  root: 'client',
  envDir: '..', // read VITE_* settings from the project-root .env
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
});
