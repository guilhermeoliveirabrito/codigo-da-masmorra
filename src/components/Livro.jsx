import { useEffect, useState } from 'react';
import { Icone } from '../pixel/Sprite';
import { TextoRico } from './TextoRico';

// um campo pode valer pros dois modos ou ser { web, mobile }
function doModo(valor, modo) {
  if (valor && typeof valor === 'object' && ('web' in valor || 'mobile' in valor)) {
    return valor[modo];
  }
  return valor;
}

function BlocoDeCodigo({ bloco, modo }) {
  const [aba, setAba] = useState(modo);
  const temDoisModos = typeof bloco.codigo === 'object';

  return (
    <figure className="livro__codigo">
      {temDoisModos && (
        <div className="livro__abas" role="tablist">
          {['web', 'mobile'].map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="tab"
              aria-selected={aba === opcao}
              className={aba === opcao ? 'livro__aba--ativa' : ''}
              onClick={() => setAba(opcao)}
            >
              <Icone nome={opcao} />
              {opcao === 'web' ? 'Web' : 'Mobile'}
            </button>
          ))}
        </div>
      )}
      <pre>{doModo(bloco.codigo, aba)}</pre>
      {bloco.legenda && <figcaption>{bloco.legenda}</figcaption>}
    </figure>
  );
}

function Bloco({ bloco, modo }) {
  if (bloco.tipo === 'codigo') return <BlocoDeCodigo bloco={bloco} modo={modo} />;

  const texto = doModo(bloco.texto, modo);
  if (!texto) return null;

  if (bloco.tipo === 'alerta' || bloco.tipo === 'pratica') {
    return (
      <div className={`livro__nota livro__nota--${bloco.tipo}`}>
        <span className="etiqueta">{bloco.tipo === 'alerta' ? 'Atenção' : 'Na prática'}</span>
        <TextoRico texto={texto} />
      </div>
    );
  }
  return <TextoRico texto={texto} />;
}

export function Livro({ fases, liberadas, paginaInicial, modo, introducao, aoFechar }) {
  const [pagina, setPagina] = useState(paginaInicial);
  const fase = fases[pagina];

  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  function abrirPagina(indice) {
    setPagina(indice);
    document.querySelector('.modal')?.scrollTo({ top: 0 });
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Livro">
      <div className="livro janela">
        <nav className="livro__indice">
          <span className="livro__titulo">
            <Icone nome="livro" />
            Livro
          </span>
          {fases.map((f, i) => (
            <button
              key={f.id}
              type="button"
              disabled={i >= liberadas}
              className={i === pagina ? 'livro__capitulo--ativo' : ''}
              onClick={() => abrirPagina(i)}
            >
              {i >= liberadas ? <Icone nome="cadeado" /> : <span className="livro__numero">{i + 1}</span>}
              {f.livro.titulo}
            </button>
          ))}
        </nav>

        <article className="livro__pagina">
          <div className="livro__topo">
            <span className="livro__fase">Fase {pagina + 1}</span>
            <button type="button" className="botao botao--pedra botao--pequeno" onClick={aoFechar} autoFocus>
              Fechar
            </button>
          </div>
          <h2>{fase.livro.titulo}</h2>
          {fase.livro.blocos.map((bloco, i) => (
            <Bloco key={`${fase.id}-${i}`} bloco={bloco} modo={modo} />
          ))}

          <div className="livro__rodape">
            <button type="button" className="botao botao--fogo" onClick={aoFechar}>
              {introducao ? 'Entendi, bora codar' : 'Fechar'}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
