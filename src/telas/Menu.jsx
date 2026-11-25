import { useState } from 'react';
import { Cena, Personagem } from '../components/Cenario';
import { Porta } from '../components/Porta';
import { useInstalacao } from '../hooks/useInstalacao';
import { Icone } from '../pixel/Sprite';

export function Menu({ faseAtual, comecou, modo, resumo, aoJogar, aoMapa, aoLivro, aoComoJogar, aoTrocarModo, aoApagarProgresso }) {
  const [abrindo, setAbrindo] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const instalacao = useInstalacao();

  function jogar() {
    if (abrindo) return;
    setAbrindo(true);
    setTimeout(aoJogar, 700);
  }

  function apagar() {
    if (!confirmarApagar) {
      setConfirmarApagar(true);
      setTimeout(() => setConfirmarApagar(false), 3000);
      return;
    }
    setConfirmarApagar(false);
    aoApagarProgresso();
  }

  return (
    <main className="menu">
      <div className="menu__palco">
        <Cena
          tochas={[66, 118]}
          alturaDasTochas={42}
          fundo={<Porta x={96} y={30} largura={28} altura={50} aberta={abrindo} />}
        >
          <Personagem quem="guarda" x={40} y={74} />
          <Personagem quem="lia" x={128} y={76} />
          <Personagem quem="tom" x={146} y={76} fala={abrindo ? 'Vamos!' : null} lado="direita" />
        </Cena>
        <h1 className="menu__titulo">Código da Masmorra</h1>
      </div>

      <div className="menu__painel">
        <p className="menu__chamada">
          Escreva componentes React de verdade pra abrir portas, acender tochas e atravessar a masmorra.
        </p>

        <div className="menu__acoes">
          <button type="button" className="botao botao--fogo botao--grande" onClick={jogar}>
            <Icone nome="rodar" />
            {comecou ? 'Continuar' : 'Começar'}
            {comecou && <span className="menu__onde">Fase {faseAtual.numero}</span>}
          </button>
          <button type="button" className="botao botao--pedra" onClick={aoMapa}>
            Escolher fase
          </button>
          <button type="button" className="botao botao--pedra" onClick={aoLivro}>
            <Icone nome="livro" />
            Livro
          </button>
          <button type="button" className="botao botao--pedra" onClick={aoComoJogar}>
            Como jogar
          </button>
        </div>

        <div className="menu__modo">
          <span className="etiqueta">Modo</span>
          <div className="modo" role="group" aria-label="Modo">
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
          <p>
            {modo === 'web'
              ? 'Web: tags do HTML, como <p> e <button>, com onClick.'
              : 'Mobile: componentes do React Native, como <Text> e <Pressable>, com onPress.'}
          </p>
        </div>

        <footer className="menu__rodape">
          <span>{resumo}</span>
          <div className="menu__links">
            {instalacao.podeInstalar && (
              <button type="button" className="menu__link" onClick={instalacao.instalar}>
                Instalar no celular
              </button>
            )}
            <button type="button" className="menu__link" onClick={apagar}>
              {confirmarApagar ? 'Apagar mesmo? Clique de novo' : 'Apagar progresso'}
            </button>
          </div>
          {instalacao.mostrarDicaDoIphone && (
            <span className="menu__dica">No iPhone, dá pra instalar em Compartilhar e Adicionar à Tela de Início.</span>
          )}
        </footer>
      </div>
    </main>
  );
}
