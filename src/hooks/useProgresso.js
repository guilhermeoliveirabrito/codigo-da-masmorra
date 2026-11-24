import { useEffect, useState } from 'react';

const CHAVE = 'codigo-da-masmorra:progresso:v1';

const INICIAL = {
  modo: 'web',
  faseAtual: 0,
  codigos: {}, // código de cada fase em cada modo, tipo { 'placa-web': '...' }
  concluidas: { web: [], mobile: [] },
  livrosVistos: [], // páginas do livro que já abriram sozinhas no começo da fase
};

// localStorage pode falhar (aba anônima, navegador bloqueando)
function ler() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (!salvo) return INICIAL;
    const dados = JSON.parse(salvo);
    return { ...INICIAL, ...dados, concluidas: { ...INICIAL.concluidas, ...dados.concluidas } };
  } catch {
    return INICIAL;
  }
}

export function useProgresso() {
  const [progresso, setProgresso] = useState(ler);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(progresso));
    } catch {
      // sem localStorage o jogo só não lembra o progresso
    }
  }, [progresso]);

  function atualizar(mudanca) {
    setProgresso((atual) => ({ ...atual, ...mudanca(atual) }));
  }

  return {
    progresso,
    irParaFase: (indice) => atualizar(() => ({ faseAtual: indice })),
    trocarModo: (modo, faseAtual) => atualizar(() => ({ modo, faseAtual })),
    salvarCodigo: (chave, codigo) =>
      atualizar((atual) => ({ codigos: { ...atual.codigos, [chave]: codigo } })),
    apagarCodigo: (chave) =>
      atualizar((atual) => {
        const codigos = { ...atual.codigos };
        delete codigos[chave];
        return { codigos };
      }),
    concluirFase: (id, modo) =>
      atualizar((atual) => {
        const lista = atual.concluidas[modo];
        if (lista.includes(id)) return {};
        return { concluidas: { ...atual.concluidas, [modo]: [...lista, id] } };
      }),
    marcarLivroVisto: (id) =>
      atualizar((atual) =>
        atual.livrosVistos.includes(id) ? {} : { livrosVistos: [...atual.livrosVistos, id] }
      ),
  };
}
