import { useEffect, useState } from 'react';
import { CenaDoBug, FALAS, sortear, useGoblin, useTelaDoBug } from '../caca/CenaDoBug';
import { conferir } from '../caca/conferir';
import { moedasDoDia, ontemDe, sequenciaAtual } from '../caca/doDia';
import { Editor } from '../components/Editor';
import { Resultado } from '../components/Resultado';
import { BUGADO, MOEDA } from '../pixel/desenhos';
import { Icone, Sprite } from '../pixel/Sprite';
import { tocar } from '../som';
import { conceitoDo } from './CacaAosBugs';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function dataBonita(dia) {
  const [, mes, numero] = dia.split('-').map(Number);
  return `${numero} de ${MESES[mes - 1]}`;
}

const dias = (n) => (n === 1 ? '1 dia seguido' : `${n} dias seguidos`);

export function BugDoDia({ modo, bug, dia, desafio, aoConsertar, aoVoltar }) {
  const jaFeito = desafio.dia === dia;
  const proxima = desafio.dia === ontemDe(dia) ? desafio.sequencia + 1 : 1;
  const [etapa, setEtapa] = useState('comeco'); // comeco, jogando, fim
  const [codigo, setCodigo] = useState(bug.codigo[modo]);
  const [resultado, setResultado] = useState(null);
  const [rodando, setRodando] = useState(false);
  const [premio, setPremio] = useState(null);
  const [goblin, falar] = useGoblin('Hoje eu caprichei nesse aqui. Duvido!');
  const [tela, mostrarNaCena] = useTelaDoBug(modo);

  useEffect(() => {
    mostrarNaCena(bug.codigo[modo], bug);
  }, [bug, modo, mostrarNaCena]);

  function comecar() {
    setCodigo(bug.codigo[modo]);
    setResultado(null);
    setEtapa('jogando');
    mostrarNaCena(bug.codigo[modo], bug);
    tocar('porta');
  }

  async function consertar() {
    if (rodando || etapa !== 'jogando') return;
    setRodando(true);
    tocar('rodar');
    const veredito = await conferir(bug, codigo, modo);
    setRodando(false);
    mostrarNaCena(codigo, bug);
    setResultado({ ...veredito, id: Date.now() });
    if (veredito.tipo !== 'ok') {
      tocar(veredito.tipo === 'quase' ? 'quase' : 'erro');
      falar(sortear(FALAS.erro));
      return;
    }
    // treino depois de já ter feito hoje não paga de novo
    setPremio(jaFeito ? null : aoConsertar());
    falar('Hmpf. Amanhã eu quebro outro!', true);
    tocar('fanfarra');
    setEtapa('fim');
  }

  return (
    <main className="caca caca--do-dia">
      <header className="caca__topo">
        <button type="button" className="botao botao--pedra" onClick={aoVoltar} aria-label="Voltar ao menu">
          <Icone nome="menu" />
          <span className="so-tela-grande">Menu</span>
        </button>
        <h1>Bug do dia</h1>
        <div className="caca__placar">
          <span className="caca__dia">{dataBonita(dia)}</span>
          <span className="caca__sequencia" aria-label={dias(sequenciaAtual(desafio, dia))}>
            <Icone nome="chama" />
            {sequenciaAtual(desafio, dia)}
          </span>
        </div>
      </header>

      <section className="caca__mundo" aria-label="Cena">
        <CenaDoBug modo={modo} bug={bug} tela={tela} goblin={goblin} />
        <p className="caca__missao">
          <span className="etiqueta">{conceitoDo(bug)}</span>
          {bug.missao}
        </p>
      </section>

      <section className="caca__codigo" aria-label="Código">
        <div className="jogo__barra">
          <span className="jogo__arquivo">{bug.arquivo}</span>
          <div className="jogo__botoes">
            <button
              type="button"
              className="botao botao--fogo"
              onClick={consertar}
              disabled={rodando || etapa !== 'jogando'}
              data-som="nenhum"
            >
              <Icone nome="rodar" />
              Consertar
            </button>
          </div>
        </div>
        <Editor valor={codigo} aoMudar={setCodigo} aoRodar={consertar} />
        {resultado ? (
          <Resultado key={resultado.id} resultado={resultado} />
        ) : (
          <p className="caca__ajuda">Sem relógio e sem pressa: ache o que o goblin quebrou e aperte Consertar.</p>
        )}
      </section>

      {etapa === 'comeco' && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Bug do dia">
          <div className="janela caca__janela">
            <Sprite desenho={BUGADO} className="caca__retrato" />
            <h2>Bug do dia</h2>
            {jaFeito ? (
              <>
                <p>Você já consertou o bug de hoje. Amanhã o goblin quebra outro!</p>
                <p className="caca__chama">
                  <Icone nome="chama" />
                  {dias(desafio.sequencia)}
                </p>
              </>
            ) : (
              <>
                <p>
                  Todo dia o goblin esconde um bug novo. Consertar vale <strong>{moedasDoDia(proxima)} moedas</strong> e
                  conta na sua sequência de dias seguidos (cada dia a mais vale mais, até 50).
                </p>
                <p className="caca__chama">
                  <Icone nome="chama" />
                  {proxima > 1 ? `Consertando hoje: ${dias(proxima)}` : 'Comece uma sequência hoje'}
                </p>
              </>
            )}
            <div className="vitoria__botoes">
              <button type="button" className="botao botao--fogo" onClick={comecar} autoFocus data-som="nenhum">
                {jaFeito ? 'Treinar de novo' : 'Começar'}
              </button>
              <button type="button" className="botao botao--pedra" onClick={aoVoltar}>
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {etapa === 'fim' && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="Bug do dia consertado">
          <div className="janela caca__janela">
            <Sprite desenho={BUGADO} className="caca__retrato" />
            <h2>Consertado!</h2>
            {premio ? (
              <>
                <p className="caca__chama caca__chama--grande">
                  <Icone nome="chama" />
                  {dias(premio.sequencia)}
                </p>
                <p className="vitoria__moedas caca__moedas">
                  <Sprite desenho={MOEDA} />+{premio.moedas}
                  <small>moedas</small>
                </p>
              </>
            ) : (
              <p>Treino feito. O prêmio de hoje você já tinha pegado.</p>
            )}
            <p>Volte amanhã pra outro bug.</p>
            <div className="vitoria__botoes">
              <button type="button" className="botao botao--fogo" onClick={aoVoltar} autoFocus>
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
