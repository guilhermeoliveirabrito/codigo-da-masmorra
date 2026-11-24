import { useCallback, useEffect, useRef, useState } from 'react';
import { Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { ALAVANCA_BAIXO, ALAVANCA_CIMA } from '../../pixel/desenhos';
import { Sprite } from '../../pixel/Sprite';

const PORTA_X = 160; // centro da porta
const PORTA_Y = 34;
const ARCO = [8, 14, 16, 18, 20];

function larguraDaAbertura(linha) {
  return linha < ARCO.length ? ARCO[linha] : 20;
}

const LINHAS_DA_PORTA = Array.from({ length: 46 }, (_, i) => ({
  y: PORTA_Y + i,
  largura: larguraDaAbertura(i),
}));

function Porta({ aberta }) {
  return (
    <g className={`porta ${aberta ? 'porta--aberta' : ''}`}>
      {LINHAS_DA_PORTA.map(({ y, largura }) => (
        <g key={y}>
          <rect x={PORTA_X - largura / 2 - 4} y={y - 1} width={largura + 8} height={2} fill="#181425" />
          <rect x={PORTA_X - largura / 2 - 3} y={y} width={largura + 6} height={1} fill="#5a6988" />
          <rect x={PORTA_X - largura / 2 - 3} y={y} width={1} height={1} fill="#8b9bb4" />
          <rect x={PORTA_X - largura / 2} y={y} width={largura} height={1} fill="#f77622" />
          <rect x={PORTA_X - largura / 2 + 3} y={y} width={Math.max(largura - 6, 0)} height={1} fill="#feae34" />
          <rect x={PORTA_X - largura / 2 + 6} y={y} width={Math.max(largura - 12, 0)} height={1} fill="#fee761" />
        </g>
      ))}

      <polygon
        className="porta__claridade"
        points={`${PORTA_X - 10},80 ${PORTA_X + 10},80 ${PORTA_X + 24},108 ${PORTA_X - 24},108`}
        fill="#feae34"
      />

      <g className="porta__folha">
        {LINHAS_DA_PORTA.map(({ y, largura }) =>
          Array.from({ length: largura / 4 }, (_, i) => (
            <rect
              key={`${y}-${i}`}
              x={PORTA_X - largura / 2 + i * 4}
              y={y}
              width={4}
              height={1}
              fill={i % 2 ? '#733e39' : '#8a4b3c'}
            />
          ))
        )}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={PORTA_X - 6 + i * 4} y={PORTA_Y + 2} width={1} height={44} fill="#3e2731" />
        ))}
        {[12, 32].map((y) => (
          <g key={y}>
            <rect x={PORTA_X - 10} y={PORTA_Y + y} width={20} height={2} fill="#5a6988" />
            <rect x={PORTA_X - 10} y={PORTA_Y + y} width={20} height={1} fill="#8b9bb4" />
          </g>
        ))}
        <rect x={PORTA_X + 4} y={PORTA_Y + 22} width={3} height={3} fill="#feae34" />
        <rect x={PORTA_X + 5} y={PORTA_Y + 23} width={1} height={1} fill="#181425" />
      </g>
    </g>
  );
}

function Painel() {
  return (
    <g>
      <rect x={39} y={15} width={74} height={38} fill="#181425" />
      <rect x={40} y={16} width={72} height={36} fill="#5a6988" />
      <rect x={40} y={16} width={72} height={1} fill="#8b9bb4" />
      <rect x={40} y={16} width={1} height={36} fill="#8b9bb4" />
      <rect x={43} y={19} width={66} height={30} fill="#181425" />
      <rect x={113} y={28} width={36} height={2} fill="#262b44" />
      <rect x={113} y={28} width={36} height={1} fill="#5a6988" />
    </g>
  );
}

export function CenaAlavanca({ Componente, modo, liberada, aoVencer }) {
  const [aberta, setAberta] = useState(false);
  const [atravessou, setAtravessou] = useState(false);

  // ref pra não reiniciar os timers quando a função muda
  const aoVencerRef = useRef(aoVencer);
  useEffect(() => {
    aoVencerRef.current = aoVencer;
  });

  const abrirPorta = useCallback(() => setAberta(true), []);

  useEffect(() => {
    if (!aberta || !liberada) return;
    const andar = setTimeout(() => setAtravessou(true), 700);
    const fim = setTimeout(() => aoVencerRef.current(), 2400);
    return () => {
      clearTimeout(andar);
      clearTimeout(fim);
    };
  }, [aberta, liberada]);

  let fala = null;
  if (aberta && !liberada) fala = 'Abriu, mas tem um aviso aí embaixo.';
  else if (!aberta && liberada) fala = modo === 'web' ? 'Clica na alavanca!' : 'Toca na alavanca!';
  else if (aberta && !atravessou) fala = 'Isso!';

  return (
    <Cena
      modo={modo}
      fundo={
        <>
          <Painel />
          <Porta aberta={aberta} />
        </>
      }
    >
      <Tela modo={modo} vazio="encaixe vazio" className="painel__tela" style={posicao(44, 20, 64, 28)}>
        {Componente && <Componente abrirPorta={abrirPorta} />}
      </Tela>

      <Sprite
        desenho={aberta ? ALAVANCA_BAIXO : ALAVANCA_CIMA}
        className="alavanca"
        style={posicao(114, 22, 8, 13)}
      />

      <Personagem
        quem="lia"
        x={atravessou ? 152 : 16}
        y={76}
        lado="esquerda"
        fala={fala}
        className={`personagem--andando ${atravessou ? 'personagem--saindo' : ''}`}
      />
    </Cena>
  );
}
