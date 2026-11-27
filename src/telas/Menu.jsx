import { useRef, useState } from 'react';
import { Ajustes } from '../components/Ajustes';
import { Cena, LARGURA, Personagem } from '../components/Cenario';
import { Logo } from '../components/Logo';
import { Porta } from '../components/Porta';
import { useInstalacao } from '../hooks/useInstalacao';
import { ContextoDaConversa, useConversa } from '../conversa';
import { semAnimacao } from '../hooks/useTransicao';
import { BARRIL, ESTANDARTE } from '../pixel/desenhos';
import { Icone, NoFundo } from '../pixel/Sprite';
import { tocar, tocarDeLeve } from '../som';
import { FundoDoSalao, limitesDoSalao, useSalao } from './Salao';

const ELENCO_DO_MENU = ['guarda', 'lia', 'tom'];
const TOCHAS_DA_SALA = [66, 118];
const TOCHAS_DE_FORA = [-36, -132, 220, 316];

// poeira subindo devagar na luz (x e y em % do salão)
const POEIRA = [
  [8, 58, 7.9, 12.5],
  [18, 70, 0, 9],
  [31, 46, 3.1, 11],
  [44, 74, 5.4, 10],
  [57, 56, 1.7, 12],
  [69, 68, 6.8, 9.5],
  [82, 50, 2.4, 11.5],
  [91, 72, 4.6, 10.5],
];

// setas pra cima e pra baixo andam pelo menu todo; pros lados, só dentro da mesma fileira
function andarComSetas(evento) {
  const passos = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 };
  const passo = passos[evento.key];
  if (!passo || !evento.target.matches('[data-menu]')) return;
  const deLado = evento.key === 'ArrowLeft' || evento.key === 'ArrowRight';
  const raiz = deLado ? evento.target.parentElement : evento.currentTarget;
  const botoes = [...raiz.querySelectorAll('[data-menu]')].filter((b) => !b.disabled);
  const proximo = botoes[botoes.indexOf(evento.target) + passo];
  if (!proximo) return;
  evento.preventDefault();
  proximo.focus();
  tocarDeLeve('passar');
}

function aoPassar(evento) {
  if (evento.pointerType === 'mouse') tocarDeLeve('passar');
}

export function Menu({
  faseAtual,
  comecou,
  modo,
  feitas,
  totalDeFases,
  estrelas,
  maximoDeEstrelas,
  conquistas,
  totalDeConquistas,
  som,
  aoAlternarSom,
  aoConquistas,
  aoJogar,
  aoMapa,
  aoLivro,
  aoComoJogar,
  aoTrocarModo,
  aoApagarProgresso,
}) {
  const conversa = useConversa(ELENCO_DO_MENU).valor;
  const [abrindo, setAbrindo] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [ajustesAbertos, setAjustesAbertos] = useState(false);
  const instalacao = useInstalacao();
  const salaoRef = useRef(null);
  const conteudoRef = useRef(null);
  const reguaRef = useRef(null);
  const medidas = useSalao(salaoRef, conteudoRef, reguaRef);

  // a porta abre, a Lia e o Tom entram nela e começa a viagem
  function jogar() {
    if (abrindo) return;
    setAbrindo(true);
    tocar('porta');
    if (semAnimacao()) {
      aoJogar();
      return;
    }
    setTimeout(() => setEntrando(true), 250);
    setTimeout(aoJogar, 1300);
  }

  let sala = null;
  let tochas = TOCHAS_DA_SALA;
  if (medidas) {
    const { escala, largura } = medidas;
    const larguraDaSala = LARGURA * escala;
    const alem = (largura - larguraDaSala) / 2;
    sala = {
      left: Math.round(alem),
      width: Math.round(larguraDaSala),
      // o gato atravessa o salão inteiro, não só a sala
      '--alem': `${((alem / larguraDaSala) * 100).toFixed(2)}cqw`,
      '--fator-do-gato': (largura / larguraDaSala).toFixed(2),
    };
    // salão largo: mais tochas na parede de fora, onde couberem inteiras
    const { x0, x1 } = limitesDoSalao(medidas);
    tochas = [...TOCHAS_DA_SALA, ...TOCHAS_DE_FORA.filter((x) => x - 4 > x0 && x + 12 < x1)];
  }

  return (
    <main
      ref={salaoRef}
      className={`menu ${medidas ? '' : 'menu--medindo'} ${abrindo ? 'menu--saindo' : ''}`}
      style={medidas ? { minHeight: medidas.altura, '--px': `${medidas.escala}px` } : undefined}
    >
      <div ref={reguaRef} className="menu__regua" aria-hidden="true" />
      {medidas && <FundoDoSalao {...limitesDoSalao(medidas)} />}
      <div className="menu__poeira" aria-hidden="true">
        {POEIRA.map(([x, y, atraso, duracao]) => (
          <span key={x} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${atraso}s`, animationDuration: `${duracao}s` }} />
        ))}
      </div>

      <div className="menu__sala" style={sala ?? undefined}>
        <ContextoDaConversa.Provider value={conversa}>
          <Cena
            solta
            tochas={tochas}
            alturaDasTochas={42}
            className={abrindo ? 'cena--tremer' : ''}
            fundo={
              <>
                <NoFundo desenho={ESTANDARTE} x={22} y={28} />
                <NoFundo desenho={ESTANDARTE} x={158} y={28} />
                <NoFundo desenho={BARRIL} x={20} y={68} />
                <Porta x={96} y={30} largura={28} altura={50} aberta={abrindo} />
              </>
            }
          >
            <Personagem quem="guarda" x={40} y={74} />
            <Personagem quem="lia" x={entrando ? 90 : 128} y={76} velocidade={64} some={entrando} />
            <Personagem
              quem="tom"
              x={entrando ? 90 : 146}
              y={76}
              velocidade={64}
              some={entrando}
              fala={abrindo && !entrando ? 'Vamos!' : null}
              lado="direita"
            />
          </Cena>
        </ContextoDaConversa.Provider>
      </div>

      <header className="menu__hud">
        <span className="menu__estrelas" title="Estrelas">
          <Icone nome="estrela" />
          {estrelas}
          <small>/{maximoDeEstrelas}</small>
        </span>
        <div className="menu__cantos">
          <button
            type="button"
            className="menu__canto"
            onClick={aoAlternarSom}
            aria-label={som ? 'Desligar o som' : 'Ligar o som'}
            aria-pressed={som}
          >
            <Icone nome={som ? 'som' : 'mudo'} />
          </button>
          <button type="button" className="menu__canto" onClick={() => setAjustesAbertos(true)} aria-label="Ajustes">
            <Icone nome="engrenagem" />
          </button>
        </div>
      </header>

      <div
        ref={conteudoRef}
        className="menu__conteudo"
        style={medidas?.respiro ? { marginTop: medidas.respiro } : undefined}
        onKeyDown={andarComSetas}
      >
        <h1 className="menu__logo">
          <span className="so-leitor">Código da Masmorra</span>
          <Logo />
        </h1>

        <nav className="menu__lista" aria-label="Menu principal">
          <button
            type="button"
            className="opcao opcao--principal"
            onClick={jogar}
            onPointerEnter={aoPassar}
            data-menu
            data-som="nenhum"
          >
            <Icone nome="cursor" className="opcao__cursor" />
            <span className="opcao__texto">{comecou ? 'Continuar' : 'Começar'}</span>
            {comecou && (
              <span className="opcao__detalhe">
                Fase {faseAtual.numero} · {faseAtual.titulo}
              </span>
            )}
          </button>
          <button type="button" className="opcao" onClick={aoMapa} onPointerEnter={aoPassar} data-menu>
            <Icone nome="cursor" className="opcao__cursor" />
            <span className="opcao__texto">Escolher fase</span>
          </button>
        </nav>

        <div className="menu__atalhos">
          <button type="button" className="atalho" onClick={aoLivro} onPointerEnter={aoPassar} data-menu>
            <Icone nome="livro" />
            Livro
          </button>
          <button type="button" className="atalho" onClick={aoConquistas} onPointerEnter={aoPassar} data-menu>
            <Icone nome="trofeu" />
            Conquistas
            <span className="atalho__conta">
              {conquistas}/{totalDeConquistas}
            </span>
          </button>
          <button type="button" className="atalho" onClick={aoComoJogar} onPointerEnter={aoPassar} data-menu>
            <Icone nome="pergunta" />
            Como jogar
          </button>
        </div>

        <div className="menu__modo" role="group" aria-label="Modo">
          {['web', 'mobile'].map((opcao) => (
            <button
              key={opcao}
              type="button"
              className={modo === opcao ? 'modo--ativo' : ''}
              aria-pressed={modo === opcao}
              onClick={() => aoTrocarModo(opcao)}
              onPointerEnter={aoPassar}
              data-menu
            >
              <Icone nome={opcao} />
              <span>
                {opcao === 'web' ? 'Web' : 'Mobile'}
                <small>{opcao === 'web' ? 'tags do HTML' : 'React Native'}</small>
              </span>
              <span className="menu__feitas">
                {feitas[opcao]}/{totalDeFases}
              </span>
            </button>
          ))}
        </div>
      </div>

      {ajustesAbertos && (
        <Ajustes
          som={som}
          instalacao={instalacao}
          aoAlternarSom={aoAlternarSom}
          aoApagarProgresso={aoApagarProgresso}
          aoFechar={() => setAjustesAbertos(false)}
        />
      )}
    </main>
  );
}
