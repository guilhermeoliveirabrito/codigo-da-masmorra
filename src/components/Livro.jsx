import { useEffect, useState } from 'react';
import { Icone } from '../pixel/Sprite';
import { tocar } from '../som';
import { CodigoColorido, CodigoComNotas, acharNotas } from './CodigoColorido';
import { Experimente } from './Experimente';
import { TextoRico } from './TextoRico';

// um campo pode valer pros dois modos ou ser { web, mobile }
export function doModo(valor, modo) {
  if (valor && typeof valor === 'object' && !Array.isArray(valor) && ('web' in valor || 'mobile' in valor)) {
    return valor[modo];
  }
  return valor;
}

function AbasDoModo({ aba, aoTrocar }) {
  return (
    <div className="livro__abas" role="tablist">
      {['web', 'mobile'].map((opcao) => (
        <button
          key={opcao}
          type="button"
          role="tab"
          aria-selected={aba === opcao}
          className={aba === opcao ? 'livro__aba--ativa' : ''}
          onClick={() => aoTrocar(opcao)}
        >
          <Icone nome={opcao} />
          {opcao === 'web' ? 'Web' : 'Mobile'}
        </button>
      ))}
    </div>
  );
}

// código com abas Web/Mobile; com "notas", ganha números nas linhas e a explicação de cada uma
function BlocoDeCodigo({ codigo, notas, legenda, modo }) {
  const [aba, setAba] = useState(modo);
  const temDoisModos = typeof codigo === 'object';
  const texto = doModo(codigo, aba);
  const achadas = notas ? acharNotas(texto, notas.map((nota) => ({ ...nota, texto: doModo(nota.texto, aba) }))) : [];

  return (
    <figure className="livro__codigo">
      {temDoisModos && <AbasDoModo aba={aba} aoTrocar={setAba} />}
      <pre>{achadas.length ? <CodigoComNotas codigo={texto} notas={achadas} /> : <CodigoColorido codigo={texto} />}</pre>
      {legenda && (
        <figcaption>
          <TextoRico texto={doModo(legenda, aba)} como="span" />
        </figcaption>
      )}
      {achadas.length > 0 && (
        <ol className="livro__notas">
          {achadas.map((nota) => (
            <li key={nota.numero}>
              <span className="linha__marca">{nota.numero}</span>
              <div>
                <TextoRico texto={nota.texto} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

function Bloco({ bloco, modo }) {
  if (bloco.tipo === 'codigo') return <BlocoDeCodigo {...bloco} modo={modo} />;
  const texto = doModo(bloco.texto, modo);
  return texto ? <TextoRico texto={texto} /> : null;
}

function Secao({ titulo, className = '', children }) {
  return (
    <section className={`livro__secao ${className}`}>
      <h3>{titulo}</h3>
      {children}
    </section>
  );
}

function WebEMobile({ diferencas, modo }) {
  return (
    <>
      {diferencas.igual && <TextoRico texto={diferencas.igual} />}
      <div className="livro__comparar">
        {['web', 'mobile'].map((opcao) => (
          <div key={opcao} className={opcao === modo ? 'livro__lado livro__lado--atual' : 'livro__lado'}>
            <span className="livro__lado-titulo">
              <Icone nome={opcao} />
              {opcao === 'web' ? 'Web' : 'Mobile'}
              {opcao === modo && <span className="livro__voce">seu modo</span>}
            </span>
            <TextoRico texto={diferencas[opcao]} />
          </div>
        ))}
      </div>
    </>
  );
}

export function Passos({ passos, className = '' }) {
  return (
    <ol className={`passos ${className}`}>
      {passos.map((passo, i) => (
        <li key={i}>
          <span className="passos__numero">{i + 1}</span>
          <div>
            <TextoRico texto={passo} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Pagina({ fase, modo }) {
  const { livro } = fase;
  const passos = doModo(fase.passos, modo);

  return (
    <>
      <div className="livro__resumo">
        <span className="etiqueta">Em uma frase</span>
        <TextoRico texto={doModo(livro.resumo, modo)} />
      </div>

      <Secao titulo="A ideia">
        <TextoRico texto={doModo(livro.ideia, modo)} />
      </Secao>

      <Secao titulo="Como se escreve">
        <BlocoDeCodigo {...livro.exemplo} modo={modo} />
        {livro.extras?.map((bloco, i) => (
          <Bloco key={i} bloco={bloco} modo={modo} />
        ))}
      </Secao>

      <Secao titulo="Experimente" className="livro__secao--experimente">
        <Experimente demo={livro.experimente} modo={modo} />
      </Secao>

      <Secao titulo="Na Web e no Mobile">
        <WebEMobile diferencas={livro.diferencas} modo={modo} />
      </Secao>

      <div className="livro__nota livro__nota--alerta">
        <span className="etiqueta">Cuidado</span>
        <TextoRico texto={doModo(livro.cuidado, modo)} />
      </div>

      {passos && (
        <Secao titulo="Nesta fase">
          <Passos passos={passos} />
        </Secao>
      )}

      <div className="livro__nota livro__nota--pratica">
        <span className="etiqueta">Na prática</span>
        <TextoRico texto={doModo(livro.pratica, modo)} />
      </div>
    </>
  );
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
    tocar('pagina');
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
              data-som="nenhum"
              onClick={() => abrirPagina(i)}
            >
              {i >= liberadas ? <Icone nome="cadeado" /> : <span className="livro__numero">{i + 1}</span>}
              {f.livro.titulo}
            </button>
          ))}
        </nav>

        <article className="livro__pagina">
          <div className="livro__topo">
            <span className="livro__fase">
              Fase {pagina + 1} · {fase.conceito}
            </span>
            <button type="button" className="botao botao--pedra botao--pequeno" onClick={aoFechar} autoFocus>
              Fechar
            </button>
          </div>
          <h2>{fase.livro.titulo}</h2>
          <Pagina key={`${fase.id}-${modo}`} fase={fase} modo={modo} />

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
