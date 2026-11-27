import { memo, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { conquistar } from '../conquistas';
import { ContextoDaConversa } from '../conversa';
import { semAnimacao } from '../hooks/useTransicao';
import { GATO, TOCHA } from '../pixel/desenhos';
import { PERSONAGENS } from '../pixel/personagens';
import { Sprite, tamanhoDoDesenho } from '../pixel/Sprite';
import { tocar } from '../som';
import { Seguro } from './Seguro';

// 192 x 108 pixels de jogo, esticados pra largura da tela
export const LARGURA = 192;
export const ALTURA = 108;
export const CHAO = 80;

// pixels de jogo por segundo
const VELOCIDADE = 56;

export function posicao(x, y, largura, altura) {
  const estilo = { left: `${(x / LARGURA) * 100}%`, top: `${(y / ALTURA) * 100}%` };
  if (largura !== undefined) estilo.width = `${(largura / LARGURA) * 100}%`;
  if (altura !== undefined) estilo.height = `${(altura / ALTURA) * 100}%`;
  return estilo;
}

// pixels de jogo pra unidade da cena (100cqw é a largura inteira)
const emCqw = (pixels) => `${((pixels / LARGURA) * 100).toFixed(2)}cqw`;

// pseudo-aleatório, pra parede sair sempre igual
export function ruido(a, b) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

const TONS_DA_PEDRA = ['#3a4466', '#363f5f', '#3f4a6e', '#343d5c'];

export function montarParede(largura = LARGURA, periodo = Infinity) {
  const pedras = [];
  for (let linha = 0; linha * 8 < CHAO; linha++) {
    const y = linha * 8;
    const deslocamento = linha % 2 ? -8 : 0;
    for (let coluna = 0; coluna <= largura / 16; coluna++) {
      const x = coluna * 16 + deslocamento;
      // com período, o desenho se repete e dá pra rolar a parede sem emenda
      const c = coluna % (periodo / 16);
      const sorte = ruido(linha, c);
      pedras.push({ x: x + 1, y: y + 1, w: 15, h: 7, c: TONS_DA_PEDRA[Math.floor(sorte * 4)] });
      pedras.push({ x: x + 1, y: y + 1, w: 15, h: 1, c: '#4a5679' });
      if (sorte > 0.82) pedras.push({ x: x + 4 + Math.floor(sorte * 8), y: y + 3, w: 1, h: 3, c: '#262b44' });
      if (linha >= 8 && ruido(c, linha) > 0.6) {
        pedras.push({ x: x + 3, y: y + 7, w: 6, h: 1, c: '#265c42' });
        pedras.push({ x: x + 5, y: y + 6, w: 2, h: 1, c: '#3e8948' });
      }
    }
  }
  return pedras;
}

export function montarChao(largura = LARGURA) {
  const lajes = [
    { x: 0, y: CHAO, w: largura, h: 1, c: '#8b9bb4' },
    { x: 0, y: CHAO + 1, w: largura, h: 2, c: '#5a6988' },
    { x: 0, y: CHAO + 3, w: largura, h: ALTURA - CHAO - 3, c: '#2b3150' },
  ];
  for (let linha = 0; CHAO + 3 + linha * 9 < ALTURA; linha++) {
    const y = CHAO + 3 + linha * 9;
    lajes.push({ x: 0, y, w: largura, h: 1, c: '#1f2338' });
    for (let x = linha % 2 ? 12 : 0; x < largura; x += 24) {
      lajes.push({ x, y, w: 1, h: 9, c: '#1f2338' });
      lajes.push({ x: x + 1, y: y + 1, w: 23, h: 1, c: '#353c5e' });
    }
  }
  return lajes;
}

// teia no canto de cima, desenhada pro canto esquerdo (o direito é espelhado)
const TEIA = [
  'wwwwwwwwww',
  'ww..w...w.',
  'w.w..w.w..',
  'w..wwwww..',
  'ww.w.w....',
  'w.ww.w....',
  'w..ww.....',
  'w.w.......',
  'ww........',
  'w.........',
];

function pontosDaTeia(espelhada) {
  const pontos = [];
  TEIA.forEach((linha, y) => {
    [...linha].forEach((letra, x) => {
      if (letra === 'w') pontos.push({ x: espelhada ? LARGURA - 1 - x : x, y });
    });
  });
  return pontos;
}

const PAREDE = montarParede();
const PISO = montarChao();
const TEIAS = [...pontosDaTeia(false), ...pontosDaTeia(true)];

export function Retangulos({ lista }) {
  return lista.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />);
}

const ParedeEChao = memo(function ParedeEChao() {
  return (
    <>
      <rect width={LARGURA} height={CHAO} fill="#262b44" />
      <Retangulos lista={PAREDE} />
      <Retangulos lista={PISO} />
      <g opacity="0.35">
        {TEIAS.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#c0cbdc" />
        ))}
      </g>
    </>
  );
});

// fagulhas subindo das tochas
const BRASAS = [
  { dx: 1, atraso: 0, lado: -1 },
  { dx: 5, atraso: 0.9, lado: 1 },
  { dx: 3, atraso: 1.7, lado: -1 },
];

function Brasas({ tochas, altura }) {
  return tochas.flatMap((x) =>
    BRASAS.map(({ dx, atraso, lado }, i) => (
      <span
        key={`${x}-${i}`}
        className="brasa"
        style={{ ...posicao(x + dx, altura + 2), animationDelay: `${atraso + (x % 7) * 0.13}s`, '--lado': lado }}
      />
    ))
  );
}

// solta: sem parede, chão e moldura (o menu desenha um salão inteiro em volta)
export function Cena({ modo, tochas = [12, 172], alturaDasTochas = 14, children, fundo, solta, className = '', style }) {
  return (
    <div className={`cena ${solta ? 'cena--solta' : ''} ${className}`} style={style}>
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
        {!solta && <ParedeEChao />}
        {fundo}
        {tochas.map((x) => (
          <circle key={x} className="cena__luz" cx={x + 4} cy={alturaDasTochas + 6} r={44} fill="url(#luz-da-tocha)" />
        ))}
        {!solta && <rect width={LARGURA} height={ALTURA} fill="url(#sombra-da-cena)" />}
      </svg>

      {tochas.map((x) => (
        <Sprite key={x} desenho={TOCHA} className="tocha" style={posicao(x, alturaDasTochas, 8, 14)} />
      ))}
      <Brasas tochas={tochas} altura={alturaDasTochas} />

      {children}
      <Gato />

      {modo && <span className="cena__modo">{modo === 'web' ? 'Modo Web' : 'Modo Mobile'}</span>}
    </div>
  );
}

// De vez em quando um gato atravessa a sala. Quem clicar nele ganha um amigo.
function Gato() {
  const [passeio, setPasseio] = useState(null);
  const [carinho, setCarinho] = useState(false);

  useEffect(() => {
    let espera;
    const agendar = (ms) => {
      espera = setTimeout(() => {
        if (!document.hidden && !semAnimacao()) {
          setCarinho(false);
          setPasseio({ id: Date.now(), para: Math.random() < 0.5 ? 'direita' : 'esquerda' });
        }
        agendar(35_000 + Math.random() * 40_000);
      }, ms);
    };
    agendar(18_000 + Math.random() * 27_000);
    return () => clearTimeout(espera);
  }, []);

  if (!passeio) return null;
  return (
    <button
      key={passeio.id}
      type="button"
      className={`gato gato--para-${passeio.para}`}
      style={posicao(0, 89, 15, 10)}
      aria-label="Gato"
      onAnimationEnd={(evento) => evento.target === evento.currentTarget && setPasseio(null)}
      onClick={() => {
        tocar('miau');
        setCarinho(true);
        conquistar('gato');
      }}
    >
      <Sprite desenho={GATO} className="gato__sprite" />
      {carinho && <span className="gato__coracao" />}
    </button>
  );
}

// o balão da conversa é largo: abre pro lado que tem espaço
const ladoDaConversa = (x) => (x < 56 ? 'esquerda' : x > 120 ? 'direita' : 'centro');

// quando o x muda, o personagem anda até lá
// entrada: de que lado ele chega | viajante: sai pela direita na troca de fase
// some: desaparece quando chega (entrou numa porta)
export function Personagem({
  quem,
  x,
  y,
  fala,
  lado = 'centro',
  entrada,
  viajante,
  some,
  velocidade = VELOCIDADE,
  atrasoDaEntrada = 0,
  className = '',
  style,
  children,
}) {
  const { nome, desenho, andando } = PERSONAGENS[quem];
  const { largura, altura } = tamanhoDoDesenho(desenho);
  const ref = useRef(null);
  const [movimento, setMovimento] = useState(null); // null, 'direita' ou 'esquerda'
  const conversa = useContext(ContextoDaConversa);
  const falaDaConversa = conversa?.fala?.quem === quem ? conversa.fala : null;
  // um fala de cada vez: se outro está conversando, a fala fixa espera
  const outroFalando = Boolean(conversa?.fala) && !falaDaConversa;

  // quem sai andando para de conversar (o balão trocaria de lado no meio do caminho)
  const xDaConversa = useRef(x);
  const calar = conversa?.calar;
  useLayoutEffect(() => {
    if (xDaConversa.current === x) return;
    xDaConversa.current = x;
    calar?.(quem);
  }, [x, quem, calar]);

  // lembra de onde ele veio, pra saber quanto tempo o passo leva e pra que lado virar
  const [rastro, setRastro] = useState({ x, tempo: 0, para: 'direita' });
  if (rastro.x !== x) {
    setRastro({ x, tempo: Math.abs(x - rastro.x) / velocidade, para: x > rastro.x ? 'direita' : 'esquerda' });
  }
  const paraRef = useRef(rastro.para);
  useLayoutEffect(() => {
    paraRef.current = rastro.para;
  });

  // o navegador avisa quando o movimento começa e termina; é aí que troca o desenho
  useLayoutEffect(() => {
    const elemento = ref.current;
    let parar;
    const deste = (evento) => evento.target === elemento;
    const comecar = (para) => {
      clearTimeout(parar);
      setMovimento(para);
    };
    // espera um pouquinho antes de parar, pra não piscar entre um pulo e outro
    const terminar = () => {
      clearTimeout(parar);
      parar = setTimeout(() => setMovimento(null), 90);
    };

    function aoComecarTransicao(evento) {
      if (!deste(evento)) return;
      if (evento.propertyName === 'left') comecar(paraRef.current);
      else if (evento.propertyName === 'translate') comecar('direita');
    }
    function aoTerminarTransicao(evento) {
      if (deste(evento) && (evento.propertyName === 'left' || evento.propertyName === 'translate')) terminar();
    }
    function aoComecarAnimacao(evento) {
      if (deste(evento) && evento.animationName === 'entrar') {
        comecar(elemento.dataset.entrada === 'direita' ? 'esquerda' : 'direita');
      }
    }
    function aoTerminarAnimacao(evento) {
      if (deste(evento) && evento.animationName === 'entrar') terminar();
    }

    const ouvintes = [
      ['transitionrun', aoComecarTransicao],
      ['transitionend', aoTerminarTransicao],
      ['transitioncancel', aoTerminarTransicao],
      ['animationstart', aoComecarAnimacao],
      ['animationend', aoTerminarAnimacao],
      ['animationcancel', aoTerminarAnimacao],
    ];
    ouvintes.forEach(([nomeDoEvento, funcao]) => elemento.addEventListener(nomeDoEvento, funcao));
    return () => {
      clearTimeout(parar);
      ouvintes.forEach(([nomeDoEvento, funcao]) => elemento.removeEventListener(nomeDoEvento, funcao));
    };
  }, []);

  const distanciaDaEntrada = entrada === 'direita' ? LARGURA - x + 2 : x + largura + 2;
  const distanciaDaSaida = LARGURA - x + 4;
  const estilo = {
    ...posicao(x, y, largura, altura),
    // a ponta do balão mira aqui
    '--meio': emCqw(largura / 2),
    '--tempo-de-andar': `${rastro.tempo.toFixed(2)}s`,
    '--entrada-de': entrada === 'direita' ? emCqw(distanciaDaEntrada) : `-${emCqw(distanciaDaEntrada)}`,
    '--tempo-de-entrada': `${(distanciaDaEntrada / velocidade).toFixed(2)}s`,
    '--atraso-da-entrada': `${atrasoDaEntrada}s`,
    '--ate-a-saida': emCqw(distanciaDaSaida),
    '--tempo-da-saida': `${(distanciaDaSaida / (velocidade * 1.6)).toFixed(2)}s`,
    ...style,
  };

  const classes = [
    'personagem',
    entrada && 'personagem--entra',
    viajante && 'personagem--viajante',
    some && 'personagem--some',
    movimento && 'personagem--anda',
    movimento === 'esquerda' && 'personagem--para-esquerda',
    className,
  ];

  return (
    <div ref={ref} className={classes.filter(Boolean).join(' ')} style={estilo} data-entrada={entrada}>
      <span className="personagem__sombra" />
      {falaDaConversa ? (
        <span key={falaDaConversa.id} className={`balao balao--${ladoDaConversa(x)} balao--conversa`}>
          {falaDaConversa.texto}
        </span>
      ) : (
        fala && !outroFalando && <span className={`balao balao--${lado}`}>{fala}</span>
      )}
      {conversa ? (
        <button type="button" className="personagem__botao" aria-label={`Conversar com ${nome}`} onClick={() => conversa.cutucar(quem)}>
          <Sprite desenho={movimento && andando ? andando : desenho} className="personagem__sprite" />
        </button>
      ) : (
        <Sprite desenho={movimento && andando ? andando : desenho} titulo={nome} className="personagem__sprite" />
      )}
      {children}
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
