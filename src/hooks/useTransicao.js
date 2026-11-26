import { useCallback, useEffect, useState } from 'react';

// iris: fecha num círculo, troca e abre (com o cartão da fase, se tiver)
// viagem: a turma sai da sala, passa pelo corredor e chega na próxima
const ETAPAS = {
  iris: { fechando: 450, cartao: 1500, abrindo: 450 },
  viagem: { saindo: 950, cobrindo: 520, corredor: 2000, revelando: 560 },
};

// a troca de tela acontece quando a tela está toda coberta
const TROCA_NO_FIM_DE = { iris: 'fechando', viagem: 'cobrindo' };

export function semAnimacao() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function seguinte({ tipo, etapa, cartao }) {
  if (tipo === 'iris') {
    if (etapa === 'fechando') return cartao ? 'cartao' : 'abrindo';
    if (etapa === 'cartao') return 'abrindo';
    return null;
  }
  const ordem = Object.keys(ETAPAS.viagem);
  return ordem[ordem.indexOf(etapa) + 1] ?? null;
}

export function useTransicao() {
  const [transicao, setTransicao] = useState(null);

  const navegar = useCallback((acao, cartao = null) => {
    if (semAnimacao()) {
      acao();
      return;
    }
    setTransicao({ tipo: 'iris', etapa: 'fechando', acao, cartao, feita: false });
  }, []);

  // destino = { fase, modo }; saida = os personagens da sala atual saem andando antes
  const viajar = useCallback((acao, destino, { saida = false } = {}) => {
    if (semAnimacao()) {
      acao();
      return;
    }
    setTransicao({ tipo: 'viagem', etapa: saida ? 'saindo' : 'cobrindo', acao, destino, saida, feita: false });
  }, []);

  // um toque durante a viagem adianta: sai logo da sala, ou sai logo do corredor
  const pular = useCallback(() => {
    setTransicao((atual) => {
      if (!atual || atual.tipo !== 'viagem') return atual;
      if (atual.etapa === 'saindo') return { ...atual, etapa: 'cobrindo' };
      if (atual.etapa === 'corredor') return { ...atual, etapa: 'revelando' };
      return atual;
    });
  }, []);

  useEffect(() => {
    if (!transicao) return;
    const { tipo, etapa } = transicao;
    const proxima = setTimeout(() => {
      if (TROCA_NO_FIM_DE[tipo] === etapa && !transicao.feita) transicao.acao();
      const depois = seguinte(transicao);
      setTransicao(depois ? { ...transicao, etapa: depois, feita: transicao.feita || TROCA_NO_FIM_DE[tipo] === etapa } : null);
    }, ETAPAS[tipo][etapa]);
    return () => clearTimeout(proxima);
  }, [transicao]);

  return { transicao, navegar, viajar, pular };
}
