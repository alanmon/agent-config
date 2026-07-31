import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Builds a classic (non-module) single-file bundle so preview.html runs from file://. */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
    target: 'es2019',
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: { format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js' },
    },
  },
});
