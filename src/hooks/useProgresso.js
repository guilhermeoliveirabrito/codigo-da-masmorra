import { useEffect, useMemo, useState } from 'react';

const CHAVE = 'codigo-da-masmorra:progresso:v1';
const TAMANHO_MAXIMO_DO_CODIGO = 50_000;

const INICIAL = {
  modo: 'web',
  faseAtual: 0,
  codigos: {}, // código de cada fase em cada modo, tipo { 'placa-web': '...' }
  concluidas: { web: [], mobile: [] },
  livrosVistos: [], // páginas do livro que já abriram sozinhas no começo da fase
  estrelas: {}, // melhor resultado de cada fase em cada modo, tipo { 'placa-web': 3 }
  conquistas: [],
  moedas: 0,
  som: true,
};

const MOEDAS_NO_MAXIMO = 999_999;

const listaDeTextos = (valor) => (Array.isArray(valor) ? valor.filter((item) => typeof item === 'string') : []);

// o que vem do localStorage pode estar velho ou mexido: só aproveita o que tem o formato certo
function validar(dados) {
  if (!dados || typeof dados !== 'object') return INICIAL;
  const codigos = {};
  if (dados.codigos && typeof dados.codigos === 'object') {
    for (const [chave, codigo] of Object.entries(dados.codigos)) {
      if (typeof codigo === 'string' && codigo.length <= TAMANHO_MAXIMO_DO_CODIGO) codigos[chave] = codigo;
    }
  }
  const estrelas = {};
  if (dados.estrelas && typeof dados.estrelas === 'object') {
    for (const [chave, valor] of Object.entries(dados.estrelas)) {
      if (Number.isInteger(valor) && valor >= 1 && valor <= 3) estrelas[chave] = valor;
    }
  }
  return {
    modo: dados.modo === 'mobile' ? 'mobile' : 'web',
    faseAtual: Number.isInteger(dados.faseAtual) && dados.faseAtual >= 0 ? dados.faseAtual : 0,
    codigos,
    concluidas: { web: listaDeTextos(dados.concluidas?.web), mobile: listaDeTextos(dados.concluidas?.mobile) },
    livrosVistos: listaDeTextos(dados.livrosVistos),
    estrelas,
    conquistas: listaDeTextos(dados.conquistas),
    moedas: Number.isInteger(dados.moedas) ? Math.min(Math.max(dados.moedas, 0), MOEDAS_NO_MAXIMO) : 0,
    som: dados.som !== false,
  };
}

// localStorage pode falhar (aba anônima, navegador bloqueando)
function ler() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? validar(JSON.parse(salvo)) : INICIAL;
  } catch {
    return INICIAL;
  }
}

function salvar(progresso) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(progresso));
  } catch {
    // sem localStorage o jogo só não lembra o progresso
  }
}

export function useProgresso() {
  const [progresso, setProgresso] = useState(ler);

  // salva um pouco depois da última mudança (não a cada tecla), e na hora se o app for fechado
  useEffect(() => {
    const espera = setTimeout(() => salvar(progresso), 400);
    const aoEsconder = () => {
      if (document.visibilityState === 'hidden') salvar(progresso);
    };
    const aoSair = () => salvar(progresso);
    document.addEventListener('visibilitychange', aoEsconder);
    window.addEventListener('pagehide', aoSair);
    return () => {
      clearTimeout(espera);
      document.removeEventListener('visibilitychange', aoEsconder);
      window.removeEventListener('pagehide', aoSair);
    };
  }, [progresso]);

  // as funções não mudam entre renders, então quem recebe elas não redesenha à toa
  const acoes = useMemo(() => {
    const atualizar = (mudanca) => setProgresso((atual) => ({ ...atual, ...mudanca(atual) }));
    return {
      irParaFase: (indice) => atualizar(() => ({ faseAtual: indice })),
      trocarModo: (modo, faseAtual) => atualizar(() => ({ modo, faseAtual })),
      salvarCodigo: (chave, codigo) => atualizar((atual) => ({ codigos: { ...atual.codigos, [chave]: codigo } })),
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
      darEstrelas: (chave, quantas) =>
        atualizar((atual) => ((atual.estrelas[chave] ?? 0) >= quantas ? {} : { estrelas: { ...atual.estrelas, [chave]: quantas } })),
      ganharMoedas: (quantas) =>
        atualizar((atual) => ({ moedas: Math.min(atual.moedas + Math.max(0, Math.floor(quantas)), MOEDAS_NO_MAXIMO) })),
      ganharConquista: (id) =>
        atualizar((atual) => (atual.conquistas.includes(id) ? {} : { conquistas: [...atual.conquistas, id] })),
      alternarSom: () => atualizar((atual) => ({ som: !atual.som })),
      apagarTudo: () => setProgresso((atual) => ({ ...INICIAL, modo: atual.modo, som: atual.som })),
      marcarLivroVisto: (id) =>
        atualizar((atual) => (atual.livrosVistos.includes(id) ? {} : { livrosVistos: [...atual.livrosVistos, id] })),
    };
  }, []);

  return { progresso, ...acoes };
}
