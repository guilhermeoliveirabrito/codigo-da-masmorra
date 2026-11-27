// sons de 8 bits gerados com Web Audio (sem arquivo de áudio)
let contexto = null;
let ligado = true;

export function ligarSom(valor) {
  ligado = valor;
  if (!valor && contexto?.state === 'running') contexto.suspend();
}

function pegarContexto() {
  if (!ligado) return null;
  const Classe = window.AudioContext || window.webkitAudioContext;
  if (!Classe) return null;
  contexto ??= new Classe();
  if (contexto.state === 'suspended') contexto.resume();
  return contexto;
}

// a música usa o mesmo áudio, mas só depois que o navegador liberou (nunca cria ele antes de um clique)
export function audioLiberado() {
  return ligado && contexto?.state === 'running' ? contexto : null;
}

// o iPhone só deixa tocar som depois de um toque na tela
export function destravarSom() {
  try {
    pegarContexto();
  } catch {
    // sem som, segue o jogo
  }
}

function nota(ctx, { freq, ate, inicio = 0, duracao = 0.1, onda = 'square', volume = 0.1 }) {
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();
  const t = ctx.currentTime + inicio;
  oscilador.type = onda;
  oscilador.frequency.setValueAtTime(freq, t);
  if (ate) oscilador.frequency.exponentialRampToValueAtTime(ate, t + duracao);
  ganho.gain.setValueAtTime(volume, t);
  ganho.gain.exponentialRampToValueAtTime(0.001, t + duracao);
  oscilador.connect(ganho).connect(ctx.destination);
  oscilador.start(t);
  oscilador.stop(t + duracao + 0.02);
}

function chiado(ctx, { inicio = 0, duracao = 0.2, volume = 0.12, corte = 900 }) {
  const tamanho = Math.max(1, Math.floor(ctx.sampleRate * duracao));
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate);
  const amostras = buffer.getChannelData(0);
  for (let i = 0; i < tamanho; i++) amostras[i] = (Math.random() * 2 - 1) * (1 - i / tamanho);
  const fonte = ctx.createBufferSource();
  fonte.buffer = buffer;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = corte;
  const ganho = ctx.createGain();
  ganho.gain.value = volume;
  fonte.connect(filtro).connect(ganho).connect(ctx.destination);
  fonte.start(ctx.currentTime + inicio);
}

const melodia = (ctx, notas, passo, opcoes = {}) =>
  notas.forEach((freq, i) => nota(ctx, { freq, inicio: i * passo, duracao: passo * 1.4, ...opcoes }));

const SONS = {
  clique: (ctx) => nota(ctx, { freq: 620, duracao: 0.035, volume: 0.05 }),
  passar: (ctx) => nota(ctx, { freq: 990, duracao: 0.02, volume: 0.025 }),
  rodar: (ctx) => nota(ctx, { freq: 220, ate: 880, duracao: 0.14, onda: 'triangle', volume: 0.12 }),
  acerto: (ctx) => melodia(ctx, [523, 659, 784, 1047], 0.08, { volume: 0.08 }),
  quase: (ctx) => melodia(ctx, [440, 392], 0.11, { onda: 'triangle', volume: 0.12 }),
  erro: (ctx) => melodia(ctx, [196, 147], 0.15, { onda: 'sawtooth', volume: 0.06 }),
  moeda: (ctx) => {
    nota(ctx, { freq: 988, duracao: 0.07, volume: 0.07 });
    nota(ctx, { freq: 1319, inicio: 0.07, duracao: 0.28, volume: 0.07 });
  },
  estrela: (ctx) => nota(ctx, { freq: 1047, ate: 2093, duracao: 0.16, volume: 0.06 }),
  porta: (ctx) => {
    chiado(ctx, { duracao: 0.5, corte: 260, volume: 0.3 });
    nota(ctx, { freq: 70, ate: 40, duracao: 0.5, onda: 'triangle', volume: 0.18 });
  },
  viagem: (ctx) => chiado(ctx, { duracao: 0.45, corte: 1400, volume: 0.07 }),
  pagina: (ctx) => chiado(ctx, { duracao: 0.1, corte: 3200, volume: 0.05 }),
  conquista: (ctx) => melodia(ctx, [784, 988, 1175, 1568], 0.09, { volume: 0.07 }),
  fala: (ctx) => {
    for (let i = 0; i < 4; i++) {
      nota(ctx, { freq: 320 + Math.random() * 260, inicio: i * 0.065, duracao: 0.05, volume: 0.04 });
    }
  },
  miau: (ctx) => {
    nota(ctx, { freq: 520, ate: 820, duracao: 0.12, onda: 'triangle', volume: 0.1 });
    nota(ctx, { freq: 820, ate: 480, inicio: 0.12, duracao: 0.3, onda: 'triangle', volume: 0.1 });
  },
  segredo: (ctx) => {
    chiado(ctx, { duracao: 0.07, corte: 2600, volume: 0.06 });
    melodia(ctx, [1319, 1568, 2093, 2637], 0.06, { onda: 'triangle', volume: 0.08 });
  },
  // plim-plim de caixa registradora
  compra: (ctx) =>
    [988, 1319, 1568, 2093].forEach((freq, i) =>
      nota(ctx, { freq, inicio: i * 0.06, duracao: 0.09, onda: i < 2 ? 'square' : 'triangle', volume: 0.07 })
    ),
  bloop: (ctx) => nota(ctx, { freq: 260, ate: 620, duracao: 0.12, onda: 'sine', volume: 0.12 }),
  contar: (ctx) => nota(ctx, { freq: 1480, ate: 1980, duracao: 0.04, volume: 0.035 }),
  tique: (ctx) => nota(ctx, { freq: 1600, duracao: 0.03, volume: 0.05 }),
  gosma: (ctx) => nota(ctx, { freq: 190, ate: 55, duracao: 0.3, onda: 'sine', volume: 0.3 }),
  corvo: (ctx) => {
    nota(ctx, { freq: 620, ate: 380, duracao: 0.17, onda: 'sawtooth', volume: 0.05 });
    nota(ctx, { freq: 580, ate: 340, inicio: 0.22, duracao: 0.2, onda: 'sawtooth', volume: 0.05 });
  },
  golpe: (ctx) => {
    chiado(ctx, { duracao: 0.14, corte: 2600, volume: 0.2 });
    nota(ctx, { freq: 160, ate: 60, duracao: 0.14, volume: 0.08 });
  },
  rugido: (ctx) => {
    chiado(ctx, { duracao: 0.9, corte: 420, volume: 0.3 });
    nota(ctx, { freq: 95, ate: 50, duracao: 0.9, onda: 'sawtooth', volume: 0.08 });
  },
  fanfarra: (ctx) => melodia(ctx, [523, 523, 523, 659, 784, 659, 784, 1047], 0.11, { volume: 0.07 }),
};

export function tocar(nome) {
  try {
    const ctx = pegarContexto();
    if (ctx) SONS[nome]?.(ctx);
  } catch {
    // sem som, segue o jogo
  }
}

// som de passar o mouse: só toca se o áudio já foi liberado por um clique (não cria o contexto antes)
export function tocarDeLeve(nome) {
  if (ligado && contexto?.state === 'running') tocar(nome);
}
