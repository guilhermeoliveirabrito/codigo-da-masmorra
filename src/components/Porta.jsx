// Porta de madeira em arco, desenhada dentro do SVG da cena. x é o centro.
export function linhasDoArco(largura, altura) {
  const raio = largura / 2;
  return Array.from({ length: altura }, (_, y) => {
    let medida = largura;
    if (y < raio) {
      medida = Math.round(2 * Math.sqrt(raio * raio - (raio - y - 0.5) ** 2));
      medida -= medida % 2;
    }
    return { y, largura: Math.max(medida, 2) };
  });
}

export function Porta({ x, y, largura = 20, altura = 46, aberta, chao = 108 }) {
  const linhas = linhasDoArco(largura, altura);
  const esquerda = x - largura / 2;
  const tabuas = Math.ceil(largura / 4);
  const base = y + altura;

  return (
    <g className={`porta ${aberta ? 'porta--aberta' : ''}`}>
      {/* em três passadas: o contorno de uma linha não pode cobrir a cor da linha anterior */}
      {linhas.map(({ y: linha, largura: medida }) => (
        <rect key={`c${linha}`} x={x - medida / 2 - 4} y={y + linha - 1} width={medida + 8} height={2} fill="#181425" />
      ))}
      {linhas.map(({ y: linha, largura: medida }) => (
        <g key={`p${linha}`}>
          <rect x={x - medida / 2 - 3} y={y + linha} width={medida + 6} height={1} fill="#5a6988" />
          <rect x={x - medida / 2 - 3} y={y + linha} width={1} height={1} fill="#8b9bb4" />
        </g>
      ))}
      {linhas.map(({ y: linha, largura: medida }) => (
        <g key={`l${linha}`}>
          <rect x={x - medida / 2} y={y + linha} width={medida} height={1} fill="#f77622" />
          <rect x={x - medida / 2 + 3} y={y + linha} width={Math.max(medida - 6, 0)} height={1} fill="#feae34" />
          <rect x={x - medida / 2 + 6} y={y + linha} width={Math.max(medida - 12, 0)} height={1} fill="#fee761" />
        </g>
      ))}

      <polygon
        className="porta__claridade"
        points={`${esquerda},${base} ${esquerda + largura},${base} ${x + largura * 1.2},${chao} ${x - largura * 1.2},${chao}`}
        fill="#feae34"
      />

      <g className="porta__folha">
        {linhas.map(({ y: linha, largura: medida }) =>
          Array.from({ length: tabuas }, (_, i) => {
            const inicio = Math.max(esquerda + i * 4, x - medida / 2);
            const fim = Math.min(esquerda + i * 4 + 4, x + medida / 2);
            if (fim <= inicio) return null;
            return (
              <rect
                key={`${linha}-${i}`}
                x={inicio}
                y={y + linha}
                width={fim - inicio}
                height={1}
                fill={i % 2 ? '#733e39' : '#8a4b3c'}
              />
            );
          })
        )}
        {Array.from({ length: tabuas - 1 }, (_, i) => (
          <rect key={i} x={esquerda + (i + 1) * 4} y={y + largura / 4} width={1} height={altura - largura / 4} fill="#3e2731" />
        ))}
        {[0.3, 0.72].map((fracao) => (
          <g key={fracao}>
            <rect x={esquerda} y={y + Math.round(altura * fracao)} width={largura} height={2} fill="#5a6988" />
            <rect x={esquerda} y={y + Math.round(altura * fracao)} width={largura} height={1} fill="#8b9bb4" />
          </g>
        ))}
        <rect x={x + largura / 2 - 6} y={y + Math.round(altura * 0.5)} width={3} height={3} fill="#feae34" />
        <rect x={x + largura / 2 - 5} y={y + Math.round(altura * 0.5) + 1} width={1} height={1} fill="#181425" />
      </g>
    </g>
  );
}
