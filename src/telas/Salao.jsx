import { memo, useLayoutEffect, useState } from 'react';
import { ALTURA, CHAO, LARGURA, ruido } from '../components/Cenario';

// O menu é um salão do tamanho da tela. A sala de sempre (192 x 108) fica embaixo, no meio,
// e a parede continua pros lados e pra cima. Em cima da sala só tem parede até aqui:
const TOPO_LIVRE = 26;
const FOLGA = 10;
const ESCALA_MAXIMA = 6;
// em tela em pé a sala pode passar um pouco da largura: nas pontas só tem barril e estandarte
const CORTE_DOS_LADOS = 1.25;

const iguais = (a, b) =>
  a && b && a.escala === b.escala && a.largura === b.largura && a.altura === b.altura && a.respiro === b.respiro;

// quanto vale um pixel de jogo na tela, pra caber o título e o menu em cima da sala
export function useSalao(salaoRef, conteudoRef, reguaRef) {
  const [medidas, setMedidas] = useState(null);

  useLayoutEffect(() => {
    const salao = salaoRef.current;
    const conteudo = conteudoRef.current;
    const regua = reguaRef.current;

    function medir() {
      const largura = salao.clientWidth;
      const alturaDaTela = regua.clientHeight;
      const alturaDoConteudo = conteudo.offsetHeight + FOLGA;
      const cabe = largura / LARGURA;
      let escala = Math.min(cabe * CORTE_DOS_LADOS, (alturaDaTela - alturaDoConteudo) / (ALTURA - TOPO_LIVRE), ESCALA_MAXIMA);
      // tela baixa demais: a sala não encolhe além disso, a página é que rola
      escala = Math.max(escala, Math.min(cabe, 1.4));
      escala = Math.floor(escala * 100) / 100;
      const alturaDaSala = (ALTURA - TOPO_LIVRE) * escala;
      // se a sala já chegou no tamanho máximo, o que sobra vai um pouco pra cima do título
      const sobra = alturaDaTela - alturaDoConteudo - alturaDaSala;
      const respiro = sobra > 0 ? Math.round(sobra * 0.4) : 0;
      const precisa = Math.ceil(respiro + alturaDoConteudo + alturaDaSala);
      // um pixel a mais de arredondamento não pode fazer a página rolar
      const altura = precisa > alturaDaTela + 1 ? precisa : alturaDaTela;
      const novas = { escala, largura, altura, respiro };
      setMedidas((atuais) => (iguais(atuais, novas) ? atuais : novas));
    }

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(salao);
    observador.observe(conteudo);
    observador.observe(regua);
    return () => observador.disconnect();
  }, [salaoRef, conteudoRef, reguaRef]);

  return medidas;
}

// área do salão em pixels de jogo, com a sala começando no (0, 0)
export function limitesDoSalao({ escala, largura, altura }) {
  const sobra = (largura / escala - LARGURA) / 2;
  return { x0: -sobra, y0: ALTURA - altura / escala, x1: LARGURA + sobra, y1: ALTURA };
}

const TONS = ['#3a4466', '#363f5f', '#3f4a6e', '#343d5c'];

function montarParede(x0, y0, x1) {
  const pedras = [];
  const detalhes = [];
  for (let linha = Math.floor(y0 / 8); linha * 8 < CHAO; linha++) {
    const y = linha * 8;
    const deslocamento = linha % 2 ? -8 : 0;
    for (let coluna = Math.floor(x0 / 16) - 1; coluna * 16 <= x1 + 16; coluna++) {
      const x = coluna * 16 + deslocamento;
      const sorte = ruido(linha, coluna);
      pedras.push({ x: x + 1, y: y + 1, w: 15, h: 7, c: TONS[Math.floor(sorte * 4)] });
      detalhes.push({ x: x + 1, y: y + 1, w: 15, h: 1, c: '#4a5679' });
      if (sorte > 0.82) detalhes.push({ x: x + 4 + Math.floor(sorte * 8), y: y + 3, w: 1, h: 3, c: '#262b44' });
      // mais perto do chão, mais musgo
      if (y > CHAO - 30 && ruido(coluna, linha) > 0.62) {
        detalhes.push({ x: x + 3, y: y + 7, w: 6, h: 1, c: '#265c42' });
        detalhes.push({ x: x + 5, y: y + 6, w: 2, h: 1, c: '#3e8948' });
      }
    }
  }
  return [...pedras, ...detalhes];
}

function montarChao(x0, x1) {
  const lajes = [
    { x: x0, y: CHAO, w: x1 - x0, h: 1, c: '#8b9bb4' },
    { x: x0, y: CHAO + 1, w: x1 - x0, h: 2, c: '#5a6988' },
    { x: x0, y: CHAO + 3, w: x1 - x0, h: ALTURA - CHAO - 3, c: '#2b3150' },
  ];
  for (let linha = 0; CHAO + 3 + linha * 9 < ALTURA; linha++) {
    const y = CHAO + 3 + linha * 9;
    lajes.push({ x: x0, y, w: x1 - x0, h: 1, c: '#1f2338' });
    for (let x = Math.floor(x0 / 24) * 24 + (linha % 2 ? 12 : 0) - 24; x < x1; x += 24) {
      lajes.push({ x, y, w: 1, h: 9, c: '#1f2338' });
      lajes.push({ x: x + 1, y: y + 1, w: 23, h: 1, c: '#353c5e' });
    }
  }
  return lajes;
}

const TEIA = ['wwwwwwwwwwww', 'ww..w...w..w', 'w.w..w.w..w.', 'w..wwwww....', 'ww.w.w..w...', 'w.ww.w......', 'w..ww.......', 'w.w.w.......', 'ww..........', 'w...........', 'w...........'];

function montarTeias(x0, y0, x1) {
  const pontos = [];
  TEIA.forEach((linha, y) => {
    [...linha].forEach((letra, x) => {
      if (letra !== 'w') return;
      pontos.push({ x: x0 + x, y: y0 + y, w: 1, h: 1, c: '#c0cbdc' });
      pontos.push({ x: x1 - 1 - x, y: y0 + y, w: 1, h: 1, c: '#c0cbdc' });
    });
  });
  return pontos;
}

// um <path> por cor, na ordem em que as cores aparecem (pedras antes dos detalhes)
function caminhos(lista, prefixo) {
  const porCor = new Map();
  for (const r of lista) porCor.set(r.c, (porCor.get(r.c) ?? '') + `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`);
  return [...porCor].map(([cor, d]) => <path key={`${prefixo}${cor}`} d={d} fill={cor} />);
}

export const FundoDoSalao = memo(function FundoDoSalao({ x0, y0, x1, y1 }) {
  // arredonda pra fora, pra parede nunca acabar antes da tela
  const esquerda = Math.floor(x0);
  const topo = Math.floor(y0);
  const direita = Math.ceil(x1);
  return (
    <svg
      className="salao__fundo"
      viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x={esquerda} y={topo} width={direita - esquerda} height={CHAO - topo} fill="#262b44" />
      {caminhos(montarParede(esquerda, topo, direita), 'p')}
      {caminhos(montarChao(esquerda, direita), 'c')}
      <g opacity="0.3">{caminhos(montarTeias(Math.ceil(x0), Math.ceil(y0), Math.floor(x1)), 't')}</g>
    </svg>
  );
});
