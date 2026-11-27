import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { ComoJogar } from './components/ComoJogar';
import { AvisoDeConquista, ListaDeConquistas } from './components/Conquistas';
import { Livro } from './components/Livro';
import { Loja } from './components/Loja';
import { TelaDaFase } from './components/TelaDaFase';
import { Transicao } from './components/Transicao';
import { Viagem } from './components/Viagem';
import { CONQUISTAS, conquistar, ouvirConquistas } from './conquistas';
import { ITENS, ItensEmUso, temaEmUso } from './loja';
import { MOEDAS_POR_SEGREDO, SEGREDOS, SegredosAchados, ouvirSegredos } from './segredos';
import { fases, proximasFases } from './fases';
import { carregarMotorDepois } from './motor/carregarMotor';
import { useProgresso } from './hooks/useProgresso';
import { semAnimacao, useTransicao } from './hooks/useTransicao';
import { bugDoDia, hoje, moedasDoDia, ontemDe, sequenciaAtual } from './caca/doDia';
import { BugDoDia } from './telas/BugDoDia';
import { CacaAosBugs, bugsDisponiveis } from './telas/CacaAosBugs';
import { Mapa } from './telas/Mapa';
import { ligarMusica, tocarMusica } from './musica';
import { ligarSom, tocar } from './som';
import { Menu } from './telas/Menu';

// tempo pros personagens entrarem na sala antes do livro abrir sozinho
const ESPERA_DO_LIVRO = 1300;

export default function App() {
  const {
    progresso,
    irParaFase,
    trocarModo,
    salvarCodigo,
    apagarCodigo,
    concluirFase,
    ganharMoedas,
    guardarSegredo,
    comprar,
    alternarItem,
    salvarRecorde,
    cumprirDesafio,
    marcarLivroVisto,
    darEstrelas,
    ganharConquista,
    alternarSom,
    alternarMusica,
    apagarTudo,
  } = useProgresso();
  const { transicao, navegar, viajar, pular } = useTransicao();
  const [tela, setTela] = useState('menu');
  const [livroAberto, setLivroAberto] = useState(false);
  const [comoJogarAberto, setComoJogarAberto] = useState(false);
  const [faseApresentada, setFaseApresentada] = useState(null);
  const [conquistasAbertas, setConquistasAbertas] = useState(false);
  const [lojaAberta, setLojaAberta] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const progressoRef = useRef(progresso);
  const avisadasRef = useRef(new Set());
  const achadosRef = useRef(new Set());

  useLayoutEffect(() => {
    progressoRef.current = progresso;
  });

  useEffect(carregarMotorDepois, []);

  useEffect(() => ligarSom(progresso.som), [progresso.som]);
  useEffect(() => ligarMusica(progresso.musica), [progresso.musica]);
  // a caça aos bugs escolhe a própria música; no resto, a calma
  useEffect(() => {
    if (tela !== 'caca') tocarMusica('calma');
  }, [tela]);

  // conquistas podem vir de qualquer lugar do jogo (ver conquistas.js)
  useEffect(
    () =>
      ouvirConquistas((id) => {
        const conquista = CONQUISTAS.find((c) => c.id === id);
        if (!conquista || progressoRef.current.conquistas.includes(id) || avisadasRef.current.has(id)) return;
        avisadasRef.current.add(id);
        ganharConquista(id);
        setAvisos((fila) => [...fila, conquista]);
      }),
    [ganharConquista]
  );

  // segredo achado: moedas, aviso e, no último, a conquista
  useEffect(
    () =>
      ouvirSegredos((id) => {
        const atual = progressoRef.current;
        if (!SEGREDOS.includes(id) || atual.segredos.includes(id) || achadosRef.current.has(id)) return;
        achadosRef.current.add(id);
        guardarSegredo(id, MOEDAS_POR_SEGREDO);
        const achados = new Set([...atual.segredos, ...achadosRef.current]).size;
        setAvisos((fila) => [
          ...fila,
          {
            id: `segredo-${id}`,
            tipo: 'segredo',
            titulo: 'Achou um segredo',
            descricao: `+${MOEDAS_POR_SEGREDO} moedas. ${achados} de ${SEGREDOS.length} segredos.`,
          },
        ]);
        if (achados === SEGREDOS.length) conquistar('explorador');
      }),
    [guardarSegredo]
  );

  // bug do dia consertado: sequência, moedas e, aos 7 dias, a conquista
  const cumprirDia = useCallback(() => {
    const atual = progressoRef.current;
    const dia = hoje();
    if (atual.desafio.dia === dia) return null;
    const sequencia = atual.desafio.dia === ontemDe(dia) ? atual.desafio.sequencia + 1 : 1;
    const moedas = moedasDoDia(sequencia);
    cumprirDesafio(dia, sequencia, moedas);
    if (sequencia >= 7) conquistar('sequencia');
    return { sequencia, moedas };
  }, [cumprirDesafio]);

  function comprarItem(item) {
    const atual = progressoRef.current;
    if (atual.itens.includes(item.id) || atual.moedas < item.preco) return;
    comprar(item.id, item.preco);
    tocar('compra');
    conquistar('fregues');
  }

  const avisoAtual = avisos[0];
  useEffect(() => {
    if (!avisoAtual) return;
    // o segredo já tocou o som dele na hora do clique
    if (avisoAtual.tipo !== 'segredo') tocar('conquista');
    const espera = setTimeout(() => setAvisos((fila) => fila.slice(1)), 3600);
    return () => clearTimeout(espera);
  }, [avisoAtual]);

  useEffect(() => {
    if (new Date().getHours() >= 5) return;
    const espera = setTimeout(() => conquistar('coruja'), 2500);
    return () => clearTimeout(espera);
  }, []);

  const { modo, concluidas } = progresso;
  // a data é lida a cada desenho: virando a meia-noite com o jogo aberto, o bug do dia muda
  const hojeAgora = hoje();
  const bugDeHoje = bugDoDia(bugsDisponiveis(concluidas[modo]), hojeAgora);
  const indice = Math.min(progresso.faseAtual, fases.length - 1);
  const fase = fases[indice];
  const chaveDoCodigo = `${fase.id}-${modo}`;
  const codigo = progresso.codigos[chaveDoCodigo] ?? fase.codigoInicial[modo];
  const outroModo = modo === 'web' ? 'mobile' : 'web';

  const estaLiberada = (i, emModo = modo) => i === 0 || concluidas[emModo].includes(fases[i - 1].id);
  const liberadas = fases.filter((_, i) => estaLiberada(i)).length;
  const comecou = progresso.livrosVistos.length > 0 || concluidas.web.length + concluidas.mobile.length > 0;
  const totalDeEstrelas = Object.values(progresso.estrelas).reduce((soma, n) => soma + n, 0);

  const viajando = transicao?.tipo === 'viagem';
  // enquanto a câmera está no corredor, quem vai entrar na sala nova espera do lado de fora
  const esperando = viajando && (transicao.etapa === 'cobrindo' || transicao.etapa === 'corredor');
  // quem sai da sala continua andando até o corredor cobrir a tela toda
  const saindo = viajando && transicao.saida && (transicao.etapa === 'saindo' || transicao.etapa === 'cobrindo');

  // na primeira vez em cada fase o livro abre sozinho, depois que todo mundo chegou
  useEffect(() => {
    if (tela !== 'jogo' || transicao) return;
    const espera = setTimeout(() => setFaseApresentada(fase.id), semAnimacao() ? 0 : ESPERA_DO_LIVRO);
    return () => clearTimeout(espera);
  }, [tela, transicao, fase.id]);

  const mostrarIntroducao =
    tela === 'jogo' && !transicao && faseApresentada === fase.id && !progresso.livrosVistos.includes(fase.id);

  // se a fase não estiver liberada no outro modo, volta pra última liberada
  function faseLiberadaNoModo(novoModo, desejada = indice) {
    let destino = desejada;
    while (destino > 0 && !estaLiberada(destino, novoModo)) destino -= 1;
    return destino;
  }

  function mudarModo(novoModo) {
    if (novoModo === modo) return;
    trocarModo(novoModo, faseLiberadaNoModo(novoModo));
  }

  // trocar de modo na mesma sala é um piscar de olhos; ir pra uma sala é uma viagem pelo corredor
  function jogarFase(i, emModo = modo, { saida = false } = {}) {
    const acao = () => {
      if (emModo !== modo) trocarModo(emModo, i);
      else irParaFase(i);
      setTela('jogo');
    };
    const destino = { fase: fases[i], modo: emModo };
    if (emModo !== modo) navegar(acao, destino);
    else viajar(acao, destino, { saida });
  }

  // fim de uma rodada da Caça aos bugs
  const terminarCaca = useCallback(
    (resumo) => {
      if (resumo.moedas) ganharMoedas(resumo.moedas);
      salvarRecorde(modo, resumo.pontos);
      if (resumo.consertados >= 5) conquistar('cacador');
      if (resumo.melhorCombo >= 5) conquistar('combo');
    },
    [ganharMoedas, salvarRecorde, modo]
  );

  // resumo: { estrelas, tentativas, pediuDica } da rodada que passou. Devolve quantas moedas ganhou.
  const concluir = useCallback(
    (resumo) => {
      const atual = progressoRef.current;
      const chave = `${fase.id}-${modo}`;
      const outro = modo === 'web' ? 'mobile' : 'web';
      concluirFase(fase.id, modo);
      darEstrelas(chave, resumo.estrelas);

      // primeira vez: 20 + 10 por estrela. Depois, só as estrelas novas valem moeda
      const primeiraVez = !atual.concluidas[modo].includes(fase.id);
      const estrelasNovas = Math.max(0, resumo.estrelas - (atual.estrelas[chave] ?? 0));
      const moedas = primeiraVez ? 20 + 10 * resumo.estrelas : 10 * estrelasNovas;
      if (moedas) ganharMoedas(moedas);

      if (fase.numero === 1) conquistar('primeiro-passo');
      if (resumo.tentativas === 0) conquistar('de-primeira');
      if (!resumo.pediuDica) conquistar('sem-ajuda');
      if (resumo.tentativas >= 5) conquistar('teimoso');
      if (fase.id === 'guardiao') conquistar('guardiao');
      if (atual.concluidas[outro].includes(fase.id)) conquistar('bilingue');
      const feitas = new Set([...atual.concluidas[modo], fase.id]);
      if (fases.every((f) => feitas.has(f.id))) conquistar(modo);
      const estrelas = { ...atual.estrelas, [chave]: Math.max(atual.estrelas[chave] ?? 0, resumo.estrelas) };
      if (Object.values(estrelas).filter((n) => n === 3).length >= 5) conquistar('estrelas');
      return moedas;
    },
    [concluirFase, darEstrelas, ganharMoedas, fase, modo]
  );

  return (
    <SegredosAchados.Provider value={progresso.segredos}>
      <ItensEmUso.Provider value={progresso.usando}>
        <div className={['app', esperando && 'app--esperando', temaEmUso(progresso.usando)].filter(Boolean).join(' ')}>
          {tela === 'menu' && (
            <Menu
              faseAtual={fase}
              comecou={comecou}
              modo={modo}
              feitas={{ web: concluidas.web.length, mobile: concluidas.mobile.length }}
              totalDeFases={fases.length}
              estrelas={totalDeEstrelas}
              maximoDeEstrelas={fases.length * 6}
              moedas={progresso.moedas}
              podeComprar={ITENS.some((item) => !progresso.itens.includes(item.id) && item.preco <= progresso.moedas)}
              aoLoja={() => setLojaAberta(true)}
              conquistas={progresso.conquistas.length}
              totalDeConquistas={CONQUISTAS.length}
              som={progresso.som}
              aoAlternarSom={alternarSom}
              musica={progresso.musica}
              aoAlternarMusica={alternarMusica}
              aoConquistas={() => setConquistasAbertas(true)}
              aoJogar={() => jogarFase(indice)}
              aoMapa={() => navegar(() => setTela('mapa'))}
              bugs={bugsDisponiveis(concluidas[modo]).length}
              diaFeito={progresso.desafio.dia === hojeAgora}
              sequencia={sequenciaAtual(progresso.desafio, hojeAgora)}
              moedasDoDia={moedasDoDia(progresso.desafio.dia === ontemDe(hojeAgora) ? progresso.desafio.sequencia + 1 : 1)}
              aoDia={() => navegar(() => setTela('dia'))}
              recordeDeBugs={progresso.recordes[modo]}
              aoCaca={() => navegar(() => setTela('caca'))}
              aoLivro={() => setLivroAberto(true)}
              aoComoJogar={() => setComoJogarAberto(true)}
              aoTrocarModo={mudarModo}
              aoApagarProgresso={() => {
                avisadasRef.current.clear();
                achadosRef.current.clear();
                apagarTudo();
              }}
            />
          )}

          {tela === 'dia' && bugDeHoje && (
            <BugDoDia
              key={`${modo}-${hojeAgora}`}
              modo={modo}
              bug={bugDeHoje}
              dia={hojeAgora}
              desafio={progresso.desafio}
              aoConsertar={cumprirDia}
              aoVoltar={() => navegar(() => setTela('menu'))}
            />
          )}

          {tela === 'caca' && (
            <CacaAosBugs
              key={modo}
              modo={modo}
              concluidas={concluidas[modo]}
              recorde={progresso.recordes[modo]}
              aoTerminar={terminarCaca}
              aoVoltar={() => navegar(() => setTela('menu'))}
            />
          )}

          {tela === 'mapa' && (
            <Mapa
              fases={fases}
              proximas={proximasFases}
              modo={modo}
              concluidas={concluidas}
              estrelas={progresso.estrelas}
              segredos={progresso.segredos}
              faseAtual={indice}
              estaLiberada={estaLiberada}
              aoEscolher={(i) => jogarFase(i)}
              aoVoltar={() => navegar(() => setTela('menu'))}
              aoTrocarModo={mudarModo}
            />
          )}

          {tela === 'jogo' && (
            <>
              <Cabecalho
                fase={fase}
                total={fases.length}
                modo={modo}
                som={progresso.som}
                aoAlternarSom={alternarSom}
                aoMenu={() => navegar(() => setTela('menu'))}
                aoTrocarModo={(novo) => novo !== modo && jogarFase(faseLiberadaNoModo(novo), novo)}
                aoAbrirLivro={() => setLivroAberto(true)}
              />
              <TelaDaFase
                key={chaveDoCodigo}
                fase={fase}
                modo={modo}
                codigo={codigo}
                temProxima={indice < fases.length - 1}
                outroModoFeito={concluidas[outroModo].includes(fase.id)}
                estrelasNoModo={fases.reduce((soma, f) => soma + (progresso.estrelas[`${f.id}-${modo}`] ?? 0), 0)}
                maximoNoModo={fases.length * 3}
                saindo={saindo}
                aoMudarCodigo={(novo) => salvarCodigo(chaveDoCodigo, novo)}
                aoRecomecar={() => apagarCodigo(chaveDoCodigo)}
                aoConcluir={concluir}
                aoProxima={() => jogarFase(indice + 1, modo, { saida: true })}
                aoTrocarModo={() => jogarFase(faseLiberadaNoModo(outroModo), outroModo)}
              />
            </>
          )}

          {(mostrarIntroducao || livroAberto) && (
            <Livro
              key={`livro-${fase.id}-${modo}`}
              fases={fases}
              liberadas={liberadas}
              paginaInicial={indice}
              modo={modo}
              introducao={mostrarIntroducao}
              aoFechar={() => {
                if (tela === 'jogo') marcarLivroVisto(fase.id);
                setLivroAberto(false);
              }}
            />
          )}

          {comoJogarAberto && <ComoJogar aoFechar={() => setComoJogarAberto(false)} />}
          {conquistasAbertas && (
            <ListaDeConquistas
              ganhas={progresso.conquistas}
              segredos={progresso.segredos.length}
              aoFechar={() => setConquistasAbertas(false)}
            />
          )}
          {lojaAberta && (
            <Loja
              moedas={progresso.moedas}
              itens={progresso.itens}
              usando={progresso.usando}
              aoComprar={comprarItem}
              aoAlternar={alternarItem}
              aoFechar={() => setLojaAberta(false)}
            />
          )}
          {avisoAtual && <AvisoDeConquista key={avisoAtual.id} conquista={avisoAtual} />}

          <Transicao transicao={transicao?.tipo === 'iris' ? transicao : null} />
          <Viagem transicao={viajando ? transicao : null} aoPular={pular} />
        </div>
      </ItensEmUso.Provider>
    </SegredosAchados.Provider>
  );
}
