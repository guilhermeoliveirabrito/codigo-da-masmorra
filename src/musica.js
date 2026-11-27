import { audioLiberado } from './som';

// Música de 8 bits tocada na hora: um sequenciador simples que agenda as notas um pouco à frente.
// Cada canal é uma fileira de passos: nota (A2, C#4...), "-" segura a anterior, "." é silêncio.
// Na bateria: o = bumbo, s = caixa, x = chimbal.

const TRILHAS = {
  // menu, mapa e fases: lá menor, devagar
  calma: {
    bpm: 84,
    canais: [
      {
        onda: 'triangle',
        volume: 0.09,
        passos: `
          A2 - - - E2 - - -  F2 - - - C3 - - -  C3 - - - G2 - - -  G2 - - - D3 - - -
          A2 - - - E2 - - -  F2 - - - C3 - - -  E2 - - - B2 - - -  E2 - - - G#2 - - -`,
      },
      {
        onda: 'triangle',
        volume: 0.035,
        passos: `
          A3 C4 E4 A4 E4 C4 E4 C4  F3 A3 C4 F4 C4 A3 C4 A3  C4 E4 G4 C5 G4 E4 G4 E4  G3 B3 D4 G4 D4 B3 D4 B3
          A3 C4 E4 A4 E4 C4 E4 C4  F3 A3 C4 F4 C4 A3 C4 A3  E3 G#3 B3 E4 B3 G#3 B3 G#3  E3 G#3 B3 E4 D4 B3 G#3 B3`,
      },
      {
        onda: 'square',
        volume: 0.022,
        passos: `
          A4 - - - C5 - E5 -  F5 - - E5 C5 - - -  G4 - - - C5 - E5 -  D5 - - - B4 - - -
          A4 - - - C5 - E5 -  A5 - - G5 F5 - E5 -  E5 - - D5 B4 - - -  G#4 - - - . . . .`,
      },
    ],
  },
  // caça aos bugs: rápida, com bateria
  corrida: {
    bpm: 138,
    canais: [
      {
        onda: 'square',
        volume: 0.03,
        passos: `
          A2 A3 A2 A3 A2 A3 A2 A3  G2 G3 G2 G3 G2 G3 G2 G3  F2 F3 F2 F3 F2 F3 F2 F3  E2 E3 E2 E3 E2 E3 G#2 B2
          A2 A3 A2 A3 A2 A3 A2 A3  G2 G3 G2 G3 G2 G3 G2 G3  F2 F3 F2 F3 F2 F3 F2 F3  E2 E3 E2 E3 G#2 B2 E3 G#3`,
      },
      {
        onda: 'square',
        volume: 0.024,
        passos: `
          A4 C5 E5 C5 A5 - G5 E5  D5 - B4 - G4 B4 D5 -  C5 - A4 - F4 A4 C5 F5  E5 - D5 - B4 - G#4 -
          A4 C5 E5 C5 A5 - B5 C6  B5 - G5 - D5 - G5 -  A5 G5 F5 E5 F5 - C5 -  E5 - G#5 - B5 - E6 -`,
      },
      {
        bateria: true,
        volume: 0.05,
        passos: `
          o x s x o x s x  o x s x o x s x  o x s x o x s x  o x s x o o s s
          o x s x o x s x  o x s x o x s x  o x s x o x s x  o x s x s s s s`,
      },
    ],
  },
};

const NOTAS = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };

function frequencia(nome) {
  const [, letra, acidente, oitava] = nome.match(/^([A-G])(#?)(\d)$/);
  const semitons = NOTAS[letra] + (acidente ? 1 : 0) + (Number(oitava) - 4) * 12;
  return 440 * 2 ** (semitons / 12);
}

// "A2 - - E2" vira [{ nota: 'A2', passos: 3 }, null, null, { nota: 'E2', passos: 1 }]
function lerCanal(texto) {
  const passos = texto.trim().split(/\s+/);
  return passos.map((passo, i) => {
    if (passo === '-' || passo === '.') return null;
    let dura = 1;
    while (passos[i + dura] === '-') dura++;
    return { nota: passo, passos: dura };
  });
}

const LIDAS = Object.fromEntries(
  Object.entries(TRILHAS).map(([nome, trilha]) => {
    const canais = trilha.canais.map((canal) => ({ ...canal, passos: lerCanal(canal.passos) }));
    return [nome, { ...trilha, canais, tamanho: canais[0].passos.length }];
  })
);

const ADIANTE = 0.25;
let ligada = true;
let pedida = null; // a trilha que a tela quer
let ritmo = 1;
let tocando = null; // { nome, passo, tempo, saida }
let relogio = null;
let chiado = null;

function tocarNota(ctx, saida, { freq, tempo, duracao, onda, volume }) {
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();
  oscilador.type = onda;
  oscilador.frequency.setValueAtTime(freq, tempo);
  ganho.gain.setValueAtTime(0.0001, tempo);
  ganho.gain.exponentialRampToValueAtTime(volume, tempo + 0.012);
  ganho.gain.exponentialRampToValueAtTime(volume * 0.6, tempo + Math.min(0.12, duracao * 0.5));
  ganho.gain.exponentialRampToValueAtTime(0.0001, tempo + duracao);
  oscilador.connect(ganho).connect(saida);
  oscilador.start(tempo);
  oscilador.stop(tempo + duracao + 0.02);
}

function tocarBateria(ctx, saida, golpe, tempo, volume) {
  if (golpe === 'o') {
    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();
    oscilador.frequency.setValueAtTime(150, tempo);
    oscilador.frequency.exponentialRampToValueAtTime(40, tempo + 0.12);
    ganho.gain.setValueAtTime(volume * 2.2, tempo);
    ganho.gain.exponentialRampToValueAtTime(0.0001, tempo + 0.14);
    oscilador.connect(ganho).connect(saida);
    oscilador.start(tempo);
    oscilador.stop(tempo + 0.16);
    return;
  }
  if (!chiado || chiado.sampleRate !== ctx.sampleRate) {
    chiado = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
    const amostras = chiado.getChannelData(0);
    for (let i = 0; i < amostras.length; i++) amostras[i] = Math.random() * 2 - 1;
  }
  const fonte = ctx.createBufferSource();
  fonte.buffer = chiado;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'highpass';
  filtro.frequency.value = golpe === 'x' ? 7000 : 1800;
  const ganho = ctx.createGain();
  const dura = golpe === 'x' ? 0.04 : 0.11;
  ganho.gain.setValueAtTime(golpe === 'x' ? volume * 0.5 : volume, tempo);
  ganho.gain.exponentialRampToValueAtTime(0.0001, tempo + dura);
  fonte.connect(filtro).connect(ganho).connect(saida);
  fonte.start(tempo);
  fonte.stop(tempo + dura + 0.02);
}

function agendar() {
  const ctx = audioLiberado();
  const querida = ligada && !document.hidden ? pedida : null;
  if (!ctx || !querida) {
    if (tocando) parar(ctx);
    return;
  }
  if (tocando?.nome !== querida) {
    if (tocando) parar(ctx);
    const saida = ctx.createGain();
    saida.gain.value = 0.8;
    saida.connect(ctx.destination);
    tocando = { nome: querida, passo: 0, tempo: ctx.currentTime + 0.05, saida };
  }
  const trilha = LIDAS[tocando.nome];
  const duracaoDoPasso = 60 / trilha.bpm / 2 / ritmo;
  // voltando de uma aba escondida, não toca o atraso todo de uma vez
  if (tocando.tempo < ctx.currentTime - 0.1) tocando.tempo = ctx.currentTime + 0.05;
  while (tocando.tempo < ctx.currentTime + ADIANTE) {
    for (const canal of trilha.canais) {
      const passo = canal.passos[tocando.passo];
      if (!passo) continue;
      if (canal.bateria) tocarBateria(ctx, tocando.saida, passo.nota, tocando.tempo, canal.volume);
      else {
        tocarNota(ctx, tocando.saida, {
          freq: frequencia(passo.nota),
          tempo: tocando.tempo,
          duracao: passo.passos * duracaoDoPasso * 0.92,
          onda: canal.onda,
          volume: canal.volume,
        });
      }
    }
    tocando.tempo += duracaoDoPasso;
    tocando.passo = (tocando.passo + 1) % trilha.tamanho;
  }
}

// some aos poucos, sem estalo
function parar(ctx) {
  const { saida } = tocando;
  tocando = null;
  if (!ctx) return;
  saida.gain.setValueAtTime(saida.gain.value, ctx.currentTime);
  saida.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  setTimeout(() => saida.disconnect(), 400);
}

function garantirRelogio() {
  relogio ??= setInterval(agendar, 60);
}

export function tocarMusica(nome) {
  pedida = nome;
  ritmo = 1;
  garantirRelogio();
  agendar();
}

export function ritmoDaMusica(fator) {
  ritmo = fator;
}

export function ligarMusica(valor) {
  ligada = valor;
  garantirRelogio();
  agendar();
}
