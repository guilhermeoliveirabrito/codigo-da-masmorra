import { useEffect } from 'react';
import { BAU, BAU_FECHADO } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocar } from '../som';
import { TextoRico } from './TextoRico';

// pra onde cada moeda pula quando o baú abre
const MOEDAS = [-34, 22, -12, 40, 6, -26, 30];

export function Vitoria({ fase, modo, resumo, temProxima, outroModoFeito, aoProxima, aoTrocarModo, aoFechar }) {
  const aprendeu = typeof fase.aprendeu === 'object' ? fase.aprendeu[modo] : fase.aprendeu;
  const outroModo = modo === 'web' ? 'Mobile' : 'Web';
  const { estrelas = 1, pediuDica = true, viuSolucao = true } = resumo ?? {};
  const criterios = [
    { texto: 'Passou da fase', feito: true },
    { texto: 'Sem ver a solução', feito: !viuSolucao },
    { texto: 'Sem pedir dica', feito: !pediuDica },
  ];

  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  // o baú abre e depois cada estrela acende, com som
  useEffect(() => {
    const tempos = [setTimeout(() => tocar('moeda'), 650)];
    for (let i = 0; i < estrelas; i++) tempos.push(setTimeout(() => tocar('estrela'), 1100 + i * 280));
    return () => tempos.forEach(clearTimeout);
  }, [estrelas]);

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
        <h2>{temProxima ? `Fase ${fase.numero} concluída` : 'Você chegou ao fim da masmorra!'}</h2>

        <div className="vitoria__estrelas" role="img" aria-label={`${estrelas} de 3 estrelas`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={i < estrelas ? 'estrela estrela--ganha' : 'estrela'}
              style={{ animationDelay: `${1.1 + i * 0.28}s` }}
            >
              <Icone nome="estrela" />
            </span>
          ))}
        </div>
        <ul className="vitoria__criterios">
          {criterios.map(({ texto, feito }) => (
            <li key={texto} className={feito ? 'criterio--feito' : ''}>
              <Icone nome={feito ? 'feito' : 'cadeado'} />
              {texto}
            </li>
          ))}
        </ul>

        <div className="vitoria__aprendeu">
          <span className="etiqueta">O que você aprendeu</span>
          <TextoRico texto={aprendeu} />
        </div>

        {!temProxima && (
          <p className="vitoria__desafio">
            O Guardião dormiu e o tesouro é de vocês. Agora dá pra jogar tudo no outro modo e caçar as 3 estrelas em
            cada fase.
          </p>
        )}
        {temProxima && !outroModoFeito && (
          <p className="vitoria__desafio">Que tal fazer a mesma fase no modo {outroModo} e comparar?</p>
        )}

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
