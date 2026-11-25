import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// O que a página publicada pode carregar. O 'unsafe-eval' é preciso porque o jogo
// roda o código do jogador com new Function. O resto fica fechado: nada de scripts
// de fora, e o código do jogador não consegue mandar dados pra outro site.
const POLITICA_DE_SEGURANCA = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

// só no build: no modo dev o Vite precisa injetar coisas que essa política bloquearia
function politicaDeSeguranca() {
  return {
    name: 'politica-de-seguranca',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${POLITICA_DE_SEGURANCA}" />`
      );
    },
  };
}

// base './' deixa o site funcionar em qualquer pasta, inclusive no GitHub Pages
export default defineConfig({
  plugins: [react(), politicaDeSeguranca()],
  base: './',
  resolve: {
    // o acorn-jsx pede o acorn com require e o resto do código com import; sem isso
    // o build leva duas cópias do acorn
    alias: [
      {
        find: /^acorn$/,
        replacement: fileURLToPath(new URL('./node_modules/acorn/dist/acorn.mjs', import.meta.url)),
      },
    ],
  },
});
