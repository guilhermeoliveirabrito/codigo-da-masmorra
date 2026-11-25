import { useCallback, useEffect, useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { ComoJogar } from './components/ComoJogar';
import { Livro } from './components/Livro';
import { TelaDaFase } from './components/TelaDaFase';
import { Transicao } from './components/Transicao';
import { Viagem } from './components/Viagem';
import { fases, proximasFases } from './fases';
import { carregarMotorDepois } from './motor/carregarMotor';
import { useProgresso } from './hooks/useProgresso';
import { semAnimacao, useTransicao } from './hooks/useTransicao';
import { Mapa } from './telas/Mapa';
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
    marcarLivroVisto,
    apagarTudo,
  } = useProgresso();
  const { transicao, navegar, viajar, pular } = useTransicao();
  const [tela, setTela] = useState('menu');
  const [livroAberto, setLivroAberto] = useState(false);
  const [comoJogarAberto, setComoJogarAberto] = useState(false);
  const [faseApresentada, setFaseApresentada] = useState(null);

  useEffect(carregarMotorDepois, []);

  const { modo, concluidas } = progresso;
  const indice = Math.min(progresso.faseAtual, fases.length - 1);
  const fase = fases[indice];
  const chaveDoCodigo = `${fase.id}-${modo}`;
  const codigo = progresso.codigos[chaveDoCodigo] ?? fase.codigoInicial[modo];
  const outroModo = modo === 'web' ? 'mobile' : 'web';

  const estaLiberada = (i, emModo = modo) => i === 0 || concluidas[emModo].includes(fases[i - 1].id);
  const liberadas = fases.filter((_, i) => estaLiberada(i)).length;
  const comecou = progresso.livrosVistos.length > 0 || concluidas.web.length + concluidas.mobile.length > 0;

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

  const concluir = useCallback(() => concluirFase(fase.id, modo), [concluirFase, fase.id, modo]);

  return (
    <div className={`app ${esperando ? 'app--esperando' : ''}`}>
      {tela === 'menu' && (
        <Menu
          faseAtual={fase}
          comecou={comecou}
          modo={modo}
          resumo={`Web: ${concluidas.web.length} de ${fases.length} · Mobile: ${concluidas.mobile.length} de ${fases.length}`}
          aoJogar={() => jogarFase(indice)}
          aoMapa={() => navegar(() => setTela('mapa'))}
          aoLivro={() => setLivroAberto(true)}
          aoComoJogar={() => setComoJogarAberto(true)}
          aoTrocarModo={mudarModo}
          aoApagarProgresso={apagarTudo}
        />
      )}

      {tela === 'mapa' && (
        <Mapa
          fases={fases}
          proximas={proximasFases}
          modo={modo}
          concluidas={concluidas}
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

      <Transicao transicao={transicao?.tipo === 'iris' ? transicao : null} />
      <Viagem transicao={viajando ? transicao : null} aoPular={pular} />
    </div>
  );
}
