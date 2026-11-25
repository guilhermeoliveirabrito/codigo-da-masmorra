import { useEffect, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { ESTANDARTE } from '../../pixel/desenhos';
import { NoFundo } from '../../pixel/Sprite';

export function CenaPortoes({ Componente, modo, liberada, primeiraVez }) {
  const [entrou, setEntrou] = useState(false);

  useEffect(() => {
    if (!liberada) return;
    const andar = setTimeout(() => setEntrou(true), 600);
    return () => clearTimeout(andar);
  }, [liberada]);

  return (
    <Cena modo={modo} tochas={[12, 172]} fundo={<NoFundo desenho={ESTANDARTE} x={92} y={2} />}>
      <Tela modo={modo} vazio="sem portão" className="portao__tela" style={posicao(52, 26, 40, 56)}>
        {Componente && <Componente temChave />}
      </Tela>
      <Tela modo={modo} vazio="sem portão" className="portao__tela" style={posicao(104, 26, 40, 56)}>
        {Componente && <Componente temChave={false} />}
      </Tela>

      {liberada && <Brilhos x={72} y={50} />}

      <Personagem
        quem="lia"
        x={entrou ? 64 : 28}
        y={76}
        lado="esquerda"
        fala={liberada && !entrou ? 'Tenho a chave!' : null}
        entrada={primeiraVez ? 'esquerda' : undefined}
        some={entrou}
        viajante
      />
      <Personagem
        quem="tom"
        x={150}
        y={76}
        lado="direita"
        fala={liberada ? 'Esqueci a minha...' : null}
        entrada={primeiraVez ? 'direita' : undefined}
        viajante
      />
    </Cena>
  );
}
