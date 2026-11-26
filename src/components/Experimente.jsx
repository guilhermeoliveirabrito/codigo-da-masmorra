import { useCallback, useEffect, useRef, useState } from 'react';
import { conquistar } from '../conquistas';
import { Chave, Pedra, PortaAberta, PortaFechada, Tabua } from '../motor/masmorra';
import { AMPULHETA, TOCHA, TOCHA_APAGADA } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';
import { CodigoColorido } from './CodigoColorido';

// Pequenas demonstrações do livro: mexe aqui, vê o código e o resultado mudarem juntos.
// São componentes do próprio jogo (não passam pelo motor), então não tem como quebrar nada.

const doModo = (web, mobile, modo) => (modo === 'web' ? web : mobile);

function Codigo({ children }) {
  return (
    <pre className="demo__codigo">
      <CodigoColorido codigo={children} />
    </pre>
  );
}

function Opcoes({ rotulo, opcoes, valor, aoEscolher }) {
  return (
    <div className="demo__opcoes" role="group" aria-label={rotulo}>
      <span className="demo__rotulo">{rotulo}</span>
      {opcoes.map((opcao) => (
        <button
          key={String(opcao)}
          type="button"
          className={opcao === valor ? 'demo__opcao--ativa' : ''}
          aria-pressed={opcao === valor}
          onClick={() => aoEscolher(opcao)}
        >
          {String(opcao)}
        </button>
      ))}
    </div>
  );
}

function Campo({ rotulo, valor, aoMudar }) {
  return (
    <label className="demo__campo">
      <span className="demo__rotulo">{rotulo}</span>
      <input value={valor} maxLength={28} spellCheck={false} onChange={(evento) => aoMudar(evento.target.value)} />
    </label>
  );
}

function DemoJsx({ modo }) {
  const [texto, setTexto] = useState('Olá, aventureiro!');
  const [fechada, setFechada] = useState(true);
  const tag = doModo('p', 'Text', modo);
  const importa = modo === 'mobile' ? "import { Text } from 'react-native';\n\n" : '';
  const codigo = `${importa}export function Placa() {\n  return <${tag}>${texto}${fechada ? `</${tag}>` : ''};\n}`;

  return (
    <>
      <Campo rotulo="Texto da placa" valor={texto} aoMudar={setTexto} />
      <Opcoes rotulo={`Fechar com </${tag}>`} opcoes={['sim', 'não']} valor={fechada ? 'sim' : 'não'} aoEscolher={(opcao) => setFechada(opcao === 'sim')} />
      <Codigo>{codigo}</Codigo>
      <div className="demo__resultado">
        {fechada ? (
          <span className="demo__placa">{texto || ' '}</span>
        ) : (
          <span className="demo__erro">Erro: a tag {`<${tag}>`} abriu e não fechou. Nada aparece na tela.</span>
        )}
      </div>
    </>
  );
}

function DemoProps({ modo }) {
  const [nome, setNome] = useState('Lia');
  const [classe, setClasse] = useState('arqueira');
  const [comChaves, setComChaves] = useState(true);
  const tag = doModo('p', 'Text', modo);
  const dentro = comChaves ? '{nome} ({classe})' : 'nome (classe)';
  const codigo = `<Cracha nome="${nome}" classe="${classe}" />\n\nexport function Cracha({ nome, classe }) {\n  return <${tag}>${dentro}</${tag}>;\n}`;

  return (
    <>
      <div className="demo__linha">
        <Campo rotulo="nome" valor={nome} aoMudar={setNome} />
        <Campo rotulo="classe" valor={classe} aoMudar={setClasse} />
      </div>
      <Opcoes rotulo="Usar as chaves { }" opcoes={['sim', 'não']} valor={comChaves ? 'sim' : 'não'} aoEscolher={(opcao) => setComChaves(opcao === 'sim')} />
      <Codigo>{codigo}</Codigo>
      <div className="demo__resultado">
        <span className="demo__cracha">{comChaves ? `${nome} (${classe})` : 'nome (classe)'}</span>
        <span className="demo__legenda">
          {comChaves ? 'Com chaves, aparece o valor de cada prop.' : 'Sem chaves, aparecem as palavras escritas, e não os valores.'}
        </span>
      </div>
    </>
  );
}

const TOCOU_SOZINHO = 'O sino tocou sozinho, só de desenhar a tela.';

function DemoEventos({ modo }) {
  const evento = doModo('onClick', 'onPress', modo);
  const tag = doModo('button', 'Pressable', modo);
  const [certo, setCerto] = useState([]);
  const [errado, setErrado] = useState([TOCOU_SOZINHO]);
  const anotar = (lista, texto) => [...lista, texto].slice(-3);

  function desenharDeNovo() {
    setErrado((lista) => anotar(lista, TOCOU_SOZINHO));
  }

  return (
    <>
      <div className="demo__colunas">
        <div className="demo__coluna">
          <Codigo>{`<${tag} ${evento}={tocar}>`}</Codigo>
          <button type="button" className="botao botao--pedra botao--pequeno" onClick={() => setCerto((lista) => anotar(lista, `Tocou no ${modo === 'web' ? 'clique' : 'toque'}.`))}>
            Tocar o sino
          </button>
          <ul className="demo__registro">
            {certo.length === 0 && <li className="demo__nada">Esperando...</li>}
            {certo.map((linha, i) => (
              <li key={i}>{linha}</li>
            ))}
          </ul>
        </div>
        <div className="demo__coluna">
          <Codigo>{`<${tag} ${evento}={tocar()}>`}</Codigo>
          <button type="button" className="botao botao--pedra botao--pequeno" onClick={() => setErrado((lista) => anotar(lista, `O ${modo === 'web' ? 'clique' : 'toque'} não fez nada.`))}>
            Tocar o sino
          </button>
          <ul className="demo__registro demo__registro--erro">
            {errado.map((linha, i) => (
              <li key={i}>{linha}</li>
            ))}
          </ul>
        </div>
      </div>
      <button type="button" className="botao botao--pedra botao--pequeno" onClick={desenharDeNovo}>
        Desenhar a tela de novo
      </button>
      <p className="demo__legenda">
        Com parênteses, <code>tocar()</code> roda na hora de desenhar, e o {evento} recebe o resultado dela, não a função.
      </p>
    </>
  );
}

function DemoEstado({ modo }) {
  const [acesa, setAcesa] = useState(false);
  const [aviso, setAviso] = useState('');
  const variavel = useRef(false);
  const evento = doModo('onClick', 'onPress', modo);

  function clicarNaVariavel() {
    variavel.current = !variavel.current;
    setAviso(`A variável mudou pra ${variavel.current}, mas o React não ficou sabendo. A tela continua igual.`);
  }

  return (
    <div className="demo__colunas">
      <div className="demo__coluna">
        <Codigo>{`const [acesa, setAcesa] =\n  useState(false);\n// agora: acesa = ${acesa}\n\n${evento}={() => setAcesa(!acesa)}`}</Codigo>
        <Sprite desenho={acesa ? TOCHA : TOCHA_APAGADA} className="demo__tocha" />
        <button type="button" className="botao botao--fogo botao--pequeno" onClick={() => setAcesa(!acesa)}>
          {acesa ? 'Apagar' : 'Acender'}
        </button>
        <p className="demo__legenda">Com estado: o React guarda o valor e desenha de novo.</p>
      </div>
      <div className="demo__coluna">
        <Codigo>{`let acesa = false;\n\n${evento}={() => {\n  acesa = !acesa;\n}}`}</Codigo>
        <Sprite desenho={TOCHA_APAGADA} className="demo__tocha" />
        <button type="button" className="botao botao--pedra botao--pequeno" onClick={clicarNaVariavel}>
          Acender
        </button>
        <p className="demo__legenda">{aviso || 'Variável comum: clique e veja o que acontece.'}</p>
      </div>
    </div>
  );
}

function Trecho({ ativo, children }) {
  return (
    <span className={ativo ? 'demo__trecho demo__trecho--ativo' : 'demo__trecho'}>
      <CodigoColorido codigo={children} />
    </span>
  );
}

function DemoCondicional() {
  const [temChave, setTemChave] = useState(true);
  return (
    <>
      <Opcoes rotulo="temChave" opcoes={[true, false]} valor={temChave} aoEscolher={setTemChave} />
      <pre className="demo__codigo">
        <CodigoColorido codigo="{temChave ? " />
        <Trecho ativo={temChave}>{'<PortaAberta />'}</Trecho>
        <CodigoColorido codigo=" : " />
        <Trecho ativo={!temChave}>{'<PortaFechada />'}</Trecho>
        {'}\n'}
        <CodigoColorido codigo="{temChave && " />
        <Trecho ativo={temChave}>{'<Chave />'}</Trecho>
        {'}'}
      </pre>
      <div className="demo__resultado demo__resultado--portao">
        {temChave ? <PortaAberta /> : <PortaFechada />}
        {temChave && <Chave />}
      </div>
      <p className="demo__legenda">
        {temChave
          ? 'Verdadeiro: o ? escolhe a porta aberta, e o && deixa a chave aparecer.'
          : 'Falso: o : escolhe a porta fechada, e o && não mostra nada.'}
      </p>
    </>
  );
}

const MADEIRAS = ['carvalho', 'pinho', 'cedro', 'ebano'];

function DemoLista() {
  const [tabuas, setTabuas] = useState([
    { id: 1, madeira: 'carvalho' },
    { id: 2, madeira: 'pinho' },
    { id: 3, madeira: 'cedro' },
  ]);
  const proximoId = useRef(4);

  function colocar(madeira) {
    if (tabuas.length >= 8) return;
    setTabuas([...tabuas, { id: proximoId.current++, madeira }]);
  }

  const lista = tabuas.map((tabua) => `  { id: ${tabua.id}, madeira: '${tabua.madeira}' },`).join('\n');
  return (
    <>
      <div className="demo__botoes">
        {MADEIRAS.map((madeira) => (
          <button key={madeira} type="button" className="botao botao--pedra botao--pequeno" onClick={() => colocar(madeira)} disabled={tabuas.length >= 8}>
            + {madeira}
          </button>
        ))}
        <button type="button" className="botao botao--pedra botao--pequeno" onClick={() => setTabuas(tabuas.slice(0, -1))} disabled={!tabuas.length}>
          Tirar a última
        </button>
      </div>
      <Codigo>{`const tabuas = [\n${lista}${lista ? '\n' : ''}];\n\n{tabuas.map((tabua) => (\n  <Tabua key={tabua.id} madeira={tabua.madeira} />\n))}`}</Codigo>
      <div className="demo__resultado demo__resultado--ponte">
        {tabuas.length ? tabuas.map((tabua) => <Tabua key={tabua.id} madeira={tabua.madeira} />) : <span className="demo__nada">Lista vazia: o map não cria nada.</span>}
      </div>
      <p className="demo__legenda">
        {tabuas.length} {tabuas.length === 1 ? 'item virou 1 tábua' : `itens viraram ${tabuas.length} tábuas`}. Mude a lista e a ponte acompanha.
      </p>
    </>
  );
}

const ESPALHAR = ['flex-start', 'center', 'space-between', 'space-around', 'space-evenly'];

function DemoFlex({ modo }) {
  const [ligado, setLigado] = useState(false);
  const [direcao, setDirecao] = useState(modo === 'web' ? 'row' : 'column');
  const [espalhar, setEspalhar] = useState('flex-start');
  const web = modo === 'web';
  const flex = !web || ligado;

  const partes = [];
  if (web && ligado) partes.push("display: 'flex'");
  if (flex) partes.push(`flexDirection: '${direcao}'`, `justifyContent: '${espalhar}'`);
  const tag = web ? 'div' : 'View';
  const abertura = partes.length ? `<${tag} style={{\n  ${partes.join(',\n  ')}\n}}>` : `<${tag}>`;

  const estilo = flex ? { display: 'flex', flexDirection: direcao, justifyContent: espalhar } : { display: 'block' };
  return (
    <>
      {web && <Opcoes rotulo="display: 'flex'" opcoes={['ligado', 'desligado']} valor={ligado ? 'ligado' : 'desligado'} aoEscolher={(opcao) => setLigado(opcao === 'ligado')} />}
      {flex && (
        <>
          <Opcoes rotulo="flexDirection" opcoes={['row', 'column']} valor={direcao} aoEscolher={setDirecao} />
          <Opcoes rotulo="justifyContent" opcoes={ESPALHAR} valor={espalhar} aoEscolher={setEspalhar} />
        </>
      )}
      <Codigo>{`${abertura}\n  <Pedra />\n  <Pedra />\n  <Pedra />\n  <Pedra />\n</${tag}>`}</Codigo>
      <div className={`demo__rio ${direcao === 'column' && flex ? 'demo__rio--coluna' : ''}`} style={estilo}>
        <Pedra />
        <Pedra />
        <Pedra />
        <Pedra />
      </div>
      <p className="demo__legenda">
        {web && !ligado
          ? 'Sem flexbox, cada pedra ocupa uma linha inteira: uma embaixo da outra.'
          : 'A caixa pontilhada é o container. O flexbox arruma os filhos dentro dela.'}
      </p>
    </>
  );
}

// fase 8: mostra e esconde a ampulheta, com e sem limpeza, e conta os intervalos vivos
function AmpulhetaDaDemo({ limpeza, aoBater, vivos, aoMudar }) {
  useEffect(() => {
    const id = setInterval(aoBater, 1000);
    vivos.current.add(id);
    aoMudar(vivos.current.size);
    if (!limpeza) return undefined;
    return () => {
      clearInterval(id);
      vivos.current.delete(id);
      aoMudar(vivos.current.size);
    };
  }, [limpeza, aoBater, vivos, aoMudar]);

  return <Sprite desenho={AMPULHETA} className="demo__ampulheta" />;
}

function DemoEfeito() {
  const [naTela, setNaTela] = useState(true);
  const [limpeza, setLimpeza] = useState(true);
  const [batidas, setBatidas] = useState(0);
  const [vivosAgora, setVivosAgora] = useState(0);
  const vivos = useRef(new Set());

  // os intervalos esquecidos de propósito param quando o livro fecha
  useEffect(() => {
    const lista = vivos.current;
    return () => lista.forEach((id) => clearInterval(id));
  }, []);

  const bater = useCallback(() => setBatidas((n) => n + 1), []);

  function pararTudo() {
    vivos.current.forEach((id) => clearInterval(id));
    vivos.current.clear();
    setVivosAgora(0);
    setNaTela(false);
  }

  const codigo = `useEffect(() => {\n  const id = setInterval(tique, 1000);${limpeza ? '\n  return () => clearInterval(id);' : ''}\n}, []);`;
  return (
    <>
      <Opcoes rotulo="Ampulheta na tela" opcoes={['sim', 'não']} valor={naTela ? 'sim' : 'não'} aoEscolher={(opcao) => setNaTela(opcao === 'sim')} />
      <Opcoes rotulo="Com limpeza" opcoes={['sim', 'não']} valor={limpeza ? 'sim' : 'não'} aoEscolher={(opcao) => setLimpeza(opcao === 'sim')} />
      <Codigo>{codigo}</Codigo>
      <div className="demo__resultado">
        {naTela ? (
          <AmpulhetaDaDemo key={String(limpeza)} limpeza={limpeza} aoBater={bater} vivos={vivos} aoMudar={setVivosAgora} />
        ) : (
          <span className="demo__nada">Ampulheta fora da tela</span>
        )}
        <span className={vivosAgora > 1 ? 'demo__contador demo__contador--ruim' : 'demo__contador'}>
          Intervalos rodando: {vivosAgora}
        </span>
        <span className="demo__contador">Batidas: {batidas}</span>
      </div>
      <p className="demo__legenda">
        {limpeza
          ? 'Com limpeza, esconder a ampulheta para o intervalo. Mostre e esconda várias vezes: nunca passa de 1.'
          : 'Sem limpeza, esconda e mostre a ampulheta algumas vezes: cada volta deixa um intervalo novo rodando, e as batidas aceleram.'}
      </p>
      {vivosAgora > 1 && (
        <button type="button" className="botao botao--pedra botao--pequeno" onClick={pararTudo}>
          Parar todos os intervalos
        </button>
      )}
    </>
  );
}

const TAREFAS = ['Comprar pão', 'Estudar React', 'Dar comida pro gato'];
const DEMORAS = { '0,5 s': 500, '1,5 s': 1500, '3 s': 3000 };

// fase 9: um pedido de mentira, com demora e defeito escolhidos na hora
function DemoApi({ modo }) {
  const [demora, setDemora] = useState('1,5 s');
  const [defeito, setDefeito] = useState(false);
  const [resposta, setResposta] = useState(null);
  const [etapa, setEtapa] = useState('esperando');
  const espera = useRef(null);

  const buscar = useCallback(() => {
    clearTimeout(espera.current);
    setResposta(null);
    setEtapa('esperando');
    espera.current = setTimeout(() => {
      setResposta(defeito ? 'erro' : TAREFAS);
      setEtapa('pronto');
    }, DEMORAS[demora]);
  }, [defeito, demora]);

  useEffect(() => {
    buscar();
    return () => clearTimeout(espera.current);
  }, [buscar]);

  const tag = doModo('p', 'Text', modo);
  const codigo = `fetch('/api/tarefas')\n  .then((resposta) => resposta.json())\n  .then((dados) => setTarefas(dados))\n  .catch(() => setErro(true));\n\n// agora: tarefas = ${resposta === null ? 'null' : resposta === 'erro' ? 'null, erro = true' : '[3 tarefas]'}`;

  return (
    <>
      <Opcoes rotulo="Demora do servidor" opcoes={Object.keys(DEMORAS)} valor={demora} aoEscolher={setDemora} />
      <Opcoes rotulo="Servidor" opcoes={['funcionando', 'com defeito']} valor={defeito ? 'com defeito' : 'funcionando'} aoEscolher={(opcao) => setDefeito(opcao === 'com defeito')} />
      <Codigo>{codigo}</Codigo>
      <div className="demo__resultado demo__resultado--lista">
        {etapa === 'esperando' && <span className="demo__carregando">{`<${tag}>Carregando...</${tag}>`}</span>}
        {resposta === 'erro' && <span className="demo__erro">Não deu pra buscar as tarefas. Tente de novo.</span>}
        {Array.isArray(resposta) && (
          <ul className="demo__tarefas">
            {resposta.map((tarefa) => (
              <li key={tarefa}>{tarefa}</li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" className="botao botao--pedra botao--pequeno" onClick={buscar}>
        Buscar de novo
      </button>
      <p className="demo__legenda">
        O carregando aparece enquanto a resposta não chega. Com defeito, quem segura o erro é o <code>.catch</code>.
      </p>
    </>
  );
}

// fase 10: o painel de batalha pronto, contra um boneco de treino
const TIME_DE_TREINO = [
  { id: 1, nome: 'Lia', forca: 2 },
  { id: 2, nome: 'Tom', forca: 3 },
];

function DemoTreino({ modo }) {
  const [restante, setRestante] = useState(7);
  const [ultimo, setUltimo] = useState(null);
  const evento = doModo('onClick', 'onPress', modo);

  return (
    <>
      <Codigo>{`const [restante, setRestante] = useState(7);\n// agora: restante = ${restante}\n\n${evento}={() => setRestante(restante - heroi.forca)}\n\nif (restante <= 0) return <Vitoria />;`}</Codigo>
      <div className="demo__resultado demo__resultado--treino">
        {restante <= 0 ? (
          <span className="demo__placa">O boneco dormiu!</span>
        ) : (
          <>
            <span className="demo__contador">Energia do boneco: {restante}</span>
            <div className="demo__botoes">
              {TIME_DE_TREINO.map((heroi) => (
                <button
                  key={heroi.id}
                  type="button"
                  className="botao botao--fogo botao--pequeno"
                  data-som="golpe"
                  onClick={() => {
                    setRestante(restante - heroi.forca);
                    setUltimo(heroi);
                  }}
                >
                  {heroi.nome} (força {heroi.forca})
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <p className="demo__legenda">
        {ultimo ? `${ultimo.nome} tirou ${ultimo.forca} de energia.` : 'Ataque e veja o estado mudar no código.'}{' '}
        {restante < 0 && 'A energia passou do zero, e o <= 0 pegou mesmo assim.'}
      </p>
      {restante <= 0 && (
        <button
          type="button"
          className="botao botao--pedra botao--pequeno"
          onClick={() => {
            setRestante(7);
            setUltimo(null);
          }}
        >
          Lutar de novo
        </button>
      )}
    </>
  );
}

const DEMOS = {
  jsx: DemoJsx,
  props: DemoProps,
  eventos: DemoEventos,
  estado: DemoEstado,
  condicional: DemoCondicional,
  lista: DemoLista,
  flex: DemoFlex,
  efeito: DemoEfeito,
  api: DemoApi,
  treino: DemoTreino,
};

export function Experimente({ demo, modo }) {
  const Demo = DEMOS[demo];
  if (!Demo) return null;
  return (
    <div className="demo" onPointerDownCapture={() => conquistar('cientista')} onInputCapture={() => conquistar('cientista')}>
      <Demo key={modo} modo={modo} />
    </div>
  );
}
