import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { conquistar } from '../conquistas';
import { ContextoDaConversa, useConversa } from '../conversa';
import { criarAmbienteDaCena } from '../motor/ambiente';
import { carregarMotor } from '../motor/carregarMotor';
import { traduzirErro } from '../motor/erros';
import { Icone } from '../pixel/Sprite';
import { SegredoDaSala } from '../segredos';
import { tocar } from '../som';
import { Dialogo } from './Dialogo';
import { Dicas } from './Dicas';
import { Editor } from './Editor';
import { Resultado } from './Resultado';
import { Vitoria } from './Vitoria';

const SEM_ELENCO = [];

function doModo(valor, modo) {
  return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor[modo] : valor;
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

export function TelaDaFase({
  fase,
  modo,
  codigo,
  temProxima,
  outroModoFeito,
  saindo,
  aoMudarCodigo,
  aoRecomecar,
  aoConcluir,
  aoProxima,
  aoTrocarModo,
}) {
  const [execucao, setExecucao] = useState(null); // { Componente, versao, liberada }
  const [resultado, setResultado] = useState(null);
  const [tentativas, setTentativas] = useState(0);
  const [venceu, setVenceu] = useState(false);
  const [confirmarRecomeco, setConfirmarRecomeco] = useState(false);
  const [aba, setAba] = useState('missao'); // só no celular: 'missao' ou 'codigo'
  const [rodando, setRodando] = useState(false);
  const { valor: conversa, reagir } = useConversa(fase.elenco ?? SEM_ELENCO);
  const segredo = useMemo(() => (fase.segredo ? { id: fase.id, ...fase.segredo } : null), [fase]);

  // erros dentro de cliques: durante o teste vão pra uma lista, depois aparecem na tela
  const errosDeCliqueRef = useRef(null);
  const codigoRodadoRef = useRef(codigo);
  const contadorRef = useRef(0);
  const mostrar = useCallback((novo) => setResultado({ ...novo, id: ++contadorRef.current }), []);

  // pras estrelas: pediu dica? viu a solução?
  const ajudaRef = useRef({ pediuDica: false, viuSolucao: false });
  const resumoRef = useRef(null);
  // timers e o servidor que o código do jogador usa na cena (ver motor/ambiente.js)
  const cenarioRef = useRef(null);

  const vencer = useCallback(() => {
    const resumo = resumoRef.current ?? { estrelas: 1, tentativas: 0, pediuDica: true };
    resumoRef.current = { ...resumo, moedas: aoConcluir(resumo) ?? 0 };
    setVenceu(true);
  }, [aoConcluir]);

  useEffect(() => {
    carregarMotor().catch(() => {});
    return () => cenarioRef.current?.limpar();
  }, []);

  // indo pra próxima fase: mostra a cena, que é de onde os personagens saem andando
  useEffect(() => {
    if (!saindo) return;
    setVenceu(false);
    setAba('missao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [saindo]);

  const relatarErroDeClique = useCallback(
    (erro) => {
      if (errosDeCliqueRef.current) {
        errosDeCliqueRef.current.push(erro);
        return;
      }
      const mensagem = traduzirErro(erro, codigoRodadoRef.current, modo);
      mostrar({ tipo: 'erro', mensagem: `${mensagem} (Isso aconteceu no clique.)`, avisos: [] });
    },
    [modo, mostrar]
  );

  function falhar(tipo, mensagem, avisos = []) {
    tocar(tipo === 'quase' ? 'quase' : 'erro');
    if (/não para nunca|se desenhando sem parar/.test(mensagem)) conquistar('loop');
    const reacao = reagir(tipo === 'quase' ? 'quase' : 'erro');
    mostrar({ tipo, mensagem, avisos, reacao });
    setTentativas((t) => t + 1);
  }

  async function rodar() {
    if (rodando) return 'ocupado';
    setRodando(true);
    tocar('rodar');
    try {
      return await testar();
    } finally {
      setRodando(false);
    }
  }

  async function testar() {
    const avisos = new Set();
    const traduzir = (erro) => traduzirErro(erro, codigo, modo);

    let executar;
    try {
      ({ executar } = await carregarMotor());
    } catch {
      falhar('erro', 'Não deu pra carregar o motor do jogo. Confira a internet e tente de novo.');
      return 'erro';
    }

    // cada Rodar começa do zero: o que ficou rodando da vez anterior para aqui
    cenarioRef.current?.limpar();
    const cenario = criarAmbienteDaCena({ rotas: fase.rotas });
    cenarioRef.current = cenario;

    codigoRodadoRef.current = codigo;
    let modulo;
    try {
      modulo = executar(codigo, modo, avisos, { aoErroEmEvento: relatarErroDeClique, ambiente: cenario.ambiente });
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

    // algumas fases testam com um relógio ou um servidor de mentira: montam o código de novo com eles
    const montar = (ambiente) =>
      pegarComponente(executar(codigo, modo, avisos, { aoErroEmEvento: relatarErroDeClique, ambiente }), fase.componente)
        .Componente;

    let veredito;
    errosDeCliqueRef.current = [];
    try {
      veredito = await fase.verificar({ Componente, modo, traduzir, avisos, codigo, montar });
    } catch (erro) {
      veredito = { tipo: 'erro', mensagem: traduzir(erro) };
    }
    const [erroDeClique] = errosDeCliqueRef.current;
    errosDeCliqueRef.current = null;
    if (erroDeClique && veredito.tipo !== 'ok') {
      veredito = {
        tipo: 'erro',
        mensagem: `${traduzir(erroDeClique)} (Isso aconteceu quando o jogo clicou no seu botão.)`,
      };
    }

    const passou = veredito.tipo === 'ok';
    setExecucao({ Componente, versao: Date.now(), liberada: passou, eventos: cenario });

    if (!passou) {
      falhar(veredito.tipo, veredito.mensagem, veredito.esconderAvisos ? [] : [...avisos]);
      return veredito.tipo;
    }

    const { pediuDica, viuSolucao } = ajudaRef.current;
    resumoRef.current = { estrelas: 1 + (viuSolucao ? 0 : 1) + (pediuDica ? 0 : 1), tentativas, pediuDica, viuSolucao };
    tocar('acerto');
    mostrar({ ...veredito, avisos: [...avisos] });
    // algumas fases esperam o jogador mexer na cena
    if (!veredito.esperarInteracao) setTimeout(vencer, fase.atrasoDaVitoria ?? 1400);
    return 'ok';
  }

  // no celular, acertou vai pra cena; errou mostra o código e a mensagem
  async function rodarNoCelular() {
    const tipo = await rodar();
    if (tipo !== 'ocupado') setAba(tipo === 'ok' ? 'missao' : 'codigo');
  }

  function recomecar() {
    if (!confirmarRecomeco) {
      setConfirmarRecomeco(true);
      setTimeout(() => setConfirmarRecomeco(false), 3000);
      return;
    }
    setConfirmarRecomeco(false);
    aoRecomecar();
    cenarioRef.current?.limpar();
    setExecucao(null);
    setResultado(null);
  }

  const { Cena } = fase;

  // a cena não depende do código digitado, então não precisa redesenhar a cada tecla
  const cena = useMemo(
    () => (
      <Cena
        key={execucao?.versao ?? 'vazia'}
        Componente={execucao?.Componente}
        liberada={execucao?.liberada ?? false}
        primeiraVez={!execucao}
        eventos={execucao?.eventos}
        modo={modo}
        aoVencer={vencer}
      />
    ),
    [Cena, execucao, modo, vencer]
  );

  return (
    <main className={`jogo jogo--aba-${aba} ${saindo ? 'jogo--saindo' : ''}`}>
      <section className={`jogo__mundo ${execucao?.liberada ? 'jogo__mundo--festa' : ''}`} aria-label="Cena">
        <SegredoDaSala.Provider value={segredo}>
          <ContextoDaConversa.Provider value={conversa}>{cena}</ContextoDaConversa.Provider>
        </SegredoDaSala.Provider>
        {resultado && (
          <div className="so-celular">
            <Resultado key={resultado.id} resultado={resultado} />
          </div>
        )}
        <Dialogo falas={fase.falas} objetivo={doModo(fase.objetivo, modo)} passos={doModo(fase.passos, modo)} />
      </section>

      <section className="jogo__codigo" aria-label="Código">
        <div className="jogo__barra">
          <span className="jogo__arquivo">{fase.arquivo}</span>
          <div className="jogo__botoes">
            <button type="button" className="botao botao--pedra" onClick={recomecar}>
              {confirmarRecomeco ? 'Apagar tudo?' : 'Recomeçar'}
            </button>
            <button type="button" className="botao botao--fogo so-tela-grande" onClick={rodar} disabled={rodando} data-som="nenhum">
              <Icone nome="rodar" />
              Rodar
            </button>
          </div>
        </div>

        <Editor valor={codigo} aoMudar={aoMudarCodigo} aoRodar={rodar} />
        <Resultado key={resultado?.id ?? 'vazio'} resultado={resultado} />
        <Dicas
          dicas={fase.dicas.map((dica) => doModo(dica, modo))}
          solucao={doModo(fase.solucao, modo)}
          tentativas={tentativas}
          aoPedirDica={() => (ajudaRef.current.pediuDica = true)}
          aoVerSolucao={() => (ajudaRef.current.viuSolucao = true)}
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
        <button type="button" className="botao botao--fogo" onClick={rodarNoCelular} disabled={rodando} data-som="nenhum">
          <Icone nome="rodar" />
          Rodar
        </button>
      </nav>

      {venceu && (
        <Vitoria
          fase={fase}
          modo={modo}
          resumo={resumoRef.current}
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
