import { useEffect } from 'react';
import { ITENS } from '../loja';
import { GATINHO, GOSMINHA, MOEDA, TOCHA_AZUL } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';
import { visualDe } from './Cenario';

const VITRINE = { 'tochas-azuis': TOCHA_AZUL, gato: GATINHO, gosminha: GOSMINHA };

// um editorzinho de mentira: [x, linha, largura, tipo de pedaço de código]
const PEDACOS_DA_AMOSTRA = [
  [7, 0, 5, 'palavra'], [13, 0, 4, 'normal'], [18, 0, 8, 'texto'],
  [9, 1, 1, 'sinal'], [10, 1, 3, 'tag'], [14, 1, 5, 'atributo'], [20, 1, 4, 'valor'], [24, 1, 1, 'sinal'],
  [11, 2, 9, 'texto'],
  [9, 3, 2, 'sinal'], [11, 3, 3, 'tag'], [14, 3, 1, 'sinal'],
  [7, 4, 13, 'comentario'],
];

function AmostraDoTema({ tema }) {
  return (
    <svg className={`amostra ${tema}`} viewBox="0 0 32 22" shapeRendering="crispEdges" aria-hidden="true">
      <rect className="amostra__fundo" width="32" height="22" />
      <rect className="amostra__margem" width="5" height="22" />
      {PEDACOS_DA_AMOSTRA.map(([x, linha, largura, tipo]) => (
        <rect
          key={`${x}-${linha}`}
          className={tipo === 'normal' ? 'amostra__normal' : `cor-${tipo}`}
          fill="currentColor"
          x={x}
          y={3 + linha * 4}
          width={largura}
          height={2}
        />
      ))}
      {[0, 1, 2, 3, 4].map((linha) => (
        <rect key={linha} className="amostra__numero" x={2} y={3 + linha * 4} width={2} height={2} />
      ))}
    </svg>
  );
}

// acessório aparece já no personagem, tema vira um editorzinho, o resto é o próprio desenho
function Vitrine({ item }) {
  if (item.grupo === 'tema') return <AmostraDoTema tema={item.id} />;
  const desenho = item.quem ? visualDe(item.quem, [item.id]).desenho : VITRINE[item.id];
  return <Sprite desenho={desenho} />;
}

export function Loja({ moedas, itens, usando, aoComprar, aoAlternar, aoFechar }) {
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Loja">
      <div className="janela loja">
        <div className="loja__topo">
          <h2>Loja</h2>
          <span className="loja__saldo" aria-label={`Você tem ${moedas} moedas`}>
            <Sprite desenho={MOEDA} />
            {moedas}
          </span>
          <button type="button" className="botao botao--pedra botao--pequeno" onClick={aoFechar} autoFocus>
            Fechar
          </button>
        </div>
        <p className="loja__dica">Moedas vêm das fases, das estrelas novas e dos segredos escondidos nas salas.</p>

        <ul className="loja__itens">
          {ITENS.map((item) => {
            const tem = itens.includes(item.id);
            const emUso = usando.includes(item.id);
            const falta = item.preco - moedas;
            return (
              <li key={item.id} className={`item ${tem ? 'item--comprado' : ''} ${emUso ? 'item--em-uso' : ''}`}>
                <div className="item__vitrine">
                  <Vitrine item={item} />
                </div>
                <div className="item__texto">
                  <strong>{item.nome}</strong>
                  <span>{item.descricao}</span>
                </div>
                {tem ? (
                  <button
                    type="button"
                    className={`botao ${emUso ? 'botao--pedra' : 'botao--fogo'} item__botao`}
                    aria-pressed={emUso}
                    onClick={() => aoAlternar(item.id)}
                  >
                    {emUso ? 'Tirar' : 'Usar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="botao botao--fogo item__botao"
                    disabled={falta > 0}
                    onClick={() => aoComprar(item)}
                    aria-label={`Comprar ${item.nome} por ${item.preco} moedas`}
                    data-som="nenhum"
                  >
                    <Sprite desenho={MOEDA} />
                    {item.preco}
                  </button>
                )}
                {!tem && falta > 0 && <small className="item__falta">faltam {falta}</small>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
