import { useCallback, useEffect, useRef, useState } from 'react';
import { Brilhos, Cena, Personagem, Tela, posicao } from '../../components/Cenario';
import { BAU, DRAGAO, DRAGAO_BRAVO, DRAGAO_DORMINDO } from '../../pixel/desenhos';
import { Sprite } from '../../pixel/Sprite';
import { tocar } from '../../som';

export const HEROIS = [
  { id: 'lia', nome: 'Lia', forca: 3 },
  { id: 'tom', nome: 'Tom', forca: 4 },
  { id: 'guarda', nome: 'Guarda', forca: 2 },
];
export const ENERGIA = 15;

const ONDE_ESTA = { lia: 8, tom: 30, guarda: 52 };

function Caverna() {
  return (
    <g>
      <rect x={118} y={14} width={74} height={66} fill="#181425" />
      <rect x={122} y={18} width={70} height={62} fill="#0d0a14" />
      <rect x={118} y={14} width={74} height={2} fill="#5a6988" />
      <rect x={118} y={14} width={2} height={66} fill="#5a6988" />
      <rect x={6} y={4} width={108} height={42} fill="#181425" />
      <rect x={7} y={5} width={106} height={40} fill="#c0cbdc" />
      <rect x={9} y={7} width={102} height={36} fill="#124e89" />
      <rect x={9} y={7} width={102} height={1} fill="#0099db" />
    </g>
  );
}

// de quem foi o golpe: aceita o herói inteiro, o id ou o nome
function quemAtacou(heroi) {
  const texto = String(typeof heroi === 'object' && heroi ? (heroi.id ?? heroi.nome) : heroi).toLowerCase();
  return ONDE_ESTA[texto] !== undefined ? texto : null;
}

export function CenaGuardiao({ Componente, modo, liberada, primeiraVez, aoVencer }) {
  const [energia, setEnergia] = useState(ENERGIA);
  const [golpes, setGolpes] = useState([]);
  const [atacando, setAtacando] = useState(null);
  const [bravo, setBravo] = useState(false);
  const tempos = useRef([]);
  const rugiu = useRef(false);

  const aoVencerRef = useRef(aoVencer);
  useEffect(() => {
    aoVencerRef.current = aoVencer;
  });
  useEffect(() => () => tempos.current.forEach(clearTimeout), []);

  const depois = (ms, funcao) => tempos.current.push(setTimeout(funcao, ms));

  const aoAtacar = useCallback(
    (heroi) => {
      if (!liberada) return;
      const quem = quemAtacou(heroi);
      const dano = Number(heroi?.forca) || 1;
      setEnergia((atual) => Math.max(0, atual - dano));
      setGolpes((lista) => [...lista.slice(-4), { id: Math.random(), dano }]);
      setAtacando(quem);
      setBravo(true);
      tocar('golpe');
      if (!rugiu.current) {
        rugiu.current = true;
        depois(250, () => tocar('rugido'));
      }
      depois(320, () => setAtacando(null));
      depois(450, () => setBravo(false));
    },
    [liberada]
  );

  const dormiu = liberada && energia <= 0;

  useEffect(() => {
    if (!dormiu) return;
    tocar('fanfarra');
    const fim = setTimeout(() => aoVencerRef.current(), 3200);
    return () => clearTimeout(fim);
  }, [dormiu]);

  let dragao = DRAGAO;
  if (dormiu) dragao = DRAGAO_DORMINDO;
  else if (bravo) dragao = DRAGAO_BRAVO;

  let falaDaLia = null;
  let falaDoTom = null;
  let falaDoGuarda = null;
  if (!Componente) falaDoGuarda = 'Lá está ele. O Guardião da masmorra.';
  else if (!liberada) falaDoTom = 'O painel não ficou pronto. Olha o aviso.';
  else if (dormiu) falaDoTom = 'Shhh... ele dormiu.';
  else if (energia === ENERGIA) falaDaLia = modo === 'web' ? 'Clica em quem vai atacar!' : 'Toca em quem vai atacar!';

  return (
    <Cena modo={modo} tochas={[106]} alturaDasTochas={52} fundo={<Caverna />}>
      <Tela modo={modo} vazio="painel vazio" className="batalha" style={posicao(10, 8, 100, 34)}>
        {Componente && <Componente herois={HEROIS} energia={ENERGIA} aoAtacar={aoAtacar} />}
      </Tela>

      <div
        className="energia"
        style={posicao(130, 6, 56, 6)}
        role="meter"
        aria-label="Energia do Guardião"
        aria-valuemin={0}
        aria-valuemax={ENERGIA}
        aria-valuenow={energia}
      >
        <span className="energia__barra" style={{ width: `${(energia / ENERGIA) * 100}%` }} />
      </div>

      <Sprite
        key={golpes.length}
        desenho={dragao}
        className={`dragao ${golpes.length && !dormiu ? 'dragao--atingido' : ''} ${dormiu ? 'dragao--dormindo' : ''}`}
        style={posicao(130, 34, 60, 46)}
      />
      {golpes.map((golpe) => (
        <span key={golpe.id} className="dano" style={posicao(146, 30)}>
          -{golpe.dano}
        </span>
      ))}
      {dormiu && (
        <>
          {[0, 1, 2].map((i) => (
            <span key={i} className="zzz" style={{ ...posicao(148 + i * 4, 32), animationDelay: `${i * 0.6}s` }}>
              z
            </span>
          ))}
          <Sprite desenho={BAU} className="tesouro" style={posicao(84, 70, 24, 18)} />
          <Brilhos x={96} y={76} />
        </>
      )}

      {['lia', 'tom', 'guarda'].map((quem) => (
        <Personagem
          key={quem}
          quem={quem}
          x={ONDE_ESTA[quem]}
          y={quem === 'guarda' ? 74 : 76}
          lado="esquerda"
          className={atacando === quem ? 'personagem--golpe' : ''}
          fala={{ lia: falaDaLia, tom: falaDoTom, guarda: falaDoGuarda }[quem]}
          entrada={primeiraVez ? 'esquerda' : undefined}
          atrasoDaEntrada={{ lia: 0.5, tom: 0.25, guarda: 0 }[quem]}
          viajante
        />
      ))}
    </Cena>
  );
}
