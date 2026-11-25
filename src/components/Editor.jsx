import { useLayoutEffect, useRef } from 'react';
import { CodigoColorido } from './CodigoColorido';

// símbolos chatos de achar no teclado do celular
const SIMBOLOS = ['<', '>', '/', '{', '}', '(', ')', '=', '"', "'", ';', '.'];

// O teclado do iPhone troca aspas retas por curvas, ... por … e -- por —,
// e nada disso funciona em código. Desfaz as trocas enquanto a pessoa digita.
const TROCAS_DO_TECLADO = [
  [/[“”„‟]/g, '"'],
  [/[‘’‚‛]/g, "'"],
  [/…/g, '...'],
  [/—/g, '--'],
  [/–/g, '-'],
  [/\u00a0/g, ' '],
];

function desfazerTrocasDoTeclado(texto) {
  return TROCAS_DO_TECLADO.reduce((atual, [padrao, certo]) => atual.replace(padrao, certo), texto);
}

export function Editor({ valor, aoMudar, aoRodar }) {
  const areaRef = useRef(null);
  const numerosRef = useRef(null);
  const realceRef = useRef(null);
  const cursorPendenteRef = useRef(null);

  // quando o texto é corrigido, o navegador joga o cursor pro fim; volta ele pro lugar
  // antes da próxima tecla
  useLayoutEffect(() => {
    if (cursorPendenteRef.current === null) return;
    const area = areaRef.current;
    area.selectionStart = area.selectionEnd = cursorPendenteRef.current;
    cursorPendenteRef.current = null;
  });
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

  function aoDigitar(evento) {
    const area = evento.target;
    const texto = area.value;
    const corrigido = desfazerTrocasDoTeclado(texto);
    if (corrigido === texto) {
      aoMudar(texto);
      return;
    }
    // o cursor anda junto com o que mudou de tamanho antes dele
    cursorPendenteRef.current = desfazerTrocasDoTeclado(texto.slice(0, area.selectionStart)).length;
    aoMudar(corrigido);
  }

  // o texto colorido fica embaixo do campo de digitar e rola junto com ele
  function aoRolar(evento) {
    const { scrollTop, scrollLeft } = evento.currentTarget;
    numerosRef.current.scrollTop = scrollTop;
    realceRef.current.scrollTop = scrollTop;
    realceRef.current.scrollLeft = scrollLeft;
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
        <div className="editor__campo">
          <pre className="editor__realce" ref={realceRef} aria-hidden="true">
            <CodigoColorido codigo={valor} />
            {'\n'}
          </pre>
          <textarea
            ref={areaRef}
            value={valor}
            onChange={aoDigitar}
            onKeyDown={aoApertarTecla}
            onScroll={aoRolar}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            enterKeyHint="enter"
            wrap="off"
            aria-label="Editor de código"
          />
        </div>
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
