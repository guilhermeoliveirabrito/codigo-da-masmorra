import { Brilhos, Cena, Personagem, Tela } from '../../components/Cenario';
import { ESTANDARTE } from '../../pixel/desenhos';
import { NoFundo } from '../../pixel/Sprite';

// o Tom vai mais longe, então entra primeiro e a Lia vem logo atrás
const AVENTUREIROS = [
  { quem: 'lia', nome: 'Lia', classe: 'arqueira', x: 30, atraso: 0.45 },
  { quem: 'tom', nome: 'Tom', classe: 'mago', x: 94, atraso: 0 },
];

export function CenaCrachas({ Componente, modo, liberada, primeiraVez }) {
  return (
    <Cena
      modo={modo}
      fundo={
        <>
          <NoFundo desenho={ESTANDARTE} x={56} y={4} />
          <NoFundo desenho={ESTANDARTE} x={124} y={4} />
        </>
      }
    >
      {AVENTUREIROS.map(({ quem, nome, classe, x, atraso }) => (
        <div key={quem}>
          <Personagem
            quem={quem}
            x={x}
            y={76}
            entrada={primeiraVez ? 'esquerda' : undefined}
            atrasoDaEntrada={atraso}
            viajante
          >
            <Tela modo={modo} vazio="sem crachá" className={`cracha cracha--${quem}`}>
              {Componente && <Componente nome={nome} classe={classe} />}
            </Tela>
          </Personagem>
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
