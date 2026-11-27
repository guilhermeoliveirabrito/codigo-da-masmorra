import { useEffect, useState } from 'react';
import { semAnimacao } from '../hooks/useTransicao';
import { BAU, BAU_FECHADO, MOEDA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocar } from '../som';
import { TextoRico } from './TextoRico';

// as moedas ganhas sobem de pouco em pouco, cada passo com um plim
function ContadorDeMoedas({ quantas, atraso }) {
  const [mostradas, setMostradas] = useState(() => (semAnimacao() ? quantas : 0));

  useEffect(() => {
    if (semAnimacao()) return;
    let contadas = 0;
    let intervalo;
    const passo = Math.max(1, Math.ceil(quantas / 10));
    const comeco = setTimeout(() => {
      intervalo = setInterval(() => {
        contadas = Math.min(quantas, contadas + passo);
        setMostradas(contadas);
        tocar('contar');
        if (contadas >= quantas) clearInterval(intervalo);
      }, 70);
    }, atraso);
    return () => {
      clearTimeout(comeco);
      clearInterval(intervalo);
    };
  }, [quantas, atraso]);

  return (
    <p className={`vitoria__moedas ${mostradas === quantas ? 'vitoria__moedas--fim' : ''}`} aria-label={`Ganhou ${quantas} moedas`}>
      <Sprite desenho={MOEDA} />
      <span aria-hidden="true">+{mostradas}</span>
      <small aria-hidden="true">moedas</small>
    </p>
  );
}

// pra onde cada moeda pula quando o baú abre
const MOEDAS = [-34, 22, -12, 40, 6, -26, 30];

export function Vitoria({ fase, modo, resumo, temProxima, outroModoFeito, aoProxima, aoTrocarModo, aoFechar }) {
  const aprendeu = typeof fase.aprendeu === 'object' ? fase.aprendeu[modo] : fase.aprendeu;
  const outroModo = modo === 'web' ? 'Mobile' : 'Web';
  const { estrelas = 1, pediuDica = true, viuSolucao = true, moedas = 0 } = resumo ?? {};
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
        {moedas > 0 && <ContadorDeMoedas quantas={moedas} atraso={1250 + estrelas * 280} />}
        {moedas === 0 && estrelas < 3 && (
          <p className="vitoria__sem-moedas">Mais estrelas nesta fase ainda valem moedas.</p>
        )}
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
