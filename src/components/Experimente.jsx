import { useRef, useState } from 'react';
import { Chave, Pedra, PortaAberta, PortaFechada, Tabua } from '../motor/masmorra';
import { TOCHA, TOCHA_APAGADA } from '../pixel/desenhos';
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

const DEMOS = {
  jsx: DemoJsx,
  props: DemoProps,
  eventos: DemoEventos,
  estado: DemoEstado,
  condicional: DemoCondicional,
  lista: DemoLista,
  flex: DemoFlex,
};

export function Experimente({ demo, modo }) {
  const Demo = DEMOS[demo];
  if (!Demo) return null;
  return (
    <div className="demo">
      <Demo key={modo} modo={modo} />
    </div>
  );
}
