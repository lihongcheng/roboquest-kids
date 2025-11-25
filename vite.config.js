import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative path so it works in any subfolder on GitHub Pages
  base: './',
  build: {
    // Force output to 'docs' folder
    outDir: 'docs',
    // Ensure the output directory is empty before building
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: false,
  }
});