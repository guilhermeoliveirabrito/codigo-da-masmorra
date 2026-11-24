// Formatação mínima: `código`, **negrito**, *itálico* e quebra de linha.

const PEDACOS = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function formatarLinha(linha) {
  return linha.split(PEDACOS).map((pedaco, i) => {
    if (pedaco.startsWith('`')) return <code key={i}>{pedaco.slice(1, -1)}</code>;
    if (pedaco.startsWith('**')) return <strong key={i}>{pedaco.slice(2, -2)}</strong>;
    if (pedaco.startsWith('*') && pedaco.length > 2) return <em key={i}>{pedaco.slice(1, -1)}</em>;
    return pedaco;
  });
}

export function TextoRico({ texto, como: Tag = 'p', className }) {
  return texto.split('\n').map((linha, i) => (
    <Tag key={i} className={className}>
      {formatarLinha(linha)}
    </Tag>
  ));
}
