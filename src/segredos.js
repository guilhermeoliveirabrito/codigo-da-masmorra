import { createContext } from 'react';

// Um segredo escondido em cada sala e um na tela inicial. Quem acha ganha moedas.
export const SEGREDOS = [
  'menu',
  'placa',
  'crachas',
  'alavanca',
  'tocha',
  'portoes',
  'ponte',
  'rio',
  'porta',
  'mensageiro',
  'guardiao',
];

export const MOEDAS_POR_SEGREDO = 15;

// qual segredo tem na sala que está na tela ({ id, tipo, x, y }) e quais já foram achados
export const SegredoDaSala = createContext(null);
export const SegredosAchados = createContext([]);

// igual às conquistas: quem acha avisa, o App guarda e mostra
const EVENTO = 'masmorra:segredo';

export function acharSegredo(id) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: id }));
}

export function ouvirSegredos(funcao) {
  const ouvinte = (evento) => funcao(evento.detail);
  window.addEventListener(EVENTO, ouvinte);
  return () => window.removeEventListener(EVENTO, ouvinte);
}
