import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';

const AVENTUREIROS = [
  { quem: 'lia', nome: 'Lia', classe: 'arqueira', x: 30 },
  { quem: 'tom', nome: 'Tom', classe: 'mago', x: 94 },
];

export function CenaCrachas({ Componente, modo, liberada, primeiraVez }) {
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
          <Personagem quem={quem} x={x} y={76} entrada={primeiraVez ? 'esquerda' : undefined} />
          {liberada && <Brilhos x={x + 8} y={58} />}
        </div>
      ))}

      <Personagem
        quem="guarda"
        x={160}
        y={74}
        lado="direita"
        entrada={primeiraVez ? 'direita' : undefined}
        fala={liberada ? 'Aprovados!' : null}
      />
    </Cena>
  );
}
