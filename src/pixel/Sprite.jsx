import { ICONES } from './desenhos';
import { PALETA } from './paleta';

// junta pixels seguidos da mesma cor num rect só
function retangulos(linhas) {
  const lista = [];
  linhas.forEach((linha, y) => {
    let x = 0;
    while (x < linha.length) {
      const letra = linha[x];
      let fim = x + 1;
      while (fim < linha.length && linha[fim] === letra) fim++;
      if (letra !== '.') lista.push({ x, y, largura: fim - x, cor: PALETA[letra] });
      x = fim;
    }
  });
  return lista;
}

function Camadas({ camadas }) {
  return camadas.flatMap((linhas, i) =>
    retangulos(linhas).map((r) => (
      <rect key={`${i}-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.largura} height={1} fill={r.cor} />
    ))
  );
}

export function tamanhoDoDesenho(desenho) {
  const camadas = desenho.camadas ?? desenho.quadros[0];
  return { largura: camadas[0][0].length, altura: camadas[0].length };
}

// recorte = [x, y, largura, altura]
export function Sprite({ desenho, recorte, className = '', style, titulo, ...resto }) {
  const { largura, altura } = tamanhoDoDesenho(desenho);
  const viewBox = (recorte ?? [0, 0, largura, altura]).join(' ');

  return (
    <svg
      {...resto}
      className={`sprite ${desenho.quadros ? 'sprite--animada' : ''} ${className}`}
      style={style}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      {desenho.quadros ? (
        desenho.quadros.map((camadas, i) => (
          <g key={i} className={`sprite__quadro sprite__quadro--${i + 1}`}>
            <Camadas camadas={camadas} />
          </g>
        ))
      ) : (
        <Camadas camadas={desenho.camadas} />
      )}
    </svg>
  );
}

export function Icone({ nome, className = '' }) {
  const linhas = ICONES[nome];
  return (
    <svg
      className={`icone ${className}`}
      viewBox={`0 0 ${linhas[0].length} ${linhas.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <Camadas camadas={[linhas]} />
    </svg>
  );
}

