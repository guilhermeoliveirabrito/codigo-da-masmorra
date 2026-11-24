import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' deixa o site funcionar em qualquer pasta, inclusive no GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
});
