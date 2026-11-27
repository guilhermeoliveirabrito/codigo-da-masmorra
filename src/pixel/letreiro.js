// Letreiro do título, letra por letra em pixel: contorno escuro e profundidade embaixo

const GRANDES = {
  M: ['##.....##', '###...###', '####.####', '##.###.##', '##..#..##', '##.....##', '##.....##', '##.....##', '##.....##'],
  A: ['..####..', '.######.', '###..###', '##....##', '##....##', '########', '########', '##....##', '##....##'],
  S: ['.######.', '########', '##......', '#######.', '.#######', '......##', '......##', '########', '.######.'],
  O: ['.######.', '########', '##....##', '##....##', '##....##', '##....##', '##....##', '########', '.######.'],
  R: ['#######.', '########', '##....##', '##....##', '########', '#######.', '##..##..', '##...##.', '##....##'],
  '<': ['.....#', '....##', '...##.', '..##..', '.##...', '..##..', '...##.', '....##', '.....#'],
  '/': ['....##', '....##', '...##.', '...##.', '..##..', '.##...', '.##...', '##....', '##....'],
  '>': ['#.....', '##....', '.##...', '..##..', '...##.', '..##..', '.##...', '##....', '#.....'],
};

// as pequenas têm 3 linhas em cima pro acento
const PEQUENAS = {
  C: ['.####.', '######', '##....', '##....', '##....', '######', '.####.'],
  O: ['.####.', '######', '##..##', '##..##', '##..##', '######', '.####.'],
  D: ['#####.', '######', '##..##', '##..##', '##..##', '######', '#####.'],
  I: ['##', '##', '##', '##', '##', '##', '##'],
  G: ['.####.', '######', '##....', '##.###', '##..##', '######', '.####.'],
  A: ['.####.', '######', '##..##', '######', '##..##', '##..##', '##..##'],
};
const ACENTO = ['...##.', '..##..'];

const ESTILOS = {
  pedra: {
    cores: ['#ffffff', '#c0cbdc', '#c0cbdc', '#c0cbdc', '#8b9bb4', '#8b9bb4', '#8b9bb4'],
    fundo: ['#5a6988', '#3a4466'],
  },
  ouro: {
    cores: ['#fee761', '#fee761', '#feae34', '#feae34', '#feae34', '#f77622', '#f77622', '#f77622', '#f77622'],
    fundo: ['#be4a2f', '#733e39'],
  },
  codigo: {
    cores: ['#2ce8f5', '#2ce8f5', '#2ce8f5', '#2ce8f5', '#0099db', '#0099db', '#0099db', '#0099db', '#0099db'],
    fundo: ['#124e89', '#262b44'],
  },
};

const CONTORNO = '#181425';

// cada pixel vira uma chave "x,y" num Map com a cor
function pintar(mapa, x, y, cor) {
  mapa.set(`${x},${y}`, { x, y, cor });
}

function escrever(texto, fonte, estiloDe) {
  const pixels = [];
  let x = 0;
  for (const letra of texto) {
    if (letra === ' ') {
      x += 3;
      continue;
    }
    const pequena = fonte === PEQUENAS;
    const base = pequena ? fonte[letra === 'Ó' ? 'O' : letra] : fonte[letra];
    const linhas = pequena ? [...(letra === 'Ó' ? ACENTO : ['', '']), '', ...base] : base;
    const estilo = estiloDe(letra);
    linhas.forEach((linha, y) => {
      [...linha].forEach((c, dx) => {
        if (c !== '#') return;
        const acento = pequena && y < 2;
        const linhaDaLetra = pequena ? y - 3 : y;
        pixels.push({ x: x + dx, y, cor: acento ? '#feae34' : estilo.cores[linhaDaLetra], estilo, acento });
      });
    });
    x += base[0].length + 1;
  }
  return { pixels, largura: x - 1 };
}

export function montarLetreiro() {
  const cima = escrever('CÓDIGO DA', PEQUENAS, () => ESTILOS.pedra);
  const baixo = escrever('<MASMORRA />', GRANDES, (letra) => (/[</>]/.test(letra) ? ESTILOS.codigo : ESTILOS.ouro));

  const margem = 1;
  const largura = Math.max(cima.largura, baixo.largura) + margem * 2;
  const topoDeBaixo = 12;
  const letras = [
    ...cima.pixels.map((p) => ({ ...p, x: p.x + margem + Math.floor((largura - 2 * margem - cima.largura) / 2), y: p.y + margem })),
    ...baixo.pixels.map((p) => ({ ...p, x: p.x + margem, y: p.y + margem + topoDeBaixo })),
  ];
  const cheio = new Set(letras.map((p) => `${p.x},${p.y}`));

  // profundidade: a letra repetida pra baixo, cada vez mais escura (vale o tom mais perto da letra)
  const profundidade = new Map();
  for (const p of letras) {
    if (p.acento) continue;
    for (let nivel = 1; nivel <= p.estilo.fundo.length; nivel++) {
      const chave = `${p.x},${p.y + nivel}`;
      if (cheio.has(chave)) break;
      const atual = profundidade.get(chave);
      if (!atual || atual.nivel > nivel) {
        profundidade.set(chave, { x: p.x, y: p.y + nivel, nivel, cor: p.estilo.fundo[nivel - 1] });
      }
    }
  }

  // contorno em volta de tudo
  const ocupado = new Set([...cheio, ...profundidade.keys()]);
  const contorno = new Map();
  for (const chave of ocupado) {
    const [x, y] = chave.split(',').map(Number);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const vizinho = `${x + dx},${y + dy}`;
        if (!ocupado.has(vizinho)) pintar(contorno, x + dx, y + dy, CONTORNO);
      }
    }
  }

  const frente = new Map();
  for (const p of letras) pintar(frente, p.x, p.y, p.cor);

  const todos = [...contorno.values(), ...profundidade.values(), ...frente.values()];
  const minX = Math.min(...todos.map((p) => p.x));
  const minY = Math.min(...todos.map((p) => p.y));
  const maxX = Math.max(...todos.map((p) => p.x));
  const maxY = Math.max(...todos.map((p) => p.y));

  const ouro = letras.filter((p) => p.estilo === ESTILOS.ouro).map((p) => ({ x: p.x - minX, y: p.y - minY, cor: '' }));

  return {
    largura: maxX - minX + 1,
    altura: maxY - minY + 1,
    retangulos: juntar(todos.map((p) => ({ ...p, x: p.x - minX, y: p.y - minY }))),
    // por onde o reflexo passa
    ouro: juntar(ouro),
  };
}

// pixels vizinhos da mesma cor na mesma linha viram um retângulo só
function juntar(pixels) {
  const porLinha = new Map();
  for (const p of pixels) {
    if (!porLinha.has(p.y)) porLinha.set(p.y, new Map());
    porLinha.get(p.y).set(p.x, p.cor);
  }
  const lista = [];
  for (const [y, linha] of porLinha) {
    const xs = [...linha.keys()].sort((a, b) => a - b);
    let i = 0;
    while (i < xs.length) {
      let fim = i;
      while (fim + 1 < xs.length && xs[fim + 1] === xs[fim] + 1 && linha.get(xs[fim + 1]) === linha.get(xs[i])) fim++;
      lista.push({ x: xs[i], y, largura: fim - i + 1, cor: linha.get(xs[i]) });
      i = fim + 1;
    }
  }
  return lista;
}
