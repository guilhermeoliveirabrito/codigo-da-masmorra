import { useEffect } from 'react';
import { CONQUISTAS } from '../conquistas';
import { Icone } from '../pixel/Sprite';

export function AvisoDeConquista({ conquista }) {
  return (
    <div className="aviso" role="status">
      <Icone nome="trofeu" className="aviso__trofeu" />
      <div className="aviso__texto">
        <span className="aviso__rotulo">Conquista!</span>
        <strong>{conquista.titulo}</strong>
        <span>{conquista.descricao}</span>
      </div>
    </div>
  );
}

export function ListaDeConquistas({ ganhas, aoFechar }) {
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Conquistas">
      <div className="conquistas janela">
        <div className="conquistas__topo">
          <h2>
            Conquistas
            <span>
              {ganhas.length} de {CONQUISTAS.length}
            </span>
          </h2>
          <button type="button" className="botao botao--pedra botao--pequeno" onClick={aoFechar} autoFocus>
            Fechar
          </button>
        </div>
        <ul className="conquistas__lista">
          {CONQUISTAS.map((conquista) => {
            const ganha = ganhas.includes(conquista.id);
            const escondida = conquista.secreta && !ganha;
            return (
              <li key={conquista.id} className={ganha ? 'conquista conquista--ganha' : 'conquista'}>
                <Icone nome={ganha ? 'trofeu' : 'cadeado'} />
                <div>
                  <strong>{escondida ? 'Segredo' : conquista.titulo}</strong>
                  <span>{escondida ? 'Continue explorando a masmorra.' : conquista.descricao}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
