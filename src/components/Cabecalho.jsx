import { TOCHA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';

export function Cabecalho({ fases, atual, estaLiberada, estaConcluida, modo, aoIrPara, aoTrocarModo, aoAbrirLivro }) {
  return (
    <header className="cabecalho">
      <div className="cabecalho__marca">
        <Sprite desenho={TOCHA} className="cabecalho__tocha" />
        <h1>Código da Masmorra</h1>
      </div>

      <nav className="cabecalho__fases" aria-label="Fases">
        {fases.map((fase, i) => {
          const liberada = estaLiberada(i);
          const concluida = estaConcluida(i);
          return (
            <button
              key={fase.id}
              type="button"
              className={`fase ${i === atual ? 'fase--atual' : ''} ${concluida ? 'fase--feita' : ''}`}
              disabled={!liberada}
              onClick={() => aoIrPara(i)}
              title={liberada ? fase.titulo : 'Termine a fase anterior'}
              aria-label={`Fase ${fase.numero}${concluida ? ', concluída' : ''}${liberada ? '' : ', bloqueada'}`}
            >
              {liberada ? fase.numero : <Icone nome="cadeado" />}
              {concluida && <Icone nome="feito" className="fase__feita" />}
            </button>
          );
        })}
      </nav>

      <div className="cabecalho__acoes">
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
        <button type="button" className="botao botao--pedra" onClick={aoAbrirLivro}>
          <Icone nome="livro" />
          Livro
        </button>
      </div>
    </header>
  );
}
