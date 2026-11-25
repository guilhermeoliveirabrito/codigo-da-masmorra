import { memo } from 'react';
import { TOCHA } from '../pixel/desenhos';
import { PERSONAGENS } from '../pixel/personagens';
import { Sprite } from '../pixel/Sprite';
import { Seguro } from './Seguro';

// 192 x 108 pixels de jogo, esticados pra largura da tela
export const LARGURA = 192;
export const ALTURA = 108;
export const CHAO = 80;

export function posicao(x, y, largura, altura) {
  const estilo = { left: `${(x / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` };
  if (largura !== undefined) estilo.width = `${(largura / LARGURA) * 100}%`;
  if (altura !== undefined) estilo.height = `${(altura / ALTURA) * 100}%`;
  return estilo;
}

// pseudo-aleatório, pra parede sair sempre igual
function ruido(a, b) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

const TONS_DA_PEDRA = ['#3a4466', '#363f5f', '#3f4a6e', '#343d5c'];

function montarParede() {
  const pedras = [];
  for (let linha = 0; linha * 8 < CHAO; linha++) {
    const y = linha * 8;
    const deslocamento = linha % 2 ? -8 : 0;
    for (let coluna = 0; coluna <= LARGURA / 16; coluna++) {
      const x = coluna * 16 + deslocamento;
      const sorte = ruido(linha, coluna);
      pedras.push({ x: x + 1, y: y + 1, w: 15, h: 7, c: TONS_DA_PEDRA[Math.floor(sorte * 4)] });
      pedras.push({ x: x + 1, y: y + 1, w: 15, h: 1, c: '#4a5679' });
      if (sorte > 0.82) pedras.push({ x: x + 4 + Math.floor(sorte * 8), y: y + 3, w: 1, h: 3, c: '#262b44' });
      if (linha >= 8 && ruido(coluna, linha) > 0.6) {
        pedras.push({ x: x + 3, y: y + 7, w: 6, h: 1, c: '#265c42' });
        pedras.push({ x: x + 5, y: y + 6, w: 2, h: 1, c: '#3e8948' });
      }
    }
  }
  return pedras;
}

function montarChao() {
  const lajes = [
    { x: 0, y: CHAO, w: LARGURA, h: 1, c: '#8b9bb4' },
    { x: 0, y: CHAO + 1, w: LARGURA, h: 2, c: '#5a6988' },
    { x: 0, y: CHAO + 3, w: LARGURA, h: ALTURA - CHAO - 3, c: '#2b3150' },
  ];
  for (let linha = 0; CHAO + 3 + linha * 9 < ALTURA; linha++) {
    const y = CHAO + 3 + linha * 9;
    lajes.push({ x: 0, y, w: LARGURA, h: 1, c: '#1f2338' });
    for (let x = linha % 2 ? 12 : 0; x < LARGURA; x += 24) {
      lajes.push({ x, y, w: 1, h: 9, c: '#1f2338' });
      lajes.push({ x: x + 1, y: y + 1, w: 23, h: 1, c: '#353c5e' });
    }
  }
  return lajes;
}

const PAREDE = montarParede();
const PISO = montarChao();

const ParedeEChao = memo(function ParedeEChao() {
  return (
    <>
      <rect width={LARGURA} height={CHAO} fill="#262b44" />
      {PAREDE.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
      ))}
      {PISO.map((p, i) => (
        <rect key={`c${i}`} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
      ))}
    </>
  );
});

export function Cena({ modo, tochas = [12, 172], alturaDasTochas = 14, children, fundo, className = '' }) {
  return (
    <div className={`cena ${className}`}>
      <svg
        className="cena__fundo"
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="luz-da-tocha">
            <stop offset="0" stopColor="#f77622" stopOpacity="0.32" />
            <stop offset="1" stopColor="#f77622" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sombra-da-cena" r="0.75">
            <stop offset="0.55" stopColor="#181425" stopOpacity="0" />
            <stop offset="1" stopColor="#181425" stopOpacity="0.7" />
          </radialGradient>
        </defs>
        <ParedeEChao />
        {fundo}
        {tochas.map((x) => (
          <circle key={x} cx={x + 4} cy={alturaDasTochas + 6} r={44} fill="url(#luz-da-tocha)" />
        ))}
        <rect width={LARGURA} height={ALTURA} fill="url(#sombra-da-cena)" />
      </svg>

      {tochas.map((x) => (
        <Sprite key={x} desenho={TOCHA} className="tocha" style={posicao(x, alturaDasTochas, 8, 14)} />
      ))}

      {children}

      {modo && <span className="cena__modo">{modo === 'web' ? 'Modo Web' : 'Modo Mobile'}</span>}
    </div>
  );
}

// entrada: 'esquerda' ou 'direita', de onde o personagem chega andando
export function Personagem({ quem, x, y, fala, lado = 'centro', entrada, className = '', style }) {
  const { nome, desenho } = PERSONAGENS[quem];
  const camadas = desenho.camadas;
  const largura = camadas[0][0].length;
  const altura = camadas[0].length;
  const classeDeEntrada = entrada ? `personagem--entra-${entrada}` : '';

  return (
    <div
      className={`personagem ${classeDeEntrada} ${className}`}
      style={{ ...posicao(x, y, largura, altura), ...style }}
    >
      {fala && <span className={`balao balao--${lado}`}>{fala}</span>}
      <Sprite desenho={desenho} titulo={nome} className="personagem__sprite" />
    </div>
  );
}

export function Tela({ modo, vazio, className = '', style, children }) {
  return (
    <div className={`tela tela--${modo} ${className}`} style={style}>
      {children ? <Seguro>{children}</Seguro> : <span className="tela__vazia">{vazio}</span>}
    </div>
  );
}

const DIRECOES_DOS_BRILHOS = Array.from({ length: 10 }, (_, i) => {
  const angulo = (i / 10) * Math.PI * 2;
  const distancia = 7 + (i % 3) * 2;
  return [Math.cos(angulo) * distancia, Math.sin(angulo) * distancia];
});

// faíscas que saem de um ponto da cena quando a fase dá certo
export function Brilhos({ x, y }) {
  return (
    <div className="brilhos" style={posicao(x, y)} aria-hidden="true">
      {DIRECOES_DOS_BRILHOS.map(([dx, dy], i) => (
        <span
          key={i}
          style={{ '--dx': `${dx.toFixed(1)}cqw`, '--dy': `${dy.toFixed(1)}cqw`, animationDelay: `${(i % 3) * 70}ms` }}
        />
      ))}
    </div>
  );
}
