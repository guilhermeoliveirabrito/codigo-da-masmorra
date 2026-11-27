// Acessórios da loja: um desenho pequeno colado na cabeça de cada um.
// "frente" é a pose parada, "lado" a de andar. x e y contam do canto do desenho do personagem;
// y negativo sobe acima da cabeça (o desenho ganha linhas em cima pra caber).
export const ACESSORIOS = {
  coroa: {
    quem: 'lia',
    frente: { x: 4, y: -2, linhas: ['k..kk..k', 'ykkyykky', 'yyyyyyyy', 'yrycyyry', 'kkkkkkkk'] },
    lado: { x: 4, y: -2, linhas: ['k..kk..k', 'ykkyykky', 'yyyyyyyy', 'yrycyyry', 'kkkkkkkk'] },
  },
  oculos: {
    quem: 'tom',
    // por cima dos olhos: a piscada sai, senão a pálpebra aparece por cima da lente
    cobreOsOlhos: true,
    frente: { x: 3, y: 8, linhas: ['kkkkkkkkkk', '.kWkkkWkk.', '..kk..kk..'] },
    lado: { x: 7, y: 8, linhas: ['kkkkkk', '...kWk', '...kk.'] },
  },
  chapeu: {
    quem: 'guarda',
    frente: {
      x: 5,
      y: -4,
      linhas: ['...W...', '..kck..', '..kqk..', '.kcqck.', '.kqcqk.', 'kcqcqck', 'kkkkkkk'],
    },
    lado: {
      x: 5,
      y: -3,
      linhas: ['...W...', '..kck..', '..kqk..', '.kcqck.', '.kqcqk.', 'kcqcqck', 'kkkkkkk'],
    },
  },
};

function larguraDe(desenho) {
  return (desenho.camadas ?? desenho.quadros[0])[0][0].length;
}

function alturaDe(desenho) {
  return (desenho.camadas ?? desenho.quadros[0])[0].length;
}

// uma camada do tamanho do desenho só com o acessório
function camadaDaPeca(peca, largura, altura, descer) {
  const linhas = Array.from({ length: altura }, () => Array(largura).fill('.'));
  peca.linhas.forEach((linha, dy) => {
    [...linha].forEach((cor, dx) => {
      const y = peca.y + dy + descer;
      const x = peca.x + dx;
      if (cor !== '.' && y >= 0 && y < altura && x >= 0 && x < largura) linhas[y][x] = cor;
    });
  });
  return linhas.map((linha) => linha.join(''));
}

function comPeca(desenho, peca, folga, { andando, semPiscada }) {
  const largura = larguraDe(desenho);
  const altura = alturaDe(desenho) + folga;
  const vazia = '.'.repeat(largura);
  const subir = (camada) => [...Array(folga).fill(vazia), ...camada];
  const ajustada = { ...peca, y: peca.y + folga };

  if (desenho.quadros) {
    return {
      ...desenho,
      // nos quadros de passo (o 1º e o 3º) o corpo desce 1 pixel, e o acessório junto
      quadros: desenho.quadros.map((camadas, i) => [
        ...camadas.map(subir),
        camadaDaPeca(ajustada, largura, altura, andando && i % 2 === 0 ? 1 : 0),
      ]),
    };
  }
  return {
    ...desenho,
    camadas: [...desenho.camadas.map(subir), camadaDaPeca(ajustada, largura, altura, 0)],
    piscada: semPiscada || !desenho.piscada ? undefined : subir(desenho.piscada),
    rosto: desenho.rosto && [desenho.rosto[0], desenho.rosto[1] + folga, desenho.rosto[2], desenho.rosto[3]],
  };
}

// o personagem com o acessório, parado e andando. folga: quantas linhas o desenho cresceu pra cima
export function vestir(personagem, acessorio) {
  const folga = Math.max(0, -acessorio.frente.y, -acessorio.lado.y);
  const opcoes = { semPiscada: acessorio.cobreOsOlhos };
  return {
    ...personagem,
    folga,
    desenho: comPeca(personagem.desenho, acessorio.frente, folga, opcoes),
    andando: personagem.andando && comPeca(personagem.andando, acessorio.lado, folga, { ...opcoes, andando: true }),
  };
}
