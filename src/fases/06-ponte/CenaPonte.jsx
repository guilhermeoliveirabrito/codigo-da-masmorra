import { useEffect, useState } from 'react';
import { Brilhos, CHAO, Cena, Personagem, Tela, posicao } from '../../components/Cenario';

export const TABUAS_DA_CENA = [
  { id: 1, madeira: 'carvalho' },
  { id: 2, madeira: 'pinho' },
  { id: 3, madeira: 'cedro' },
  { id: 4, madeira: 'pinho' },
  { id: 5, madeira: 'carvalho' },
];

const BURACO = { inicio: 58, fim: 134 };
const PONTE_Y = 95;

function Abismo() {
  const largura = BURACO.fim - BURACO.inicio;
  return (
    <g>
      <rect x={BURACO.inicio} y={CHAO} width={largura} height={28} fill="#0d0a14" />
      <rect x={BURACO.inicio} y={CHAO} width={largura} height={3} fill="#181425" />
      <rect x={BURACO.inicio - 1} y={CHAO} width={1} height={28} fill="#8b9bb4" />
      <rect x={BURACO.fim} y={CHAO} width={1} height={28} fill="#5a6988" />
      {[8, 18, 31, 47, 60, 69].map((x, i) => (
        <rect key={x} x={BURACO.inicio + x} y={CHAO + 9 + (i % 3) * 5} width={1} height={1} fill="#3a4466" />
      ))}
      {[BURACO.inicio - 4, BURACO.fim + 1].map((x) => (
        <g key={x}>
          <rect x={x - 1} y={PONTE_Y - 8} width={5} height={14} fill="#181425" />
          <rect x={x} y={PONTE_Y - 7} width={3} height={13} fill="#733e39" />
          <rect x={x} y={PONTE_Y - 7} width={1} height={13} fill="#b86f50" />
        </g>
      ))}
    </g>
  );
}

export function CenaPonte({ Componente, modo, liberada, primeiraVez }) {
  const [atravessou, setAtravessou] = useState(false);

  useEffect(() => {
    if (!liberada) return;
    const andar = setTimeout(() => setAtravessou(true), 500);
    return () => clearTimeout(andar);
  }, [liberada]);

  return (
    <Cena modo={modo} fundo={<Abismo />}>
      <Tela
        modo={modo}
        vazio=""
        className="ponte__tela"
        style={posicao(BURACO.inicio, PONTE_Y, BURACO.fim - BURACO.inicio, 6)}
      >
        {Componente && <Componente tabuas={TABUAS_DA_CENA} />}
      </Tela>

      {liberada && <Brilhos x={96} y={PONTE_Y} />}

      <Personagem
        quem="lia"
        x={atravessou ? 152 : 26}
        y={76}
        lado="esquerda"
        fala={Componente ? null : 'Sem ponte não dá...'}
        entrada={primeiraVez ? 'esquerda' : undefined}
        className="personagem--andando personagem--devagar"
      />
    </Cena>
  );
}
