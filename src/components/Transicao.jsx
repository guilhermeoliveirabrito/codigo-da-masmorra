import { LIA } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';

export function Transicao({ transicao }) {
  if (!transicao) return null;
  const { etapa, cartao } = transicao;

  return (
    <div className={`transicao transicao--${etapa}`} aria-live="polite">
      <div className="transicao__iris" />
      {etapa === 'cartao' && cartao && (
        <div className="transicao__cartao">
          <span className="transicao__numero">Fase {cartao.fase.numero}</span>
          <strong className="transicao__titulo">{cartao.fase.titulo}</strong>
          <span className="etiqueta">{cartao.fase.conceito}</span>
          <div className="transicao__trilha" aria-hidden="true">
            <Sprite desenho={LIA} className="transicao__lia" />
          </div>
          <span className="transicao__modo">Modo {cartao.modo === 'web' ? 'Web' : 'Mobile'}</span>
        </div>
      )}
    </div>
  );
}
