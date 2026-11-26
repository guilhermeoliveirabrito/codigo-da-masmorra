import { useState } from 'react';
import { CodigoColorido } from './CodigoColorido';
import { TextoRico } from './TextoRico';

const TENTATIVAS_PARA_SOLUCAO = 3;

export function Dicas({ dicas, solucao, tentativas, aoPedirDica, aoVerSolucao }) {
  const [abertas, setAbertas] = useState(0);
  const [mostrarSolucao, setMostrarSolucao] = useState(false);

  const acabaram = abertas >= dicas.length;
  const liberouSolucao = tentativas >= TENTATIVAS_PARA_SOLUCAO || acabaram;

  return (
    <div className="dicas">
      {dicas.slice(0, abertas).map((dica, i) => (
        <div key={i} className="dicas__dica">
          <span className="etiqueta etiqueta--dica">Dica {i + 1}</span>
          <TextoRico texto={dica} />
        </div>
      ))}

      <div className="dicas__botoes">
        {!acabaram && (
          <button
            type="button"
            className="botao botao--pedra"
            onClick={() => {
              setAbertas(abertas + 1);
              aoPedirDica?.();
            }}
          >
            {abertas === 0 ? 'Pedir uma dica' : 'Outra dica'} ({abertas + 1}/{dicas.length})
          </button>
        )}
        {liberouSolucao && !mostrarSolucao && (
          <button
            type="button"
            className="botao botao--pedra"
            onClick={() => {
              setMostrarSolucao(true);
              aoVerSolucao?.();
            }}
          >
            Ver a solução
          </button>
        )}
      </div>

      {mostrarSolucao && (
        <div className="dicas__solucao">
          <p>Digite em vez de copiar, é assim que fixa.</p>
          <pre>
            <CodigoColorido codigo={solucao} />
          </pre>
        </div>
      )}
    </div>
  );
}
