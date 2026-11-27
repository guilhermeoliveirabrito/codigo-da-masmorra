import { useEffect } from 'react';
import { CONQUISTAS } from '../conquistas';
import { MOEDA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { SEGREDOS } from '../segredos';

export function AvisoDeConquista({ conquista }) {
  const segredo = conquista.tipo === 'segredo';
  return (
    <div className={`aviso ${segredo ? 'aviso--segredo' : ''}`} role="status">
      {segredo ? <Sprite desenho={MOEDA} className="aviso__trofeu" /> : <Icone nome="trofeu" className="aviso__trofeu" />}
      <div className="aviso__texto">
        <span className="aviso__rotulo">{segredo ? 'Segredo!' : 'Conquista!'}</span>
        <strong>{conquista.titulo}</strong>
        <span>{conquista.descricao}</span>
      </div>
    </div>
  );
}

export function ListaDeConquistas({ ganhas, segredos, aoFechar }) {
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
              {ganhas.length} de {CONQUISTAS.length} · {segredos} de {SEGREDOS.length} segredos
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
