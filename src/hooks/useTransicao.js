import { useCallback, useEffect, useState } from 'react';

const DURACAO = { fechando: 450, cartao: 1600, abrindo: 450 };

function semAnimacao() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// A tela fecha num círculo, troca o que precisa trocar, mostra o cartão da fase
// (se tiver) e abre de novo.
export function useTransicao() {
  const [transicao, setTransicao] = useState(null);

  const navegar = useCallback((acao, cartao = null) => {
    if (semAnimacao()) {
      acao();
      return;
    }
    setTransicao({ etapa: 'fechando', acao, cartao });
  }, []);

  useEffect(() => {
    if (!transicao) return;
    const proxima = setTimeout(() => {
      if (transicao.etapa === 'fechando') {
        transicao.acao();
        setTransicao({ ...transicao, etapa: transicao.cartao ? 'cartao' : 'abrindo' });
      } else if (transicao.etapa === 'cartao') {
        setTransicao({ ...transicao, etapa: 'abrindo' });
      } else {
        setTransicao(null);
      }
    }, DURACAO[transicao.etapa]);
    return () => clearTimeout(proxima);
  }, [transicao]);

  return { transicao, navegar };
}
