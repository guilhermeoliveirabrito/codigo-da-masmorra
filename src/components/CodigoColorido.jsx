import { memo } from 'react';
import { realcar, realcarEmLinhas } from './realce';

// acima disso não vale a pena colorir a cada tecla
const LIMITE = 20_000;

function Pedacos({ pedacos }) {
  return pedacos.map(([tipo, texto], i) =>
    tipo ? (
      <span key={i} className={`cor-${tipo}`}>
        {texto}
      </span>
    ) : (
      texto
    )
  );
}

export const CodigoColorido = memo(function CodigoColorido({ codigo }) {
  if (codigo.length > LIMITE) return codigo;
  return <Pedacos pedacos={realcar(codigo)} />;
});

// notas: [{ marca, texto }], cada nota vai na primeira linha que tem a "marca"
// (assim a mesma nota serve pro código Web e pro Mobile)
export function acharNotas(codigo, notas = []) {
  const linhas = codigo.split('\n');
  const usadas = new Set();
  const achadas = [];
  for (const nota of notas) {
    const linha = linhas.findIndex((texto, i) => !usadas.has(i) && texto.includes(nota.marca));
    if (linha === -1) continue;
    usadas.add(linha);
    achadas.push({ ...nota, linha });
  }
  achadas.sort((a, b) => a.linha - b.linha);
  return achadas.map((nota, i) => ({ ...nota, numero: i + 1 }));
}

export function CodigoComNotas({ codigo, notas }) {
  const porLinha = new Map(notas.map((nota) => [nota.linha, nota.numero]));
  return realcarEmLinhas(codigo).map((pedacos, i, todas) => (
    <span key={i} className={porLinha.has(i) ? 'linha linha--marcada' : 'linha'}>
      <span className="linha__margem">
        {porLinha.has(i) && (
          <span className="linha__marca" aria-label={`nota ${porLinha.get(i)}`}>
            {porLinha.get(i)}
          </span>
        )}
      </span>
      <Pedacos pedacos={pedacos} />
      {i < todas.length - 1 && '\n'}
    </span>
  ));
}
