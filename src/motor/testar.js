import { Component, createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

class Capturador extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro) {
    this.props.aoErro(erro);
  }

  render() {
    return this.state.erro ? null : this.props.children;
  }
}

// desenha fora da tela e na hora (flushSync), pra dar pra conferir logo em seguida
export function desenharEscondido(elemento, espiao, { largura } = {}) {
  const container = document.createElement('div');
  container.className = 'teste-escondido';
  if (largura) container.style.width = `${largura}px`;
  document.body.appendChild(container);

  const silencio = () => {};
  const root = createRoot(container, {
    onCaughtError: silencio,
    onUncaughtError: silencio,
    onRecoverableError: silencio,
  });

  let erro = null;
  if (espiao) espiao.desenhando = true;
  try {
    flushSync(() => {
      root.render(createElement(Capturador, { aoErro: (e) => (erro = e) }, elemento));
    });
  } finally {
    if (espiao) espiao.desenhando = false;
  }

  return {
    container,
    get erro() {
      return erro;
    },
    clicar(elemento) {
      flushSync(() => elemento.click());
    },
    desmontar() {
      root.unmount();
      container.remove();
    },
  };
}

// conta as chamadas e se alguma foi durante o render (o abrirPorta() com parênteses)
export function criarEspiao() {
  const espiao = {
    chamadas: 0,
    chamadasDesenhando: 0,
    desenhando: false,
    fn: () => {
      espiao.chamadas += 1;
      if (espiao.desenhando) espiao.chamadasDesenhando += 1;
    },
  };
  return espiao;
}

// ignora acento, maiúscula e pontuação
export function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function acharTextoSolto(container) {
  const andarilho = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let no;
  while ((no = andarilho.nextNode())) {
    if (no.textContent.trim() && !no.parentElement.closest('[data-rn="Text"]')) {
      return no.textContent.trim();
    }
  }
  return null;
}

export function mensagemTextoSolto(texto) {
  return `O texto "${texto}" está solto. No React Native, todo texto precisa estar dentro de um \`<Text>\`. Num celular de verdade, isso fecha o app com o erro "Text strings must be rendered within a <Text> component".`;
}

export function acharPecas(container, tipo) {
  return [...container.querySelectorAll(`[data-masmorra="${tipo}"]`)];
}

export function acharBotao(container, modo) {
  return container.querySelector(modo === 'web' ? 'button' : '[data-rn="Pressable"]');
}

export const ok = (mensagem, extra) => ({ tipo: 'ok', mensagem, ...extra });
export const quase = (mensagem) => ({ tipo: 'quase', mensagem });
export const erro = (mensagem) => ({ tipo: 'erro', mensagem });
