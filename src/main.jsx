import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Seguro } from './components/Seguro';
import { destravarSom, tocar } from './som';
import './styles/global.css';

// no iPhone, o :active dos botões só funciona se a página escutar toques
document.addEventListener('touchstart', () => {}, { passive: true });

// todo botão faz um clique; data-som troca o som (ou desliga, com "nenhum")
document.addEventListener('click', (evento) => {
  const botao = evento.isTrusted && evento.target.closest?.('button');
  if (!botao || botao.closest('.teste-escondido')) return;
  const som = botao.dataset.som ?? 'clique';
  if (som !== 'nenhum') tocar(som);
});
for (const tipo of ['pointerup', 'keydown']) document.addEventListener(tipo, destravarSom, { once: true });

// erros do código do jogador já aparecem na tela, não precisam ir pro console
function aoCapturarErro(erro, info) {
  if (!(info.errorBoundary instanceof Seguro)) console.error(erro);
}

// se algo escapar de tudo, mostra um aviso em vez de deixar a tela em branco
class Desastre extends Component {
  state = { quebrou: false };

  static getDerivedStateFromError() {
    return { quebrou: true };
  }

  render() {
    if (!this.state.quebrou) return this.props.children;
    return (
      <main className="desastre">
        <h1>A masmorra desabou</h1>
        <p>Alguma coisa deu muito errado. Seu progresso está salvo.</p>
        <button type="button" className="botao botao--fogo" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </main>
    );
  }
}

createRoot(document.getElementById('root'), { onCaughtError: aoCapturarErro }).render(
  <StrictMode>
    <Desastre>
      <App />
    </Desastre>
  </StrictMode>
);

// deixa o jogo instalável e abrindo sem internet (só no build publicado)
if (import.meta.env.PROD && 'serviceWorker' in navigator && window.top === window.self) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
