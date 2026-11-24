import { PERSONAGENS } from '../pixel/personagens';
import { Sprite } from '../pixel/Sprite';
import { TextoRico } from './TextoRico';

export function Dialogo({ falas, objetivo }) {
  return (
    <div className="dialogo">
      {falas.map((fala, i) => {
        const { nome, desenho } = PERSONAGENS[fala.quem];
        return (
          <div key={i} className="dialogo__fala">
            <Sprite desenho={desenho} recorte={desenho.rosto} className="dialogo__retrato" />
            <div>
              <strong className="dialogo__nome">{nome}</strong>
              <p>{fala.texto}</p>
            </div>
          </div>
        );
      })}
      <div className="dialogo__objetivo">
        <span className="etiqueta">Objetivo</span>
        <TextoRico texto={objetivo} />
      </div>
    </div>
  );
}
