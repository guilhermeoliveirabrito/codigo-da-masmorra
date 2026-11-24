import { useRef } from 'react';

// símbolos chatos de achar no teclado do celular
const SIMBOLOS = ['<', '>', '/', '{', '}', '(', ')', '=', '"', "'", ';', '.'];

export function Editor({ valor, aoMudar, aoRodar }) {
  const areaRef = useRef(null);
  const numerosRef = useRef(null);
  const totalDeLinhas = valor.split('\n').length;

  function inserir(texto) {
    const area = areaRef.current;
    area.focus();
    // execCommand mantém o Ctrl+Z funcionando
    if (!document.execCommand?.('insertText', false, texto)) {
      const { selectionStart: inicio, selectionEnd: fim } = area;
      aoMudar(valor.slice(0, inicio) + texto + valor.slice(fim));
      requestAnimationFrame(() => {
        area.selectionStart = area.selectionEnd = inicio + texto.length;
      });
    }
  }

  function aoApertarTecla(evento) {
    if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey)) {
      evento.preventDefault();
      aoRodar();
      return;
    }

    if (evento.key === 'Tab') {
      evento.preventDefault();
      inserir('  ');
      return;
    }

    // mantém o recuo, e recua mais depois de { ( ou de tag aberta
    if (evento.key === 'Enter') {
      const area = evento.currentTarget;
      const antes = valor.slice(0, area.selectionStart);
      const linhaAtual = antes.slice(antes.lastIndexOf('\n') + 1);
      const recuo = linhaAtual.match(/^ */)[0];
      const abriuAlgo =
        /[{(]\s*$/.test(linhaAtual) ||
        (/>\s*$/.test(linhaAtual) && !/\/>\s*$/.test(linhaAtual) && !/<\//.test(linhaAtual));
      evento.preventDefault();
      inserir('\n' + recuo + (abriuAlgo ? '  ' : ''));
    }
  }

  return (
    <div className="editor">
      <div className="editor__area">
        <pre className="editor__numeros" ref={numerosRef} aria-hidden="true">
          {Array.from({ length: totalDeLinhas }, (_, i) => i + 1).join('\n')}
        </pre>
        <textarea
          ref={areaRef}
          value={valor}
          onChange={(evento) => aoMudar(evento.target.value)}
          onKeyDown={aoApertarTecla}
          onScroll={(evento) => {
            numerosRef.current.scrollTop = evento.currentTarget.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
          aria-label="Editor de código"
        />
      </div>

      <div className="editor__simbolos" aria-label="Símbolos">
        {SIMBOLOS.map((simbolo) => (
          <button
            key={simbolo}
            type="button"
            onMouseDown={(evento) => evento.preventDefault()}
            onClick={() => inserir(simbolo)}
          >
            {simbolo}
          </button>
        ))}
      </div>
    </div>
  );
}
