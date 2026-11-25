import { useCallback, useEffect, useRef, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { Porta } from '../../components/Porta';
import { ALAVANCA_BAIXO, ALAVANCA_CIMA, CAIXOTE, CORRENTE } from '../../pixel/desenhos';
import { NoFundo, Sprite } from '../../pixel/Sprite';

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

export function CenaAlavanca({ Componente, modo, liberada, primeiraVez, aoVencer }) {
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
    const fim = setTimeout(() => aoVencerRef.current(), 3000);
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
      className={aberta ? 'cena--tremer' : ''}
      fundo={
        <>
          <NoFundo desenho={CORRENTE} x={24} y={0} />
          <NoFundo desenho={CAIXOTE} x={127} y={69} />
          <Painel />
          <Porta x={160} y={34} largura={20} altura={46} aberta={aberta} />
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

      {aberta && liberada && <Brilhos x={160} y={52} />}

      <Personagem
        quem="lia"
        entrada={primeiraVez ? 'esquerda' : undefined}
        x={atravessou ? 152 : 16}
        y={76}
        lado="esquerda"
        fala={fala}
        velocidade={72}
        some={atravessou}
        viajante
      />
    </Cena>
  );
}
