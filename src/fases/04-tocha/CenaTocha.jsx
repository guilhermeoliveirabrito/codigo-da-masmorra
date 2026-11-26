import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { Porta } from '../../components/Porta';
import { ContextoDaCena } from '../../motor/contextoDaCena';
import { tocar } from '../../som';

export function CenaTocha({ Componente, modo, liberada, primeiraVez, aoVencer }) {
  const [luz, setLuz] = useState(false);

  const aoVencerRef = useRef(aoVencer);
  useEffect(() => {
    aoVencerRef.current = aoVencer;
  });

  // a <Chama> do jogador avisa aqui quando acende ou apaga
  const avisar = useCallback((tipo, valor) => {
    if (tipo === 'chama') setLuz(valor);
  }, []);
  const contexto = useMemo(() => ({ avisar }), [avisar]);

  useEffect(() => {
    if (!luz || !liberada) return;
    tocar('porta');
    const fim = setTimeout(() => aoVencerRef.current(), 2000);
    return () => clearTimeout(fim);
  }, [luz, liberada]);

  let fala = 'Tá escuro demais aqui...';
  if (luz && liberada) fala = 'Agora sim! Olha a passagem.';
  else if (luz) fala = 'Acendeu! Mas olha o aviso aí embaixo.';
  else if (liberada) fala = modo === 'web' ? 'Clica no botão da tocha!' : 'Toca no botão da tocha!';

  return (
    <ContextoDaCena.Provider value={contexto}>
      <Cena
        modo={modo}
        tochas={[]}
        className={`cena--escura ${luz ? 'cena--iluminada' : ''} ${luz && liberada ? 'cena--tremer' : ''}`}
        fundo={<Porta x={156} y={36} largura={18} altura={44} aberta={luz && liberada} />}
      >
        <div className="cena__escuridao" />
        <div className="tocha__clarao" style={posicao(80, 30)} />

        <Tela modo={modo} vazio="suporte vazio" className="tocha__tela" style={posicao(54, 10, 52, 68)}>
          {Componente && <Componente />}
        </Tela>

        {luz && liberada && <Brilhos x={80} y={24} />}

        <Personagem
          quem="tom"
          x={20}
          y={76}
          lado="esquerda"
          fala={fala}
          entrada={primeiraVez ? 'esquerda' : undefined}
          viajante
        />
      </Cena>
    </ContextoDaCena.Provider>
  );
}
