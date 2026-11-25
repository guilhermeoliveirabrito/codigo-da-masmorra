import { useContext, useEffect } from 'react';
import { CHAVE, PEDRA, TOCHA, TOCHA_APAGADA } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';
import { ContextoDaCena } from './contextoDaCena';

// Peças que o jogador importa com: import { Chama } from 'masmorra';
// Funcionam igual nos modos Web e Mobile.

export function Chama({ acesa = false }) {
  const { avisar } = useContext(ContextoDaCena);
  const ligada = Boolean(acesa);

  useEffect(() => {
    avisar('chama', ligada);
  }, [avisar, ligada]);

  return (
    <Sprite
      desenho={ligada ? TOCHA : TOCHA_APAGADA}
      className="masmorra masmorra--chama"
      data-masmorra="chama"
      data-acesa={String(ligada)}
    />
  );
}

export function Chave() {
  return <Sprite desenho={CHAVE} className="masmorra masmorra--chave" data-masmorra="chave" />;
}

export function Pedra() {
  return <Sprite desenho={PEDRA} className="masmorra masmorra--pedra" data-masmorra="pedra" />;
}

const MADEIRAS = {
  carvalho: ['#b86f50', '#733e39', '#e4a672'],
  pinho: ['#e4a672', '#b86f50', '#ead4aa'],
  cedro: ['#be4a2f', '#733e39', '#d77643'],
  ebano: ['#3e2731', '#181425', '#733e39'],
};

export function Tabua({ madeira = 'carvalho' }) {
  const [cor, sombra, luz] = MADEIRAS[madeira] ?? ['#8b9bb4', '#5a6988', '#c0cbdc'];
  return (
    <svg
      className="sprite masmorra masmorra--tabua"
      data-masmorra="tabua"
      data-madeira={madeira}
      viewBox="0 0 16 6"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width="16" height="6" fill="#181425" />
      <rect x="1" y="1" width="14" height="4" fill={cor} />
      <rect x="1" y="1" width="14" height="1" fill={luz} />
      <rect x="3" y="3" width="4" height="1" fill={sombra} />
      <rect x="9" y="2" width="3" height="1" fill={sombra} />
      <rect x="2" y="2" width="1" height="1" fill="#8b9bb4" />
      <rect x="13" y="3" width="1" height="1" fill="#8b9bb4" />
    </svg>
  );
}

// Arco do portão: largura da abertura em cada linha (semicírculo de raio 9)
const LINHAS_DO_PORTAO = Array.from({ length: 30 }, (_, y) => {
  const raio = 9;
  const largura = y < raio ? Math.round(2 * Math.sqrt(raio * raio - (raio - y - 0.5) ** 2)) : 18;
  return { y, largura: largura - (largura % 2) };
});

function Portao({ aberta }) {
  return (
    <svg
      className="sprite masmorra masmorra--portao"
      data-masmorra={aberta ? 'porta-aberta' : 'porta-fechada'}
      viewBox="0 0 24 30"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {LINHAS_DO_PORTAO.map(({ y, largura }) => {
        const inicio = 12 - largura / 2;
        return (
          <g key={y}>
            <rect x={inicio - 3} y={y} width={largura + 6} height={1} fill="#5a6988" />
            <rect x={inicio - 3} y={y} width={1} height={1} fill="#8b9bb4" />
            <rect x={inicio + largura + 2} y={y} width={1} height={1} fill="#262b44" />
            {aberta ? (
              <>
                <rect x={inicio} y={y} width={largura} height={1} fill="#f77622" />
                <rect x={inicio + 2} y={y} width={Math.max(largura - 4, 0)} height={1} fill="#feae34" />
                <rect x={inicio + 5} y={y} width={Math.max(largura - 10, 0)} height={1} fill="#fee761" />
              </>
            ) : (
              <rect x={inicio} y={y} width={largura} height={1} fill="#181425" />
            )}
          </g>
        );
      })}
      {[5, 9, 13, 17].map((x) => (
        <g key={x}>
          <rect x={x} y={aberta ? 0 : 2} width={1} height={aberta ? 4 : 27} fill="#8b9bb4" />
          <rect x={x + 1} y={aberta ? 0 : 2} width={1} height={aberta ? 4 : 27} fill="#3a4466" />
          <rect x={x} y={aberta ? 4 : 29} width={2} height={1} fill="#c0cbdc" />
        </g>
      ))}
      {!aberta &&
        [12, 22].map((y) => (
          <g key={y}>
            <rect x={4} y={y} width={16} height={1} fill="#8b9bb4" />
            <rect x={4} y={y + 1} width={16} height={1} fill="#3a4466" />
          </g>
        ))}
    </svg>
  );
}

export function PortaAberta() {
  return <Portao aberta />;
}

export function PortaFechada() {
  return <Portao aberta={false} />;
}
