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
  const [aba, setAba] = useState('missao'); // só no celular: 'missao' ou 'codigo'

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
      return 'erro';
    }

    const { Componente, problema } = pegarComponente(modulo, fase.componente);
    if (!Componente) {
      setExecucao(null);
      falhar('erro', problema);
      return 'erro';
    }

    let veredito;
    try {
      veredito = fase.verificar({ Componente, modo, traduzir, avisos, codigo });
    } catch (erro) {
      veredito = { tipo: 'erro', mensagem: traduzir(erro) };
    }

    const passou = veredito.tipo === 'ok';
    setExecucao({ Componente, versao: Date.now(), liberada: passou });

    if (!passou) {
      falhar(veredito.tipo, veredito.mensagem, veredito.esconderAvisos ? [] : [...avisos]);
      return veredito.tipo;
    }

    setResultado({ ...veredito, avisos: [...avisos] });
    // algumas fases esperam o jogador mexer na cena
    if (!veredito.esperarInteracao) setTimeout(vencer, fase.atrasoDaVitoria ?? 1400);
    return 'ok';
  }

  // no celular, acertou vai pra cena; errou mostra o código e a mensagem
  function rodarNoCelular() {
    setAba(rodar() === 'ok' ? 'missao' : 'codigo');
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
    <main className={`jogo jogo--aba-${aba}`}>
      <section className="jogo__mundo" aria-label="Cena">
        <Cena
          key={execucao?.versao ?? 'vazia'}
          Componente={execucao?.Componente}
          liberada={execucao?.liberada ?? false}
          primeiraVez={!execucao}
          modo={modo}
          aoVencer={vencer}
        />
        {resultado && (
          <div className="so-celular">
            <Resultado resultado={resultado} />
          </div>
        )}
        <Dialogo falas={fase.falas} objetivo={doModo(fase.objetivo, modo)} />
      </section>

      <section className="jogo__codigo" aria-label="Código">
        <div className="jogo__barra">
          <span className="jogo__arquivo">{fase.arquivo}</span>
          <div className="jogo__botoes">
            <button type="button" className="botao botao--pedra" onClick={recomecar}>
              {confirmarRecomeco ? 'Apagar tudo?' : 'Recomeçar'}
            </button>
            <button type="button" className="botao botao--fogo so-tela-grande" onClick={rodar}>
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

      <nav className="abas-do-celular" aria-label="Partes da fase">
        <button
          type="button"
          className={aba === 'missao' ? 'aba--ativa' : ''}
          aria-pressed={aba === 'missao'}
          onClick={() => setAba('missao')}
        >
          Missão
        </button>
        <button
          type="button"
          className={aba === 'codigo' ? 'aba--ativa' : ''}
          aria-pressed={aba === 'codigo'}
          onClick={() => setAba('codigo')}
        >
          Código
        </button>
        <button type="button" className="botao botao--fogo" onClick={rodarNoCelular}>
          <Icone nome="rodar" />
          Rodar
        </button>
      </nav>

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
