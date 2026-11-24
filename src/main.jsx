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
