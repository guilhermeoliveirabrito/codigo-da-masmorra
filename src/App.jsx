import { useCallback, useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { Livro } from './components/Livro';
import { TelaDaFase } from './components/TelaDaFase';
import { fases } from './fases';
import { useProgresso } from './hooks/useProgresso';

export default function App() {
  const {
    progresso,
    irParaFase,
    trocarModo,
    salvarCodigo,
    apagarCodigo,
    concluirFase,
    marcarLivroVisto,
  } = useProgresso();
  const [livroAberto, setLivroAberto] = useState(false);

  const { modo, concluidas } = progresso;
  const indice = Math.min(progresso.faseAtual, fases.length - 1);
  const fase = fases[indice];
  const chaveDoCodigo = `${fase.id}-${modo}`;
  const codigo = progresso.codigos[chaveDoCodigo] ?? fase.codigoInicial[modo];

  const estaLiberada = (i, emModo = modo) =>
    i === 0 || concluidas[emModo].includes(fases[i - 1].id);
  const estaConcluida = (i) => concluidas[modo].includes(fases[i].id);
  const liberadas = fases.filter((_, i) => estaLiberada(i)).length;

  // na primeira vez em cada fase o livro abre sozinho
  const mostrarIntroducao = !progresso.livrosVistos.includes(fase.id);

  function mudarModo(novoModo) {
    if (novoModo === modo) return;
    // se a fase não estiver liberada no outro modo, volta pra última liberada
    let destino = indice;
    while (destino > 0 && !estaLiberada(destino, novoModo)) destino -= 1;
    trocarModo(novoModo, destino);
  }

  const concluir = useCallback(() => concluirFase(fase.id, modo), [concluirFase, fase.id, modo]);

  return (
    <>
      <Cabecalho
        fases={fases}
        atual={indice}
        estaLiberada={estaLiberada}
        estaConcluida={estaConcluida}
        modo={modo}
        aoIrPara={irParaFase}
        aoTrocarModo={mudarModo}
        aoAbrirLivro={() => setLivroAberto(true)}
      />

      <TelaDaFase
        key={chaveDoCodigo}
        fase={fase}
        modo={modo}
        codigo={codigo}
        temProxima={indice < fases.length - 1}
        outroModoFeito={concluidas[modo === 'web' ? 'mobile' : 'web'].includes(fase.id)}
        aoMudarCodigo={(novo) => salvarCodigo(chaveDoCodigo, novo)}
        aoRecomecar={() => apagarCodigo(chaveDoCodigo)}
        aoConcluir={concluir}
        aoProxima={() => irParaFase(indice + 1)}
        aoTrocarModo={() => mudarModo(modo === 'web' ? 'mobile' : 'web')}
      />

      {(mostrarIntroducao || livroAberto) && (
        <Livro
          key={`livro-${fase.id}-${modo}`}
          fases={fases}
          liberadas={liberadas}
          paginaInicial={indice}
          modo={modo}
          introducao={mostrarIntroducao}
          aoFechar={() => {
            marcarLivroVisto(fase.id);
            setLivroAberto(false);
          }}
        />
      )}
    </>
  );
}
