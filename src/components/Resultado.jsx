import { PERSONAGENS } from '../pixel/personagens';
import { Sprite } from '../pixel/Sprite';
import { TextoRico } from './TextoRico';

const TITULOS = { ok: 'Funcionou', quase: 'Quase lá', erro: 'Erro' };

export function Resultado({ resultado }) {
  if (!resultado) {
    return (
      <div className="resultado resultado--vazio">
        <span className="so-tela-grande">
          Escreva o código e clique em <strong>Rodar</strong> (ou Ctrl + Enter).
        </span>
        <span className="so-celular">
          Escreva o código e toque em <strong>Rodar</strong>, lá embaixo.
        </span>
      </div>
    );
  }

  const { tipo, mensagem, avisos = [], reacao } = resultado;
  const outrosAvisos = avisos.filter((aviso) => !mensagem.includes(aviso));

  return (
    <div className={`resultado resultado--${tipo}`} role="status">
      <span className={`etiqueta etiqueta--${tipo}`}>{TITULOS[tipo]}</span>
      <TextoRico texto={mensagem} />
      {outrosAvisos.length > 0 && (
        <ul className="resultado__avisos">
          {outrosAvisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
      )}
      {/* no celular a cena fica em outra aba, então o comentário do personagem aparece aqui */}
      {reacao && (
        <p className="resultado__reacao so-celular">
          <Sprite desenho={PERSONAGENS[reacao.quem].desenho} recorte={PERSONAGENS[reacao.quem].desenho.rosto} />
          <span>
            <strong>{PERSONAGENS[reacao.quem].nome}:</strong> {reacao.texto}
          </span>
        </p>
      )}
    </div>
  );
}
