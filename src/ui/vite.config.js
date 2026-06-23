import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Root is src/ui/ (this file's location) — run vite from src/ui/
  // Output lands at src/ui/dist/ for production builds
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
