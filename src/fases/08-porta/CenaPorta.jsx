import { useCallback, useEffect, useRef, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { AMPULHETA, CORRENTE, GOSMA } from '../../pixel/desenhos';
import { NoFundo, Sprite } from '../../pixel/Sprite';
import { tocar } from '../../som';

// A turma entrou pela grade fugindo da gosma. Cada batida da ampulheta desce um pedaço
// da grade; na terceira ela fecha e a gosma fica do lado de lá.
const BATIDAS_PRA_FECHAR = 3;
const ONDE_ESTA_A_GOSMA = [2, 12, 22, 30];

function Arco() {
  return (
    <g>
      <rect x={36} y={30} width={48} height={50} fill="#262b44" />
      <rect x={40} y={34} width={40} height={46} fill="#0d0a14" />
      <rect x={36} y={30} width={48} height={2} fill="#8b9bb4" />
      <rect x={36} y={30} width={2} height={50} fill="#5a6988" />
      <rect x={82} y={30} width={2} height={50} fill="#181425" />
      <rect x={52} y={26} width={16} height={6} fill="#5a6988" />
      <rect x={52} y={26} width={16} height={1} fill="#8b9bb4" />
      <rect x={96} y={8} width={74} height={30} fill="#181425" />
      <rect x={97} y={9} width={72} height={28} fill="#733e39" />
      <rect x={97} y={9} width={72} height={1} fill="#b86f50" />
      <rect x={99} y={11} width={68} height={24} fill="#3e2731" />
    </g>
  );
}

// a grade fica num svg à parte, na frente da gosma
function Grade({ fechada }) {
  const subida = (1 - fechada / BATIDAS_PRA_FECHAR) * 44;
  return (
    <svg className="grade" style={posicao(40, 34, 40, 46)} viewBox="0 0 40 46" shapeRendering="crispEdges" aria-hidden="true">
      <g className="grade__barras" style={{ transform: `translateY(-${subida}px)` }}>
        {[3, 11, 19, 27, 35].map((x) => (
          <g key={x}>
            <rect x={x - 1} y={0} width={4} height={42} fill="#181425" />
            <rect x={x} y={0} width={2} height={42} fill="#8b9bb4" />
            <rect x={x} y={0} width={1} height={42} fill="#c0cbdc" />
            <rect x={x} y={42} width={2} height={3} fill="#5a6988" />
          </g>
        ))}
        {[8, 22, 36].map((y) => (
          <g key={y}>
            <rect x={0} y={y - 1} width={40} height={4} fill="#181425" />
            <rect x={0} y={y} width={40} height={2} fill="#5a6988" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function CenaPorta({ Componente, modo, liberada, primeiraVez, aoVencer }) {
  const [batidas, setBatidas] = useState(0);
  const [blop, setBlop] = useState(false);
  const [ampulhetaNaTela, setAmpulhetaNaTela] = useState(true);

  const aoVencerRef = useRef(aoVencer);
  useEffect(() => {
    aoVencerRef.current = aoVencer;
  });

  // o tique do jogador só mexe na grade quando o código passou no teste
  const tique = useCallback(() => {
    if (liberada) setBatidas((n) => Math.min(n + 1, BATIDAS_PRA_FECHAR));
  }, [liberada]);

  const fechou = batidas >= BATIDAS_PRA_FECHAR;

  useEffect(() => {
    if (batidas > 0) tocar(fechou ? 'porta' : 'tique');
  }, [batidas, fechou]);

  // a grade fechou: a gosma bate nela, a ampulheta sai da tela (e para, se tiver limpeza)
  useEffect(() => {
    if (!fechou) return;
    const bater = setTimeout(() => {
      setBlop(true);
      tocar('gosma');
    }, 650);
    const tirar = setTimeout(() => setAmpulhetaNaTela(false), 1400);
    const fim = setTimeout(() => aoVencerRef.current(), 2800);
    return () => [bater, tirar, fim].forEach(clearTimeout);
  }, [fechou]);

  let falaDaLia = null;
  let falaDoTom = null;
  if (!Componente) falaDaLia = 'A gosma tá vindo! Fecha essa grade!';
  else if (!liberada) falaDoTom = 'A grade nem se mexeu. Olha o aviso aí.';
  else if (!fechou) falaDoTom = 'Tic... tac...';
  else if (!ampulhetaNaTela) falaDoTom = 'E a ampulheta parou sozinha. Que limpeza!';
  else falaDaLia = 'Ufa! Fechou bem na hora.';

  return (
    <Cena
      modo={modo}
      tochas={[12, 178]}
      className={fechou ? 'cena--tremer' : ''}
      fundo={
        <>
          <NoFundo desenho={CORRENTE} x={120} y={46} />
          <Arco />
        </>
      }
    >
      <Sprite desenho={AMPULHETA} className="ampulheta" style={posicao(101, 14, 12, 12)} />
      <Tela modo={modo} vazio="sem ampulheta" className="painel__tela ampulheta__tela" style={posicao(115, 12, 50, 22)}>
        {Componente && ampulhetaNaTela && <Componente tique={tique} />}
      </Tela>

      <Sprite
        desenho={GOSMA}
        className={`gosma ${blop ? 'gosma--blop' : ''}`}
        style={posicao(ONDE_ESTA_A_GOSMA[Math.min(batidas, BATIDAS_PRA_FECHAR)] - (blop ? 4 : 0), 88, 16, 12)}
      />
      {blop && (
        <span className="blop" style={posicao(34, 72)}>
          BLOP!
        </span>
      )}
      <Grade fechada={batidas} />
      {fechou && liberada && <Brilhos x={60} y={58} />}

      <Personagem
        quem="lia"
        x={128}
        y={76}
        lado="direita"
        fala={falaDaLia}
        entrada={primeiraVez ? 'esquerda' : undefined}
        atrasoDaEntrada={0.35}
        viajante
      />
      <Personagem
        quem="tom"
        x={150}
        y={76}
        lado="direita"
        fala={falaDoTom}
        entrada={primeiraVez ? 'esquerda' : undefined}
        viajante
      />
    </Cena>
  );
}
