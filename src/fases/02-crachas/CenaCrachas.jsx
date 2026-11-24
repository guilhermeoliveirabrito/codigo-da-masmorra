import { Cena, Personagem, Tela, posicao } from '../../components/Cenario';

const AVENTUREIROS = [
  { quem: 'lia', nome: 'Lia', classe: 'arqueira', x: 30 },
  { quem: 'tom', nome: 'Tom', classe: 'mago', x: 94 },
];

export function CenaCrachas({ Componente, modo, liberada }) {
  return (
    <Cena modo={modo}>
      {AVENTUREIROS.map(({ quem, nome, classe, x }) => (
        <div key={quem}>
          <Tela
            modo={modo}
            vazio="sem crachá"
            className={`cracha cracha--${quem}`}
            style={posicao(x + 8, 70)}
          >
            {Componente && <Componente nome={nome} classe={classe} />}
          </Tela>
          <Personagem quem={quem} x={x} y={76} />
        </div>
      ))}

      <Personagem quem="guarda" x={160} y={74} lado="direita" fala={liberada ? 'Aprovados!' : null} />
    </Cena>
  );
}
