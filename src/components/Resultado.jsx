import { TextoRico } from './TextoRico';

const TITULOS = { ok: 'Funcionou', quase: 'Quase lá', erro: 'Erro' };

export function Resultado({ resultado }) {
  if (!resultado) {
    return (
      <div className="resultado resultado--vazio">
        Escreva o código e clique em <strong>Rodar</strong> (ou Ctrl + Enter).
      </div>
    );
  }

  const { tipo, mensagem, avisos = [] } = resultado;
  const outrosAvisos = avisos.filter((aviso) => aviso !== mensagem);

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
