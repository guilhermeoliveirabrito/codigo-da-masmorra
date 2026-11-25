import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';

const TABUAS = ['#b86f50', '#a8614a', '#b86f50'];
const PREGOS = [
  [47, 15],
  [143, 15],
  [47, 40],
  [143, 40],
];

function Poste({ x }) {
  return (
    <>
      <rect x={x - 1} y={44} width={7} height={54} fill="#181425" />
      <rect x={x} y={44} width={5} height={54} fill="#733e39" />
      <rect x={x} y={44} width={1} height={54} fill="#b86f50" />
      <rect x={x - 3} y={98} width={11} height={2} fill="#1f2338" />
    </>
  );
}

function PlacaDeMadeira() {
  return (
    <g>
      <Poste x={56} />
      <Poste x={131} />
      <rect x={44} y={12} width={104} height={33} fill="#181425" />
      {TABUAS.map((cor, i) => (
        <g key={i}>
          <rect x={45} y={13 + i * 10.33} width={102} height={10} fill={cor} />
          <rect x={45} y={13 + i * 10.33} width={102} height={1} fill="#e4a672" />
        </g>
      ))}
      <rect x={45} y={23} width={102} height={1} fill="#733e39" />
      <rect x={45} y={33} width={102} height={1} fill="#733e39" />
      {PREGOS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={2} height={2} fill="#181425" />
          <rect x={x} y={y} width={1} height={1} fill="#8b9bb4" />
        </g>
      ))}
    </g>
  );
}

export function CenaPlaca({ Componente, modo, liberada, primeiraVez }) {
  return (
    <Cena modo={modo} fundo={<PlacaDeMadeira />}>
      <Tela modo={modo} vazio="placa em branco" className="placa__texto" style={posicao(50, 15, 92, 28)}>
        {Componente && <Componente />}
      </Tela>

      {liberada && <Brilhos x={96} y={28} />}

      <Personagem
        quem="guarda"
        x={14}
        y={74}
        lado="esquerda"
        entrada={primeiraVez ? 'esquerda' : undefined}
        fala={liberada ? 'Pode passar!' : null}
      />
      <Personagem quem="lia" x={162} y={76} lado="direita" entrada={primeiraVez ? 'direita' : undefined} />
    </Cena>
  );
}
