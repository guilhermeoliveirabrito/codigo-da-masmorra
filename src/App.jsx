import { useCallback, useEffect, useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { ComoJogar } from './components/ComoJogar';
import { Livro } from './components/Livro';
import { TelaDaFase } from './components/TelaDaFase';
import { Transicao } from './components/Transicao';
import { fases, proximasFases } from './fases';
import { carregarMotorDepois } from './motor/carregarMotor';
import { useProgresso } from './hooks/useProgresso';
import { useTransicao } from './hooks/useTransicao';
import { Mapa } from './telas/Mapa';
import { Menu } from './telas/Menu';

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
  const { transicao, navegar } = useTransicao();
  const [tela, setTela] = useState('menu');
  const [livroAberto, setLivroAberto] = useState(false);
  const [comoJogarAberto, setComoJogarAberto] = useState(false);

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

  // na primeira vez em cada fase o livro abre sozinho
  const mostrarIntroducao = tela === 'jogo' && !progresso.livrosVistos.includes(fase.id);

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

  function jogarFase(i, emModo = modo) {
    navegar(
      () => {
        if (emModo !== modo) trocarModo(emModo, i);
        else irParaFase(i);
        setTela('jogo');
      },
      { fase: fases[i], modo: emModo }
    );
  }

  const concluir = useCallback(() => concluirFase(fase.id, modo), [concluirFase, fase.id, modo]);

  return (
    <>
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
            aoMudarCodigo={(novo) => salvarCodigo(chaveDoCodigo, novo)}
            aoRecomecar={() => apagarCodigo(chaveDoCodigo)}
            aoConcluir={concluir}
            aoProxima={() => jogarFase(indice + 1)}
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

      <Transicao transicao={transicao} />
    </>
  );
}
