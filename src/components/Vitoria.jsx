import { useEffect } from 'react';
import { BAU, BAU_FECHADO } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';
import { TextoRico } from './TextoRico';

// pra onde cada moeda pula quando o baú abre
const MOEDAS = [-34, 22, -12, 40, 6, -26, 30];

export function Vitoria({ fase, modo, temProxima, outroModoFeito, aoProxima, aoTrocarModo, aoFechar }) {
  const aprendeu = typeof fase.aprendeu === 'object' ? fase.aprendeu[modo] : fase.aprendeu;
  const outroModo = modo === 'web' ? 'Mobile' : 'Web';

  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Fase concluída">
      <div className="vitoria janela">
        <div className="vitoria__bau" aria-hidden="true">
          <Sprite desenho={BAU_FECHADO} className="vitoria__bau-fechado" />
          <Sprite desenho={BAU} className="vitoria__bau-aberto" />
          {MOEDAS.map((dx, i) => (
            <span key={i} className="vitoria__moeda" style={{ '--dx': `${dx}px`, animationDelay: `${0.6 + i * 0.05}s` }} />
          ))}
        </div>
        <h2>Fase {fase.numero} concluída</h2>
        <div className="vitoria__aprendeu">
          <span className="etiqueta">O que você aprendeu</span>
          <TextoRico texto={aprendeu} />
        </div>

        {!outroModoFeito && (
          <p className="vitoria__desafio">Que tal fazer a mesma fase no modo {outroModo} e comparar?</p>
        )}
        {!temProxima && <p className="vitoria__desafio">Por enquanto, esta é a última fase.</p>}

        <div className="vitoria__botoes">
          {temProxima && (
            <button type="button" className="botao botao--fogo" onClick={aoProxima}>
              Próxima fase
            </button>
          )}
          {!outroModoFeito && (
            <button type="button" className="botao botao--pedra" onClick={aoTrocarModo}>
              Jogar no modo {outroModo}
            </button>
          )}
          <button type="button" className="botao botao--pedra" onClick={aoFechar}>
            Ficar aqui
          </button>
        </div>
      </div>
    </div>
  );
}
