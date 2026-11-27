import { memo } from 'react';
import { montarLetreiro } from '../pixel/letreiro';

const LETREIRO = montarLetreiro();

// faísca que pisca no canto da primeira letra de ouro
const FAISCA = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [1, 2],
];

export const Logo = memo(function Logo({ className = '' }) {
  const { largura, altura, retangulos, ouro } = LETREIRO;
  const canto = ouro[0];
  return (
    <svg
      className={`logo ${className}`}
      viewBox={`0 0 ${largura} ${altura}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="logo-ouro">
          {ouro.map((r) => (
            <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.largura} height={1} />
          ))}
        </clipPath>
      </defs>
      {retangulos.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.largura} height={1} fill={r.cor} />
      ))}
      {/* reflexo passando pelas letras de ouro de vez em quando */}
      <g clipPath="url(#logo-ouro)">
        <polygon className="logo__reflexo" points={`0,${altura} 3,${altura} ${3 + altura},0 ${altura},0`} fill="#ffffff" />
      </g>
      <g className="logo__faisca" transform={`translate(${canto.x - 1} ${canto.y - 1})`}>
        {FAISCA.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#ffffff" />
        ))}
      </g>
    </svg>
  );
});
