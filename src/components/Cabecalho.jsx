import { Icone } from '../pixel/Sprite';

export function Cabecalho({ fase, total, modo, aoMenu, aoTrocarModo, aoAbrirLivro }) {
  return (
    <header className="cabecalho">
      <button type="button" className="botao botao--pedra cabecalho__menu" onClick={aoMenu} aria-label="Voltar ao menu">
        <Icone nome="menu" />
        <span className="so-tela-grande">Menu</span>
      </button>

      <div className="cabecalho__fase">
        <span className="cabecalho__numero">
          Fase {fase.numero} de {total}
        </span>
        <h1>{fase.titulo}</h1>
        <span className="etiqueta so-tela-grande">{fase.conceito}</span>
      </div>

      <div className="cabecalho__acoes">
        <div className="modo so-tela-grande" role="group" aria-label="Modo">
          {['web', 'mobile'].map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={modo === opcao ? 'modo--ativo' : ''}
              aria-pressed={modo === opcao}
              onClick={() => aoTrocarModo(opcao)}
            >
              <Icone nome={opcao} />
              {opcao === 'web' ? 'Web' : 'Mobile'}
            </button>
          ))}
        </div>
        <button type="button" className="botao botao--pedra" onClick={aoAbrirLivro} aria-label="Abrir o livro">
          <Icone nome="livro" />
          <span className="so-tela-grande">Livro</span>
        </button>
      </div>
    </header>
  );
}
