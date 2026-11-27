import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BUGS } from '../caca/bugs';
import { Cena, Tela, posicao } from '../components/Cenario';
import { Editor } from '../components/Editor';
import { Resultado } from '../components/Resultado';
import { fases } from '../fases';
import { criarAmbienteDaCena } from '../motor/ambiente';
import { carregarMotor } from '../motor/carregarMotor';
import { pegarComponente } from '../motor/componente';
import { traduzirErro } from '../motor/erros';
import { ritmoDaMusica, tocarMusica } from '../musica';
import { BUGADO, BUGADO_BRAVO, MOEDA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocar } from '../som';

export const DURACAO = 180;
export const PONTOS_POR_MOEDA = 50;
const COMBO_MAXIMO = 5;
const BONUS_POR_SEGUNDO = 10;

const FALAS = {
  oi: 'Hehe! Quebrei a masmorra toda. Duvido você consertar!',
  novo: ['Hehe, quebrei esse aqui!', 'Duvido você achar o erro.', 'Esse eu caprichei.', 'Mexi só numa coisinha...', 'Esse tá impossível.'],
  conserto: ['Nãaao! Meu bug!', 'Sorte de principiante.', 'Hmpf. Esse era fácil.', 'Como você achou?!', 'Eu ia consertar mesmo...'],
  combo: ['Para de consertar tudo!', 'Você tá rápido demais!', 'Isso não é justo!'],
  pulo: ['Desistiu? Hehehe!', 'Fugiu do bug!', 'Esse fica pra depois, né?'],
  erro: ['Errou! Hehe.', 'Quase... só que não.', 'Ainda quebrado!', 'Tenta de novo!'],
};
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// o painel onde aparece o componente que o goblin quebrou
function Painel() {
  return (
    <g>
      <rect x={7} y={7} width={102} height={56} fill="#181425" />
      <rect x={8} y={8} width={100} height={54} fill="#5a6988" />
      <rect x={8} y={8} width={100} height={1} fill="#8b9bb4" />
      <rect x={8} y={8} width={1} height={54} fill="#8b9bb4" />
      <rect x={11} y={11} width={94} height={48} fill="#181425" />
      <rect x={30} y={63} width={2} height={17} fill="#262b44" />
      <rect x={84} y={63} width={2} height={17} fill="#262b44" />
    </g>
  );
}

const relogio = (segundos) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
const conceitoDo = (bug) => fases.find((fase) => fase.id === bug.fase)?.conceito;
const PLACAR_ZERADO = { pontos: 0, combo: 1, melhorCombo: 1, consertados: 0 };

// só entra bug de fase que o jogador já passou nesse modo
export function bugsDisponiveis(concluidas) {
  return BUGS.filter((bug) => concluidas.includes(bug.fase));
}

export function CacaAosBugs({ modo, concluidas, recorde, aoTerminar, aoVoltar }) {
  const disponiveis = useMemo(() => bugsDisponiveis(concluidas), [concluidas]);
  const [etapa, setEtapa] = useState('comeco'); // comeco, jogando, fim
  const [fila, setFila] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [placar, setPlacar] = useState(PLACAR_ZERADO);
  const [restante, setRestante] = useState(DURACAO);
  const [resultado, setResultado] = useState(null);
  const [goblin, setGoblin] = useState({ fala: FALAS.oi, bravo: false, vez: 0 });
  const [ganho, setGanho] = useState(null);
  const [tela, setTela] = useState(null); // o componente do jogador desenhado na cena
  const [rodando, setRodando] = useState(false);
  // depois de um conserto, o próximo bug demora um pouco: nesse meio-tempo nada conta de novo
  const [trocando, setTrocando] = useState(false);
  const [final, setFinal] = useState(null);

  const bug = BUGS.find((b) => b.id === fila[0]) ?? null;
  const fimRef = useRef(0);
  const cenarioRef = useRef(null);
  const esperasRef = useRef([]);
  const estadoRef = useRef({});
  useLayoutEffect(() => {
    estadoRef.current = { etapa, placar, restante, fila };
  });

  const depois = useCallback((funcao, ms) => {
    esperasRef.current.push(setTimeout(funcao, ms));
  }, []);

  useEffect(
    () => () => {
      esperasRef.current.forEach(clearTimeout);
      cenarioRef.current?.limpar();
    },
    []
  );

  const falar = useCallback((fala, bravo = false) => setGoblin((atual) => ({ fala, bravo, vez: atual.vez + 1 })), []);

  // roda o código só pra mostrar na cena como ele está (quebrado ou não)
  const mostrarNaCena = useCallback(
    async (codigoDaVez, bugDaVez) => {
      cenarioRef.current?.limpar();
      const cenario = criarAmbienteDaCena({ rotas: bugDaVez.rotas });
      cenarioRef.current = cenario;
      try {
        const { executar } = await carregarMotor();
        const modulo = executar(codigoDaVez, modo, new Set(), { aoErroEmEvento: () => {}, ambiente: cenario.ambiente });
        const { Componente } = pegarComponente(modulo, bugDaVez.componente);
        setTela(Componente ? { Componente, vez: Date.now() } : null);
      } catch {
        setTela(null);
      }
    },
    [modo]
  );

  const carregar = useCallback(
    (id) => {
      const proximo = BUGS.find((b) => b.id === id);
      setCodigo(proximo.codigo[modo]);
      setResultado(null);
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

  async function consertar() {
    if (travado) return;
    setRodando(true);
    tocar('rodar');
    const avisos = new Set();
    const errosDeClique = [];
    const traduzir = (e) => traduzirErro(e, codigo, modo);
    let veredito;
    try {
      const { executar } = await carregarMotor();
      const opcoes = { aoErroEmEvento: (e) => errosDeClique.push(e) };
      const { Componente, problema } = pegarComponente(executar(codigo, modo, avisos, opcoes), bug.componente);
      if (!Componente) veredito = { tipo: 'erro', mensagem: problema };
      else {
        const montar = (ambiente) => pegarComponente(executar(codigo, modo, avisos, { ...opcoes, ambiente }), bug.componente).Componente;
        veredito = await bug.testar({ Componente, modo, traduzir, avisos, montar });
      }
    } catch (e) {
      // código que nem roda: a dica do bug ajuda a achar onde
      const dica = bug.dica?.[modo] ?? bug.dica;
      veredito = { tipo: 'erro', mensagem: `${traduzir(e)}${typeof dica === 'string' ? ` ${dica}` : ''}` };
    }
    if (errosDeClique.length && veredito.tipo !== 'ok') {
      veredito = { tipo: 'erro', mensagem: `${traduzir(errosDeClique[0])} (Isso aconteceu no clique.)` };
    }
    setRodando(false);
    if (estadoRef.current.etapa !== 'jogando') return;
    mostrarNaCena(codigo, bug);

    if (veredito.tipo !== 'ok') {
      tocar(veredito.tipo === 'quase' ? 'quase' : 'erro');
      setResultado({ ...veredito, id: Date.now(), avisos: veredito.esconderAvisos ? [] : [...avisos] });
      falar(sortear(FALAS.erro));
      return;
    }

    const valeu = 100 * placar.combo;
    const combo = Math.min(placar.combo + 1, COMBO_MAXIMO);
    setPlacar((atual) => ({
      pontos: atual.pontos + valeu,
      combo,
      melhorCombo: Math.max(atual.melhorCombo, combo),
      consertados: atual.consertados + 1,
    }));
    setGanho({ pontos: valeu, vez: Date.now() });
    setResultado({ tipo: 'ok', mensagem: `Consertado! +${valeu} pontos.`, id: Date.now(), avisos: [] });
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

  function pular() {
    if (travado) return;
    tocar('quase');
    setPlacar((atual) => ({ ...atual, combo: 1 }));
    falar(sortear(FALAS.pulo));
    // o bug pulado volta pro fim da fila
    proximoBug([...fila.slice(1), fila[0]]);
  }

  const goblinVisto = goblin.bravo ? BUGADO_BRAVO : BUGADO;

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
        <Cena tochas={[134, 178]} fundo={<Painel />}>
          <Tela modo={modo} vazio="quebrado" className="painel__tela caca__tela" style={posicao(12, 12, 92, 46)}>
            {tela && <tela.Componente key={tela.vez} {...(bug?.props ?? {})} />}
          </Tela>
          <div className="bugado" style={{ ...posicao(158, 78, 16, 21), '--meio': '4.17cqw' }}>
            <Sprite key={`goblin-${goblin.vez}`} desenho={goblinVisto} titulo="Bugado, o goblin" className="bugado__sprite" />
            {goblin.fala && (
              <span key={`fala-${goblin.vez}`} className="balao balao--direita">
                {goblin.fala}
              </span>
            )}
            {ganho && (
              <span key={ganho.vez} className="caca__ganho" aria-hidden="true">
                +{ganho.pontos}
              </span>
            )}
          </div>
        </Cena>
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
            <button type="button" className="botao botao--pedra" onClick={pular} disabled={travado}>
              Pular
            </button>
            <button type="button" className="botao botao--fogo" onClick={consertar} disabled={travado} data-som="nenhum">
              <Icone nome="rodar" />
              Consertar
            </button>
          </div>
        </div>
        <Editor valor={codigo} aoMudar={setCodigo} aoRodar={consertar} />
        {resultado ? (
          <Resultado key={resultado.id} resultado={resultado} />
        ) : (
          <p className="caca__ajuda">Ache o que o goblin quebrou e aperte Consertar (ou Ctrl + Enter). Pular zera o combo.</p>
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
