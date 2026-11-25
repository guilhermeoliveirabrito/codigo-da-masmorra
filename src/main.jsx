import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Seguro } from './components/Seguro';
import './styles/global.css';

// erros do código do jogador já aparecem na tela, não precisam ir pro console
function aoCapturarErro(erro, info) {
  if (!(info.errorBoundary instanceof Seguro)) console.error(erro);
}

createRoot(document.getElementById('root'), { onCaughtError: aoCapturarErro }).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// deixa o jogo instalável e abrindo sem internet (só no build publicado)
if (import.meta.env?.PROD && 'serviceWorker' in navigator && window.top === window.self) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
