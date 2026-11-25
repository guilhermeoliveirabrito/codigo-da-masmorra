import { useEffect, useState } from 'react';
import { Brilhos, CHAO, Cena, Personagem, Tela, posicao } from '../../components/Cenario';

const RIO = { inicio: 38, fim: 154 };
const PEDRAS = { inicio: 42, fim: 150, topo: 92 };

// onde o Tom pisa: margem, as 4 pedras (espalhadas com space-between) e a outra margem
const LARGURA_DA_PEDRA = 19.4;
const VAO = (PEDRAS.fim - PEDRAS.inicio - 4 * LARGURA_DA_PEDRA) / 3;
const PASSOS = [
  ...Array.from({ length: 4 }, (_, i) => PEDRAS.inicio + i * (LARGURA_DA_PEDRA + VAO) + LARGURA_DA_PEDRA / 2 - 8),
  166,
];

function Agua() {
  const largura = RIO.fim - RIO.inicio;
  return (
    <g>
      <rect x={RIO.inicio} y={CHAO} width={largura} height={28} fill="#124e89" />
      <rect x={RIO.inicio} y={CHAO} width={largura} height={2} fill="#0d3a66" />
      <rect x={RIO.inicio - 1} y={CHAO} width={1} height={28} fill="#5a6988" />
      <rect x={RIO.fim} y={CHAO} width={1} height={28} fill="#5a6988" />
      <g className="rio__ondas">
        {[0, 1, 2, 3, 4, 5].map((linha) =>
          [0, 1, 2, 3, 4, 5, 6, 7].map((coluna) => (
            <rect
              key={`${linha}-${coluna}`}
              x={RIO.inicio + ((coluna * 17 + linha * 7) % largura)}
              y={CHAO + 4 + linha * 4}
              width={4}
              height={1}
              fill={linha % 2 ? '#0099db' : '#2ce8f5'}
              opacity={linha % 2 ? 0.7 : 0.45}
            />
          ))
        )}
      </g>
    </g>
  );
}

export function CenaRio({ Componente, modo, liberada, primeiraVez }) {
  const [passo, setPasso] = useState(-1);

  useEffect(() => {
    if (!liberada) return;
    const pulo = setInterval(() => {
      setPasso((atual) => {
        if (atual >= PASSOS.length - 1) {
          clearInterval(pulo);
          return atual;
        }
        return atual + 1;
      });
    }, 420);
    return () => clearInterval(pulo);
  }, [liberada]);

  const naPedra = passo >= 0 && passo < PASSOS.length - 1;
  const x = passo >= 0 ? PASSOS[passo] : 12;

  return (
    <Cena modo={modo} fundo={<Agua />}>
      <Tela
        modo={modo}
        vazio=""
        className="rio__tela"
        style={posicao(PEDRAS.inicio, PEDRAS.topo, PEDRAS.fim - PEDRAS.inicio, 10)}
      >
        {Componente && <Componente />}
      </Tela>

      {passo === PASSOS.length - 1 && <Brilhos x={174} y={90} />}

      <Personagem
        quem="tom"
        x={x}
        y={naPedra ? 70 : 76}
        lado="esquerda"
        fala={Componente ? null : 'Não sei nadar...'}
        entrada={primeiraVez ? 'esquerda' : undefined}
        viajante
        className={`personagem--pulando ${passo >= 0 ? `personagem--pulo-${passo % 2 ? 'b' : 'a'}` : ''}`}
      />
    </Cena>
  );
}
