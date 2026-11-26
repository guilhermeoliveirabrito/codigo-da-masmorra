import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { CORVO, CORVO_VOANDO, ESTANDARTE } from '../../pixel/desenhos';
import { NoFundo, Sprite } from '../../pixel/Sprite';
import { tocar } from '../../som';

// a janela da torre, com o céu da noite lá fora
function Janela() {
  const estrelas = [
    [146, 14],
    [158, 22],
    [151, 33],
    [166, 16],
    [163, 36],
  ];
  return (
    <g>
      <rect x={138} y={6} width={36} height={46} fill="#181425" />
      <rect x={141} y={9} width={30} height={40} fill="#124e89" />
      <rect x={141} y={34} width={30} height={15} fill="#0d2a4d" />
      {estrelas.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#fee761" />
      ))}
      <rect x={164} y={11} width={4} height={4} fill="#ead4aa" />
      <rect x={155} y={9} width={2} height={40} fill="#181425" />
      <rect x={141} y={28} width={30} height={2} fill="#181425" />
      <rect x={134} y={50} width={44} height={3} fill="#733e39" />
      <rect x={134} y={50} width={44} height={1} fill="#b86f50" />
    </g>
  );
}

// o pergaminho onde aparece o que o Mapa do jogador desenha
function Pergaminho() {
  return (
    <g>
      <rect x={36} y={8} width={82} height={58} fill="#181425" />
      <rect x={37} y={9} width={80} height={56} fill="#ead4aa" />
      <rect x={37} y={9} width={80} height={2} fill="#e4a672" />
      <rect x={37} y={63} width={80} height={2} fill="#c28569" />
      <rect x={33} y={6} width={88} height={4} fill="#b86f50" />
      <rect x={33} y={64} width={88} height={4} fill="#b86f50" />
    </g>
  );
}

// O corvo sai pela janela quando o fetch pede e volta quando a resposta chega.
export function CenaMensageiro({ Componente, modo, liberada, primeiraVez, eventos }) {
  const [corvo, setCorvo] = useState('pousado'); // pousado, saindo, fora, voltando
  const [respostas, setRespostas] = useState({ ok: 0, ruins: 0 });
  const tempos = useRef([]);

  // ouve antes do componente do jogador montar (useLayoutEffect), senão perde o primeiro pedido
  useLayoutEffect(() => {
    if (!eventos) return;
    return eventos.ouvir((evento) => {
      if (evento.tipo === 'pedido') {
        tocar('corvo');
        setCorvo('saindo');
        tempos.current.push(setTimeout(() => setCorvo((atual) => (atual === 'saindo' ? 'fora' : atual)), 700));
      } else {
        setCorvo('voltando');
        setRespostas((atual) => (evento.ok ? { ...atual, ok: atual.ok + 1 } : { ...atual, ruins: atual.ruins + 1 }));
        tempos.current.push(setTimeout(() => setCorvo('pousado'), 650));
      }
    });
  }, [eventos]);

  useEffect(() => () => tempos.current.forEach(clearTimeout), []);

  let falaDoTom = null;
  let falaDaLia = null;
  if (!Componente) falaDaLia = 'O corvo sabe o caminho. Só falta alguém pedir o mapa.';
  else if (corvo === 'saindo' || corvo === 'fora') falaDoTom = 'Lá vai ele...';
  else if (respostas.ruins > 0 && respostas.ok === 0) falaDoTom = 'Ele voltou sem nada. Endereço errado?';
  else if (respostas.ok > 0 && liberada) falaDaLia = 'O mapa chegou! A sala do Guardião é logo ali.';
  else if (respostas.ok > 0) falaDoTom = 'O mapa chegou, mas olha o aviso aí.';
  else if (Componente && corvo === 'pousado') falaDoTom = 'O corvo nem se mexeu...';

  const voando = corvo === 'saindo' || corvo === 'voltando';

  return (
    <Cena
      modo={modo}
      tochas={[12, 124]}
      fundo={
        <>
          <NoFundo desenho={ESTANDARTE} x={14} y={30} />
          <Pergaminho />
          <Janela />
        </>
      }
    >
      <Tela modo={modo} vazio="pergaminho em branco" className="pergaminho" style={posicao(40, 12, 74, 50)}>
        {Componente && <Componente />}
      </Tela>

      {corvo === 'pousado' && <Sprite desenho={CORVO} className="corvo" style={posicao(150, 39, 12, 11)} />}
      {voando && (
        <Sprite
          desenho={CORVO_VOANDO}
          className={`corvo corvo--${corvo}`}
          style={posicao(146, 24, 16, 10)}
        />
      )}
      {respostas.ok > 0 && liberada && <Brilhos x={77} y={36} />}

      <Personagem
        quem="lia"
        x={130}
        y={76}
        lado="direita"
        fala={falaDaLia}
        entrada={primeiraVez ? 'esquerda' : undefined}
        atrasoDaEntrada={0.35}
        viajante
      />
      <Personagem quem="tom" x={152} y={76} lado="direita" fala={falaDoTom} entrada={primeiraVez ? 'esquerda' : undefined} viajante />
    </Cena>
  );
}
