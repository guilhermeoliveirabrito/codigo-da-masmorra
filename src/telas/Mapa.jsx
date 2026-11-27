import { useLayoutEffect, useRef, useState } from 'react';
import { TextoRico } from '../components/TextoRico';
import {
  ALAVANCA_CIMA,
  AMPULHETA,
  BAU_FECHADO,
  CABECA_DE_DRAGAO,
  CHAVE,
  CORVO,
  CRACHA,
  LIA,
  MOEDA,
  PEDRA,
  PLACA_PEQUENA,
  PONTE_PEQUENA,
  TOCHA,
} from '../pixel/desenhos';
import { PERSONAGENS } from '../pixel/personagens';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocarDeLeve } from '../som';

// o que aparece dentro de cada sala do mapa
const ICONE_DA_SALA = {
  placa: PLACA_PEQUENA,
  crachas: CRACHA,
  alavanca: ALAVANCA_CIMA,
  tocha: TOCHA,
  portoes: CHAVE,
  ponte: PONTE_PEQUENA,
  rio: PEDRA,
  porta: AMPULHETA,
  mensageiro: CORVO,
  guardiao: CABECA_DE_DRAGAO,
};

const colunasPara = (largura) => (largura >= 760 ? 4 : largura >= 500 ? 3 : 2);

// as salas seguem em zigue-zague: uma fileira pra direita, a de baixo pra esquerda
function lugarNaTrilha(i, colunas) {
  const linha = Math.floor(i / colunas);
  const passo = i % colunas;
  return { linha, coluna: linha % 2 === 0 ? passo : colunas - 1 - passo };
}

export function Mapa({
  fases,
  proximas,
  modo,
  concluidas,
  estrelas,
  segredos,
  faseAtual,
  estaLiberada,
  aoEscolher,
  aoVoltar,
  aoTrocarModo,
}) {
  const areaRef = useRef(null);
  const salasRef = useRef([]);
  const [colunas, setColunas] = useState(() => colunasPara(window.innerWidth - 32));
  const feitas = concluidas[modo];
  // começa escolhida a próxima sala por fazer, ou a última jogada
  const [escolhida, setEscolhida] = useState(() => {
    const proxima = fases.findIndex((fase, i) => estaLiberada(i) && !feitas.includes(fase.id));
    return proxima >= 0 ? proxima : faseAtual;
  });

  useLayoutEffect(() => {
    const area = areaRef.current;
    const medir = () => setColunas(colunasPara(area.clientWidth));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(area);
    return () => observador.disconnect();
  }, []);

  const total = fases.length + proximas.length;
  const linhas = Math.ceil(total / colunas);
  const lugares = Array.from({ length: total }, (_, i) => lugarNaTrilha(i, colunas));
  const fase = fases[escolhida];
  const liberada = estaLiberada(escolhida);
  const ganhas = estrelas[`${fase.id}-${modo}`] ?? 0;
  const guia = PERSONAGENS[fase.falas[0].quem];

  // clicar na sala escolhida de novo entra nela
  function escolher(i, { jogarSeRepetir = true } = {}) {
    if (i === escolhida && jogarSeRepetir && estaLiberada(i)) aoEscolher(i);
    else setEscolhida(i);
  }

  function andarComSetas(evento) {
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
    if (!passo) return;
    evento.preventDefault();
    const proxima = Math.min(Math.max(escolhida + passo, 0), fases.length - 1);
    escolher(proxima, { jogarSeRepetir: false });
    salasRef.current[proxima]?.focus();
    tocarDeLeve('passar');
  }

  return (
    <main className="mapa">
      <header className="mapa__topo">
        <button type="button" className="botao botao--pedra" onClick={aoVoltar}>
          <Icone nome="voltar" />
          Menu
        </button>
        <h1>Mapa da masmorra</h1>
        <div className="modo" role="group" aria-label="Modo">
          {['web', 'mobile'].map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={modo === opcao ? 'modo--ativo' : ''}
              aria-pressed={modo === opcao}
              onClick={() => aoTrocarModo(opcao)}
            >
              <Icone nome={opcao} />
              {opcao === 'web' ? 'Web' : 'Mobile'}
            </button>
          ))}
        </div>
      </header>

      <div className="mapa__corpo">
        <div ref={areaRef} className="mapa__area">
          <div className="mapa__tabuleiro" style={{ '--colunas': colunas, '--linhas': linhas }}>
            {/* a trilha liga o meio de uma sala ao da próxima; fica dourada por onde a turma já passou */}
            <svg className="mapa__trilha" viewBox={`0 0 ${colunas * 100} ${linhas * 100}`} preserveAspectRatio="none" aria-hidden="true">
              {lugares.slice(1).map((lugar, n) => {
                const de = lugares[n];
                const linha = { x1: de.coluna * 100 + 50, y1: de.linha * 100 + 50, x2: lugar.coluna * 100 + 50, y2: lugar.linha * 100 + 50 };
                const percorrida = n < fases.length && feitas.includes(fases[n].id);
                return (
                  <g key={n} className={percorrida ? 'trilha--percorrida' : ''}>
                    <line className="trilha__corredor" {...linha} />
                    <line className="trilha__pegadas" {...linha} />
                  </g>
                );
              })}
            </svg>

            <ol className="mapa__salas" onKeyDown={andarComSetas}>
              {fases.map((cada, i) => {
                const aberta = estaLiberada(i);
                const feita = feitas.includes(cada.id);
                const estrelasDaSala = estrelas[`${cada.id}-${modo}`] ?? 0;
                const proxima = aberta && !feita;
                const classes = [
                  'sala',
                  feita && 'sala--feita',
                  proxima && 'sala--proxima',
                  !aberta && 'sala--trancada',
                  i === escolhida && 'sala--escolhida',
                  cada.id === 'guardiao' && 'sala--chefe',
                ];
                return (
                  <li
                    key={cada.id}
                    className="mapa__lugar"
                    style={{ gridRow: lugares[i].linha + 1, gridColumn: lugares[i].coluna + 1, '--atraso': `${i * 40}ms` }}
                  >
                    <button
                      ref={(el) => {
                        salasRef.current[i] = el;
                      }}
                      type="button"
                      className={classes.filter(Boolean).join(' ')}
                      onClick={() => escolher(i)}
                      aria-label={`Fase ${cada.numero}: ${cada.titulo}${aberta ? `, ${estrelasDaSala} de 3 estrelas` : ', trancada'}`}
                      aria-current={i === escolhida ? 'true' : undefined}
                      tabIndex={i === escolhida ? 0 : -1}
                    >
                      <span className="sala__pedra">
                        <Sprite desenho={ICONE_DA_SALA[cada.id] ?? BAU_FECHADO} className="sala__icone" />
                        {!aberta && <Icone nome="cadeado" className="sala__cadeado" />}
                        {aberta && segredos.includes(cada.id) && <Sprite desenho={MOEDA} className="sala__segredo" />}
                      </span>
                      <span className="sala__legenda">
                        <span className="sala__numero">{cada.numero}</span>
                        {aberta && (
                          <span className="sala__estrelas" aria-hidden="true">
                            {[0, 1, 2].map((n) => (
                              <Icone key={n} nome="estrela" className={n < estrelasDaSala ? 'estrela--ganha' : ''} />
                            ))}
                          </span>
                        )}
                      </span>
                    </button>
                    {/* a turma fica parada na última sala jogada */}
                    {i === faseAtual && <Sprite desenho={LIA} className="mapa__turma" titulo="Você está aqui" />}
                  </li>
                );
              })}
              {proximas.map((cada, n) => {
                const i = fases.length + n;
                return (
                  <li key={cada.numero} className="mapa__lugar" style={{ gridRow: lugares[i].linha + 1, gridColumn: lugares[i].coluna + 1 }}>
                    <div className="sala sala--trancada sala--em-breve" title={`Fase ${cada.numero}: ${cada.titulo} (em breve)`}>
                      <span className="sala__pedra">
                        <span className="sala__breve">?</span>
                      </span>
                      <span className="sala__legenda">
                        <span className="sala__numero">{cada.numero}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <aside className="mapa__detalhe" aria-live="polite">
          <span className="mapa__qual">
            Fase {fase.numero} de {fases.length}
          </span>
          <h2>{fase.titulo}</h2>
          <span className="etiqueta">{fase.conceito}</span>
          <div className="mapa__fala">
            <Sprite desenho={guia.desenho} recorte={guia.desenho.rosto} className="mapa__rosto" />
            <TextoRico texto={fase.falas[0].texto} />
          </div>
          {liberada && (
            <ul className="mapa__selos">
              <li aria-label={`${ganhas} de 3 estrelas`}>
                {[0, 1, 2].map((n) => (
                  <Icone key={n} nome="estrela" className={n < ganhas ? 'estrela--ganha' : ''} />
                ))}
              </li>
              {['web', 'mobile'].map((opcao) => (
                <li key={opcao} className={concluidas[opcao].includes(fase.id) ? 'selo--feito' : ''}>
                  <Icone nome={opcao} />
                  {concluidas[opcao].includes(fase.id) ? 'feita' : 'falta'}
                </li>
              ))}
              <li className={segredos.includes(fase.id) ? 'selo--feito' : ''}>
                <Sprite desenho={MOEDA} />
                {segredos.includes(fase.id) ? 'segredo achado' : 'segredo escondido'}
              </li>
            </ul>
          )}
          <button type="button" className="botao botao--fogo mapa__jogar" disabled={!liberada} onClick={() => aoEscolher(escolhida)}>
            {liberada ? (feitas.includes(fase.id) ? 'Jogar de novo' : 'Entrar na sala') : 'Trancada'}
          </button>
          {!liberada && (
            <small className="mapa__aviso">
              Termine a fase {fase.numero - 1} no modo {modo === 'web' ? 'Web' : 'Mobile'} pra abrir esta sala.
            </small>
          )}
        </aside>
      </div>
    </main>
  );
}
