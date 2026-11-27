import { useEffect } from 'react';
import { ITENS } from '../loja';
import { GATINHO, GOSMINHA, MOEDA, TOCHA_AZUL } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';
import { visualDe } from './Cenario';

const VITRINE = { 'tochas-azuis': TOCHA_AZUL, gato: GATINHO, gosminha: GOSMINHA };

// acessório aparece já no personagem, o resto é o próprio desenho
function Vitrine({ item }) {
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
