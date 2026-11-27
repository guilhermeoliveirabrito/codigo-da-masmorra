import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BUGS, linhaDoBug } from '../caca/bugs';
import { CenaDoBug, FALAS, sortear, useGoblin, useTelaDoBug } from '../caca/CenaDoBug';
import { conferir } from '../caca/conferir';
import { Compartilhar } from '../components/Compartilhar';
import { Editor } from '../components/Editor';
import { Resultado } from '../components/Resultado';
import { textoDaCaca } from '../compartilhar';
import { fases } from '../fases';
import { ritmoDaMusica, tocarMusica } from '../musica';
import { BUGADO, BUGADO_BRAVO, MOEDA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocar } from '../som';

export const DURACAO = 180;
export const PONTOS_POR_MOEDA = 50;
const COMBO_MAXIMO = 5;
const BONUS_POR_SEGUNDO = 10;

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const relogio = (segundos) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
export const conceitoDo = (bug) => fases.find((fase) => fase.id === bug.fase)?.conceito;
const PLACAR_ZERADO = { pontos: 0, combo: 1, melhorCombo: 1, consertados: 0 };

// só entra bug de fase que o jogador já passou nesse modo
export function bugsDisponiveis(concluidas) {
  return BUGS.filter((bug) => concluidas.includes(bug.fase));
}

// o que a lupa mostra embaixo do editor
export function PistaDaLupa({ linha, pista, aviso }) {
  return (
    <p className="caca__lupa" role="status">
      <Icone nome="lupa" />
      <span>
        <strong>Linha {linha}:</strong> {pista}
        {aviso && <small> {aviso}</small>}
      </span>
    </p>
  );
}

export function CacaAosBugs({ modo, concluidas, recorde, aoTerminar, aoVoltar }) {
  const disponiveis = useMemo(() => bugsDisponiveis(concluidas), [concluidas]);
  const [etapa, setEtapa] = useState('comeco'); // comeco, jogando, fim
  const [fila, setFila] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [placar, setPlacar] = useState(PLACAR_ZERADO);
  const [restante, setRestante] = useState(DURACAO);
  const [resultado, setResultado] = useState(null);
  const [goblin, falar] = useGoblin();
  const [ganho, setGanho] = useState(null);
  const [tela, mostrarNaCena] = useTelaDoBug(modo);
  const [rodando, setRodando] = useState(false);
  // depois de um conserto, o próximo bug demora um pouco: nesse meio-tempo nada conta de novo
  const [trocando, setTrocando] = useState(false);
  const [final, setFinal] = useState(null);
  // id do bug em que a lupa foi usada (o conserto dele vale metade)
  const [lupa, setLupa] = useState(null);

  const bug = BUGS.find((b) => b.id === fila[0]) ?? null;
  const fimRef = useRef(0);
  const esperasRef = useRef([]);
  const estadoRef = useRef({});
  useLayoutEffect(() => {
    estadoRef.current = { etapa, placar, restante, fila };
  });

  const depois = useCallback((funcao, ms) => {
    esperasRef.current.push(setTimeout(funcao, ms));
  }, []);

  useEffect(() => () => esperasRef.current.forEach(clearTimeout), []);

  const carregar = useCallback(
    (id) => {
      const proximo = BUGS.find((b) => b.id === id);
      setCodigo(proximo.codigo[modo]);
      setResultado(null);
      setLupa(null);
      mostrarNaCena(proximo.codigo[modo], proximo);
    },
    [modo, mostrarNaCena]
  );

  const terminar = useCallback(
    (limpou) => {
      const { etapa: agora, placar: fim, restante: sobrou } = estadoRef.current;
      if (agora !== 'jogando') return;
      esperasRef.current.forEach(clearTimeout);
      const bonus = limpou ? sobrou * BONUS_POR_SEGUNDO : 0;
      const pontos = fim.pontos + bonus;
      const resumo = {
        ...fim,
        pontos,
        bonus,
        limpou,
        novoRecorde: pontos > recorde,
        moedas: Math.floor(pontos / PONTOS_POR_MOEDA),
      };
      setFinal(resumo);
      setEtapa('fim');
      falar(resumo.novoRecorde ? 'Novo recorde?! Da próxima vez eu quebro mais coisa.' : 'Volta quando quiser perder de novo!');
      tocar(resumo.novoRecorde ? 'fanfarra' : 'acerto');
      aoTerminar(resumo);
    },
    [aoTerminar, falar, recorde]
  );

  function comecar() {
    const ordem = embaralhar(disponiveis.map((b) => b.id));
    setFila(ordem);
    setPlacar(PLACAR_ZERADO);
    setRestante(DURACAO);
    setFinal(null);
    setGanho(null);
    setTrocando(false);
    fimRef.current = performance.now() + DURACAO * 1000;
    setEtapa('jogando');
    carregar(ordem[0]);
    falar(sortear(FALAS.novo));
    tocar('porta');
  }

  // música da corrida enquanto joga; nos 10 segundos finais ela acelera
  const acabando = etapa === 'jogando' && restante <= 10;
  useEffect(() => {
    tocarMusica(etapa === 'jogando' ? 'corrida' : 'calma');
  }, [etapa]);
  useEffect(() => {
    if (acabando) ritmoDaMusica(1.25);
  }, [acabando]);
  useEffect(() => () => tocarMusica('calma'), []);

  // relógio: conta pelo horário de fim, pra não atrasar se a aba engasgar
  useEffect(() => {
    if (etapa !== 'jogando') return;
    const intervalo = setInterval(() => {
      const falta = Math.max(0, Math.ceil((fimRef.current - performance.now()) / 1000));
      setRestante((antes) => {
        if (falta !== antes && falta > 0 && falta <= 10) tocar('tique');
        return falta;
      });
      if (falta === 0) terminar(false);
    }, 200);
    return () => clearInterval(intervalo);
  }, [etapa, terminar]);

  function proximoBug(filaNova) {
    if (!filaNova.length) {
      terminar(true);
      return;
    }
    setFila(filaNova);
    carregar(filaNova[0]);
  }

  const travado = rodando || trocando || etapa !== 'jogando' || !bug;
  const comLupa = Boolean(bug) && lupa === bug.id;
  const linhaDaLupa = comLupa ? linhaDoBug(bug, modo, codigo) : 0;

  async function consertar() {
    if (travado) return;
    setRodando(true);
    tocar('rodar');
    const veredito = await conferir(bug, codigo, modo);
    setRodando(false);
    if (estadoRef.current.etapa !== 'jogando') return;
    mostrarNaCena(codigo, bug);

    if (veredito.tipo !== 'ok') {
      tocar(veredito.tipo === 'quase' ? 'quase' : 'erro');
      setResultado({ ...veredito, id: Date.now() });
      falar(sortear(FALAS.erro));
      return;
    }

    const valeu = (comLupa ? 50 : 100) * placar.combo;
    const combo = Math.min(placar.combo + 1, COMBO_MAXIMO);
    setPlacar((atual) => ({
      pontos: atual.pontos + valeu,
      combo,
      melhorCombo: Math.max(atual.melhorCombo, combo),
      consertados: atual.consertados + 1,
    }));
    setGanho({ texto: `+${valeu}`, vez: Date.now() });
    const mensagem = `Consertado! +${valeu} pontos${comLupa ? ' (metade, por causa da lupa)' : ''}.`;
    setResultado({ tipo: 'ok', mensagem, id: Date.now(), avisos: [] });
    falar(combo >= 4 ? sortear(FALAS.combo) : sortear(FALAS.conserto), true);
    tocar('acerto');
    const resto = fila.slice(1);
    setTrocando(true);
    depois(() => {
      setTrocando(false);
      if (estadoRef.current.etapa !== 'jogando') return;
      proximoBug(resto);
      if (resto.length) falar(sortear(FALAS.novo));
    }, 900);
  }

  function usarLupa() {
    if (travado || comLupa) return;
    setLupa(bug.id);
    falar(sortear(FALAS.lupa));
    tocar('lupa');
  }

  function pular() {
    if (travado) return;
    tocar('quase');
    setPlacar((atual) => ({ ...atual, combo: 1 }));
    falar(sortear(FALAS.pulo));
    // o bug pulado volta pro fim da fila
    proximoBug([...fila.slice(1), fila[0]]);
  }

  return (
    <main className={`caca ${restante <= 10 && etapa === 'jogando' ? 'caca--acabando' : ''}`} data-bug={bug?.id}>
      <header className="caca__topo">
        <button type="button" className="botao botao--pedra" onClick={aoVoltar} aria-label="Voltar ao menu">
          <Icone nome="menu" />
          <span className="so-tela-grande">Menu</span>
        </button>
        <h1>Caça aos bugs</h1>
        <div className="caca__placar" aria-live="off">
          <span className="caca__tempo" aria-label={`Faltam ${restante} segundos`}>
            {relogio(restante)}
          </span>
          <span className="caca__pontos" aria-label={`${placar.pontos} pontos`}>
            {placar.pontos}
            <small>pts</small>
          </span>
          <span className={`caca__combo caca__combo--${placar.combo}`} aria-label={`Combo ${placar.combo}`}>
            x{placar.combo}
          </span>
        </div>
      </header>

      <section className="caca__mundo" aria-label="Cena">
        <CenaDoBug modo={modo} bug={bug} tela={tela} goblin={goblin} ganho={ganho} />
        {bug && (
          <p className="caca__missao">
            <span className="etiqueta">{conceitoDo(bug)}</span>
            {bug.missao}
          </p>
        )}
      </section>

      <section className="caca__codigo" aria-label="Código">
        <div className="jogo__barra">
          <span className="jogo__arquivo">{bug?.arquivo ?? 'Bug.jsx'}</span>
          <div className="jogo__botoes">
            <button
              type="button"
              className="botao botao--pedra"
              onClick={pular}
              disabled={travado}
              aria-label="Pular"
              title="Manda o bug pro fim da fila e zera o combo"
            >
              <Icone nome="pular" />
              <span className="so-tela-grande">Pular</span>
            </button>
            <button
              type="button"
              className="botao botao--pedra"
              onClick={usarLupa}
              disabled={travado || comLupa}
              aria-label="Lupa"
              title="Mostra a linha do bug, mas o conserto vale metade"
              data-som="nenhum"
            >
              <Icone nome="lupa" className="icone--lupa" />
              <span className="so-tela-grande">Lupa</span>
            </button>
            <button type="button" className="botao botao--fogo" onClick={consertar} disabled={travado} data-som="nenhum">
              <Icone nome="rodar" />
              Consertar
            </button>
          </div>
        </div>
        <Editor
          valor={codigo}
          aoMudar={setCodigo}
          aoRodar={consertar}
          linhaMarcada={linhaDaLupa}
        />
        {comLupa && <PistaDaLupa linha={linhaDaLupa} pista={bug.pista} aviso="Esse conserto vale metade." />}
        {resultado ? (
          <Resultado key={resultado.id} resultado={resultado} />
        ) : (
          <p className="caca__ajuda">
            Ache o que o goblin quebrou e aperte Consertar (ou Ctrl + Enter). Pular zera o combo, e a lupa corta os pontos
            pela metade.
          </p>
        )}
      </section>

      {etapa === 'comeco' && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Caça aos bugs">
          <div className="janela caca__janela">
            <Sprite desenho={BUGADO} className="caca__retrato" />
            <h2>Caça aos bugs</h2>
            <p>
              O goblin Bugado entrou na masmorra e saiu quebrando componentes. Você tem <strong>3 minutos</strong> pra
              consertar o máximo que conseguir.
            </p>
            <ul className="caca__regras">
              <li>Cada conserto vale 100 pontos vezes o combo, que sobe até x{COMBO_MAXIMO}.</li>
              <li>Pular manda o bug pro fim da fila e zera o combo.</li>
              <li>Travou? A lupa mostra a linha do bug, mas aí o conserto vale metade.</li>
              <li>Consertou tudo antes do tempo? Cada segundo que sobrou vale {BONUS_POR_SEGUNDO} pontos.</li>
              <li>
                No fim, a cada {PONTOS_POR_MOEDA} pontos você ganha uma moeda.
              </li>
            </ul>
            <p className="caca__recorde">
              {disponiveis.length} bugs pra caçar no modo {modo === 'web' ? 'Web' : 'Mobile'}
              {recorde > 0 && ` · seu recorde: ${recorde}`}
            </p>
            <div className="vitoria__botoes">
              <button type="button" className="botao botao--fogo" onClick={comecar} autoFocus data-som="nenhum">
                Começar
              </button>
              <button type="button" className="botao botao--pedra" onClick={aoVoltar}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {etapa === 'fim' && final && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Fim da caça">
          <div className="janela caca__janela">
            <Sprite desenho={final.novoRecorde ? BUGADO_BRAVO : BUGADO} className="caca__retrato" />
            <h2>{final.limpou ? 'Você consertou tudo!' : 'Acabou o tempo!'}</h2>
            <p className="caca__total">
              {final.pontos}
              <small>pontos</small>
            </p>
            {final.novoRecorde ? (
              <p className="caca__recorde caca__recorde--novo">Novo recorde!</p>
            ) : (
              <p className="caca__recorde">Recorde: {recorde}</p>
            )}
            <ul className="caca__resumo">
              <li>
                <strong>{final.consertados}</strong> {final.consertados === 1 ? 'bug consertado' : 'bugs consertados'}
              </li>
              <li>
                <strong>x{final.melhorCombo}</strong> melhor combo
              </li>
              {final.bonus > 0 && (
                <li>
                  <strong>+{final.bonus}</strong> pelo tempo que sobrou
                </li>
              )}
            </ul>
            {final.moedas > 0 && (
              <p className="vitoria__moedas caca__moedas">
                <Sprite desenho={MOEDA} />+{final.moedas}
                <small>moedas</small>
              </p>
            )}
            <div className="vitoria__botoes">
              <button type="button" className="botao botao--fogo" onClick={comecar} autoFocus data-som="nenhum">
                Jogar de novo
              </button>
              {final.consertados > 0 && <Compartilhar texto={textoDaCaca(final, modo)} />}
              <button type="button" className="botao botao--pedra" onClick={aoVoltar}>
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
