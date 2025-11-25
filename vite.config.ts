import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This must match your repository name for GitHub Pages
  base: './',
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false,
  }
});
