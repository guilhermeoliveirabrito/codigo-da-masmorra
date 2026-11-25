import { PERSONAGENS } from '../pixel/personagens';
import { Icone, Sprite } from '../pixel/Sprite';

export function Mapa({ fases, proximas, modo, concluidas, faseAtual, estaLiberada, aoEscolher, aoVoltar, aoTrocarModo }) {
  return (
    <main className="mapa">
      <header className="mapa__topo">
        <button type="button" className="botao botao--pedra" onClick={aoVoltar}>
          <Icone nome="voltar" />
          Menu
        </button>
        <h1>Escolher fase</h1>
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
      </header>

      <ol className="mapa__salas">
        {fases.map((fase, i) => {
          const liberada = estaLiberada(i);
          const quem = PERSONAGENS[fase.falas[0].quem];
          return (
            <li key={fase.id}>
              <button
                type="button"
                className={`sala ${i === faseAtual ? 'sala--atual' : ''}`}
                disabled={!liberada}
                onClick={() => aoEscolher(i)}
              >
                <Sprite desenho={quem.desenho} recorte={quem.desenho.rosto} className="sala__retrato" />
                <span className="sala__texto">
                  <span className="sala__numero">Fase {fase.numero}</span>
                  <strong>{fase.titulo}</strong>
                  <span className="etiqueta">{fase.conceito}</span>
                </span>
                <span className="sala__selos">
                  {['web', 'mobile'].map((opcao) => (
                    <span
                      key={opcao}
                      className={`selo ${concluidas[opcao].includes(fase.id) ? 'selo--feito' : ''}`}
                      title={`Modo ${opcao === 'web' ? 'Web' : 'Mobile'}`}
                    >
                      <Icone nome={opcao} />
                    </span>
                  ))}
                </span>
                {!liberada && (
                  <span className="sala__tranca">
                    <Icone nome="cadeado" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {proximas.map((fase) => (
          <li key={fase.numero}>
            <div className="sala sala--em-breve">
              <span className="sala__retrato sala__retrato--vazio" />
              <span className="sala__texto">
                <span className="sala__numero">Fase {fase.numero}</span>
                <strong>{fase.titulo}</strong>
                <span className="etiqueta">{fase.conceito}</span>
              </span>
              <span className="sala__breve">Em breve</span>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
