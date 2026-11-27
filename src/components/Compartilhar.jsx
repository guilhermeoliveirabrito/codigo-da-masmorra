import { useEffect, useRef, useState } from 'react';
import { ENDERECO, compartilhar } from '../compartilhar';
import { Icone } from '../pixel/Sprite';

const AVISOS = {
  copiado: 'Copiado! Agora é só colar onde quiser.',
  falhou: 'Não deu pra copiar sozinho. Copie o texto daqui:',
};

export function Compartilhar({ texto }) {
  const [estado, setEstado] = useState('');
  const campoRef = useRef(null);

  useEffect(() => {
    if (estado === 'falhou') campoRef.current?.select();
    if (estado !== 'copiado') return;
    const espera = setTimeout(() => setEstado(''), 3000);
    return () => clearTimeout(espera);
  }, [estado]);

  return (
    <div className="compartilhar">
      <button type="button" className="botao botao--pedra" onClick={async () => setEstado(await compartilhar(texto))}>
        <Icone nome="compartilhar" />
        {estado === 'copiado' ? 'Copiado!' : 'Compartilhar'}
      </button>
      <p className={`compartilhar__aviso compartilhar__aviso--${estado || 'nada'}`} role="status">
        {AVISOS[estado] ?? ''}
      </p>
      {estado === 'falhou' && (
        <textarea
          ref={campoRef}
          className="compartilhar__texto"
          readOnly
          rows={4}
          value={`${texto}\n${ENDERECO}`}
          aria-label="Texto pra compartilhar"
        />
      )}
    </div>
  );
}
