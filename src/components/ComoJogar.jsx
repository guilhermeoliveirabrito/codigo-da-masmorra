import { useEffect } from 'react';

const PASSOS = [
  ['Leia o livro', 'Cada fase começa com uma página explicando o assunto, com exemplos nos dois modos.'],
  ['Escreva o componente', 'O editor já vem com um começo de código. Complete o que o personagem pediu.'],
  ['Aperte Rodar', 'O jogo testa o seu código e mostra na cena o que ele faz. Se faltar algo, ele explica o quê e em qual linha.'],
  ['Travou?', 'Peça dicas: a primeira só aponta a direção. A solução aparece depois de três tentativas, pra você digitar.'],
  ['Junte estrelas', 'Passou da fase, uma estrela. Sem ver a solução, duas. Sem pedir dica, três. Dá pra voltar e tentar de novo.'],
];

export function ComoJogar({ aoFechar }) {
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Como jogar">
      <div className="janela como-jogar">
        <h2>Como jogar</h2>
        <ol>
          {PASSOS.map(([titulo, texto], i) => (
            <li key={titulo}>
              <span className="como-jogar__numero">{i + 1}</span>
              <div>
                <strong>{titulo}</strong>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="como-jogar__modos">
          Toda fase tem dois modos. No <strong>Web</strong> você usa as tags do HTML, como no navegador. No{' '}
          <strong>Mobile</strong>, os componentes do React Native, como num app de celular. Dá pra trocar no menu
          e comparar.
        </p>
        <p className="como-jogar__modos">Ah, e clique nos personagens. Eles gostam de conversar.</p>
        <button type="button" className="botao botao--fogo" onClick={aoFechar} autoFocus>
          Entendi
        </button>
      </div>
    </div>
  );
}
