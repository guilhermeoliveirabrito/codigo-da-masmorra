import { useEffect, useState } from 'react';
import { Icone } from '../pixel/Sprite';

export function Ajustes({ som, instalacao, aoAlternarSom, aoApagarProgresso, aoFechar }) {
  const [confirmar, setConfirmar] = useState(false);
  const [apagado, setApagado] = useState(false);

  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') aoFechar();
    }
    window.addEventListener('keydown', aoApertarTecla);
    return () => window.removeEventListener('keydown', aoApertarTecla);
  }, [aoFechar]);

  // o "tem certeza?" some sozinho se ninguém clicar de novo
  useEffect(() => {
    if (!confirmar) return;
    const espera = setTimeout(() => setConfirmar(false), 3000);
    return () => clearTimeout(espera);
  }, [confirmar]);

  function apagar() {
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setConfirmar(false);
    setApagado(true);
    aoApagarProgresso();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Ajustes">
      <div className="janela ajustes">
        <h2>Ajustes</h2>

        <div className="ajustes__linha">
          <span>Som</span>
          <button type="button" className="botao botao--pedra" onClick={aoAlternarSom} aria-pressed={som}>
            <Icone nome={som ? 'som' : 'mudo'} />
            {som ? 'Ligado' : 'Desligado'}
          </button>
        </div>

        {(instalacao.podeInstalar || instalacao.mostrarDicaDoIphone) && (
          <div className="ajustes__linha">
            <span>Jogar como app</span>
            {instalacao.podeInstalar ? (
              <button type="button" className="botao botao--pedra" onClick={instalacao.instalar}>
                Instalar no celular
              </button>
            ) : (
              <small>No iPhone: Compartilhar e depois Adicionar à Tela de Início.</small>
            )}
          </div>
        )}

        <div className="ajustes__linha ajustes__perigo">
          <span>
            Progresso
            <small>Fases, estrelas, conquistas e códigos salvos neste navegador.</small>
          </span>
          <button type="button" className={`botao ${confirmar ? 'botao--perigo' : 'botao--pedra'}`} onClick={apagar}>
            {apagado ? 'Apagado' : confirmar ? 'Clique de novo pra apagar' : 'Apagar progresso'}
          </button>
        </div>

        <button type="button" className="botao botao--fogo ajustes__fechar" onClick={aoFechar} autoFocus>
          Fechar
        </button>
      </div>
    </div>
  );
}
