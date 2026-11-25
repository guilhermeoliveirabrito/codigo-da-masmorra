import { memo, useEffect } from 'react';
import { LIA_ANDANDO, TOCHA, TOM_ANDANDO } from '../pixel/desenhos';
import { NoFundo, Sprite } from '../pixel/Sprite';
import { ALTURA, LARGURA, Retangulos, montarChao, montarParede, posicao } from './Cenario';

// O corredor entre uma sala e outra. A parede é desenhada um pouco mais larga que a tela
// e se repete a cada PERIODO pixels, então dá pra rolar sem emenda (é a câmera seguindo a Lia).
const PERIODO = 96;
const PAREDE = montarParede(LARGURA + PERIODO, PERIODO);
const PISO = montarChao(LARGURA + PERIODO);
const TOCHAS = [40, 40 + PERIODO, 40 + 2 * PERIODO];

// colunas na frente dos personagens, passando mais rápido que a parede
const INTERVALO_DAS_COLUNAS = 128;
const COLUNAS = [24, 24 + INTERVALO_DAS_COLUNAS, 24 + 2 * INTERVALO_DAS_COLUNAS];

function Coluna({ x }) {
  return (
    <g>
      <rect x={x} y={0} width={14} height={ALTURA} fill="#0d0a14" />
      <rect x={x + 1} y={0} width={1} height={ALTURA} fill="#262b44" />
      <rect x={x - 2} y={0} width={18} height={6} fill="#0d0a14" />
      <rect x={x - 2} y={6} width={18} height={1} fill="#262b44" />
      <rect x={x - 3} y={ALTURA - 9} width={20} height={9} fill="#0d0a14" />
      <rect x={x - 3} y={ALTURA - 9} width={20} height={1} fill="#262b44" />
    </g>
  );
}

const Fundo = memo(function Fundo() {
  return (
    <svg className="corredor__fundo" viewBox={`0 0 ${LARGURA} ${ALTURA}`} shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <radialGradient id="luz-do-corredor">
          <stop offset="0" stopColor="#f77622" stopOpacity="0.3" />
          <stop offset="1" stopColor="#f77622" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="corredor__rolagem">
        <rect width={LARGURA + PERIODO} height={ALTURA} fill="#262b44" />
        <Retangulos lista={PAREDE} />
        <Retangulos lista={PISO} />
        {TOCHAS.map((x) => (
          <g key={x}>
            <circle cx={x + 4} cy={26} r={40} fill="url(#luz-do-corredor)" />
            <NoFundo desenho={TOCHA} x={x} y={20} />
          </g>
        ))}
      </g>
    </svg>
  );
});

const Frente = memo(function Frente() {
  return (
    <svg className="corredor__frente" viewBox={`0 0 ${LARGURA} ${ALTURA}`} shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <radialGradient id="sombra-do-corredor" r="0.75">
          <stop offset="0.5" stopColor="#181425" stopOpacity="0" />
          <stop offset="1" stopColor="#181425" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      <g className="corredor__colunas">
        {COLUNAS.map((x) => (
          <Coluna key={x} x={x} />
        ))}
      </g>
      <rect width={LARGURA} height={ALTURA} fill="url(#sombra-do-corredor)" />
    </svg>
  );
});

function Viajante({ desenho, x, nome }) {
  return (
    <div className="corredor__viajante" style={posicao(x, 76, 16, 24)}>
      <span className="personagem__sombra" />
      <Sprite desenho={desenho} titulo={nome} className="personagem__sprite" />
    </div>
  );
}

export function Viagem({ transicao, aoPular }) {
  const ativa = Boolean(transicao);

  // qualquer tecla também adianta a viagem
  useEffect(() => {
    if (!ativa) return;
    function aoApertarTecla(evento) {
      if (['Escape', 'Enter', ' ', 'ArrowRight'].includes(evento.key)) {
        evento.preventDefault();
        aoPular();
      }
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [ativa, aoPular]);

  if (!transicao) return null;
  const { etapa, destino } = transicao;
  const { fase, modo } = destino;
  const comTom = fase.numero >= 2;

  return (
    <div className={`viagem viagem--${etapa}`} onPointerDown={aoPular}>
      <p className="so-leitor" role="status">
        Indo para a fase {fase.numero}: {fase.titulo}
      </p>

      {etapa !== 'saindo' && (
        <div className="viagem__painel" aria-hidden="true">
          <div className="corredor">
            <Fundo />
            {comTom && <Viajante desenho={TOM_ANDANDO} x={62} nome="Tom" />}
            <Viajante desenho={LIA_ANDANDO} x={84} nome="Lia" />
            <Frente />
            <div className="corredor__placa">
              <span className="corredor__numero">Fase {fase.numero}</span>
              <strong className="corredor__titulo">{fase.titulo}</strong>
            </div>
          </div>
          <div className="viagem__legenda">
            <span className="etiqueta">{fase.conceito}</span>
            <span>Modo {modo === 'web' ? 'Web' : 'Mobile'}</span>
          </div>
          <span className="viagem__pular">
            <span className="so-tela-grande">Clique ou aperte Enter para pular</span>
            <span className="so-celular">Toque para pular</span>
          </span>
        </div>
      )}
    </div>
  );
}
