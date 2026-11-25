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

  const { tipo, mensagem, avisos = [] } = resultado;
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
    </div>
  );
}
