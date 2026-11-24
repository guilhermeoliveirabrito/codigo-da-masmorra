import { useCallback, useState } from 'react';
import { traduzirErro } from '../motor/erros';
import { executar } from '../motor/executar';
import { Icone } from '../pixel/Sprite';
import { Dialogo } from './Dialogo';
import { Dicas } from './Dicas';
import { Editor } from './Editor';
import { Resultado } from './Resultado';
import { Vitoria } from './Vitoria';

function doModo(valor, modo) {
  return typeof valor === 'object' ? valor[modo] : valor;
}

function pegarComponente(modulo, nome) {
  const { exportados, declarados } = modulo;
  if (typeof exportados[nome] === 'function') return { Componente: exportados[nome] };
  if (exportados.default && exportados.default === declarados[nome]) {
    return { Componente: exportados.default };
  }

  if (nome in declarados) {
    return {
      problema: `Achei a função \`${nome}\`, mas falta o \`export\` na frente dela: \`export function ${nome}() {\`. Sem o export, o jogo não consegue usar o componente.`,
    };
  }
  const parecido = Object.keys(declarados).find((n) => n.toLowerCase() === nome.toLowerCase());
  if (parecido) {
    return {
      problema: `Não achei \`${nome}\`, mas achei \`${parecido}\`. O nome precisa ser igualzinho, com as mesmas maiúsculas e minúsculas.`,
    };
  }
  return {
    problema: `Não achei o componente \`${nome}\`. O jogo procura uma função chamada ${nome}, com \`export\` na frente.`,
  };
}

export function TelaDaFase({ fase, modo, codigo, temProxima, outroModoFeito, aoMudarCodigo, aoRecomecar, aoConcluir, aoProxima, aoTrocarModo }) {
  const [execucao, setExecucao] = useState(null); // { Componente, versao, liberada }
  const [resultado, setResultado] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [venceu, setVenceu] = useState(false);
  const [confirmarRecomeco, setConfirmarRecomeco] = useState(false);

  const vencer = useCallback(() => {
    setVenceu(true);
    aoConcluir();
  }, [aoConcluir]);

  function falhar(tipo, mensagem, avisos = []) {
    setResultado({ tipo, mensagem, avisos });
    setTentativas((t) => t + 1);
  }

  function rodar() {
    const avisos = new Set();
    const traduzir = (erro) => traduzirErro(erro, codigo, modo);

    let modulo;
    try {
      modulo = executar(codigo, modo, avisos);
    } catch (erro) {
      setExecucao(null);
      falhar('erro', traduzir(erro));
      return;
    }

    const { Componente, problema } = pegarComponente(modulo, fase.componente);
    if (!Componente) {
      setExecucao(null);
      falhar('erro', problema);
      return;
    }

    let veredito;
    try {
      veredito = fase.verificar({ Componente, modo, traduzir, avisos });
    } catch (erro) {
      veredito = { tipo: 'erro', mensagem: traduzir(erro) };
    }

    const passou = veredito.tipo === 'ok';
    setExecucao({ Componente, versao: Date.now(), liberada: passou });

    if (!passou) {
      falhar(veredito.tipo, veredito.mensagem, [...avisos]);
      return;
    }

    setResultado({ ...veredito, avisos: [...avisos] });
    // a fase da alavanca espera o jogador clicar na cena
    if (!veredito.esperarInteracao) setTimeout(vencer, 1200);
  }

  function recomecar() {
    if (!confirmarRecomeco) {
      setConfirmarRecomeco(true);
      setTimeout(() => setConfirmarRecomeco(false), 3000);
      return;
    }
    setConfirmarRecomeco(false);
    aoRecomecar();
    setExecucao(null);
    setResultado(null);
  }

  const { Cena } = fase;

  return (
    <main className="jogo">
      <section className="jogo__mundo" aria-label="Cena">
        <Cena
          key={execucao?.versao ?? 'vazia'}
          Componente={execucao?.Componente}
          liberada={execucao?.liberada ?? false}
          modo={modo}
          aoVencer={vencer}
        />
        <Dialogo falas={fase.falas} objetivo={doModo(fase.objetivo, modo)} />
      </section>

      <section className="jogo__codigo" aria-label="Código">
        <div className="jogo__barra">
          <span className="jogo__arquivo">{fase.arquivo}</span>
          <div className="jogo__botoes">
            <button type="button" className="botao botao--pedra" onClick={recomecar}>
              {confirmarRecomeco ? 'Apagar tudo?' : 'Recomeçar'}
            </button>
            <button type="button" className="botao botao--fogo" onClick={rodar}>
              <Icone nome="rodar" />
              Rodar
            </button>
          </div>
        </div>

        <Editor valor={codigo} aoMudar={aoMudarCodigo} aoRodar={rodar} />
        <Resultado resultado={resultado} />
        <Dicas
          dicas={fase.dicas.map((dica) => doModo(dica, modo))}
          solucao={doModo(fase.solucao, modo)}
          tentativas={tentativas}
        />
      </section>

      {venceu && (
        <Vitoria
          fase={fase}
          modo={modo}
          temProxima={temProxima}
          outroModoFeito={outroModoFeito}
          aoProxima={aoProxima}
          aoTrocarModo={aoTrocarModo}
          aoFechar={() => setVenceu(false)}
        />
      )}
    </main>
  );
}
