// erro com a mensagem já pronta pro jogador
export class ErroDoJogo extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'ErroDoJogo';
    this.doJogo = true;
  }
}

const DO_REACT_NATIVE = {
  View: '<div>',
  Text: '<p> ou <span>',
  Pressable: '<button>',
  Image: '<img>',
  TextInput: '<input>',
  ScrollView: '<div>',
  StyleSheet: 'CSS',
};

export function mensagemNaoImportado(nome, modo) {
  if (modo === 'web') {
    const noLugar = DO_REACT_NATIVE[nome] ?? 'as tags do HTML';
    return `${nome} é do React Native, que é a biblioteca do celular. No modo Web, use ${noLugar} no lugar.`;
  }
  return `você usou ${nome}, mas não importou. Coloque ele dentro das chaves do import lá em cima: import { ..., ${nome} } from 'react-native';`;
}

const HOOKS =['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext'];

function acharLinha(codigo, nome) {
  const regex = new RegExp(`\\b${nome}\\b`);
  const linhas = codigo.split('\n');
  const indice = linhas.findIndex(
    (linha) => regex.test(linha) && !/^\s*(\/\/|import\b)/.test(linha)
  );
  return indice === -1 ? null : indice + 1;
}

// o acorn põe a posição no fim, tipo "(3:10)"
function limparMensagemDoAcorn(mensagem) {
  return mensagem.replace(/\s*\(\d+:\d+\)$/, '');
}

export function traduzirErroDeSintaxe(erro, codigo) {
  const linha = erro.loc?.line;
  const prefixo = linha ? `Linha ${linha}: ` : '';
  const original = limparMensagemDoAcorn(erro.message ?? '');
  const noFim = erro.pos >= codigo.trimEnd().length;
  let m;

  if ((m = original.match(/Expected corresponding JSX closing tag for <(.+)>/))) {
    return `${prefixo}a tag <${m[1]}> foi aberta, mas o fechamento não bate. Ela precisa fechar com </${m[1]}>.`;
  }
  if (/Adjacent JSX elements must be wrapped/.test(original)) {
    return `${prefixo}o return só pode devolver um elemento. Coloque tudo dentro de uma tag só (uma <div>, uma <View> ou um <>...</>).`;
  }
  if (/Unterminated string constant/.test(original)) {
    return `${prefixo}uma aspa foi aberta e não foi fechada.`;
  }
  if (/Unterminated JSX contents/.test(original)) {
    return `${prefixo}uma tag foi aberta e não foi fechada.`;
  }
  if ((m = original.match(/Identifier '(.+)' has already been declared/))) {
    return `${prefixo}o nome ${m[1]} foi criado duas vezes. Cada nome só pode ser declarado uma vez.`;
  }
  if (/Unexpected token/.test(original) && noFim) {
    return `${prefixo}o código terminou antes da hora. Deve estar faltando fechar algum (, { ou alguma tag.`;
  }
  if (/Unexpected token|Unexpected character/.test(original)) {
    return `${prefixo}tem um símbolo fora do lugar aqui. Confira se não faltou ou sobrou algum ( ) { } < > ou ;.`;
  }
  return `${prefixo}erro de sintaxe (${original}).`;
}

export function traduzirErro(erro, codigo, modo) {
  const mensagem = traduzir(erro, codigo, modo);
  return mensagem[0].toUpperCase() + mensagem.slice(1);
}

function traduzir(erro, codigo, modo) {
  if (erro?.doJogo) return erro.message;
  const mensagem = String(erro?.message ?? erro);
  let m;

  // Chrome/Firefox e Safari
  if ((m = mensagem.match(/^(\w+) is not defined/) || mensagem.match(/Can't find variable: (\w+)/))) {
    const nome = m[1];
    const linha = acharLinha(codigo, nome);
    const prefixo = linha ? `Linha ${linha}: ` : '';

    if (nome in DO_REACT_NATIVE) return prefixo + mensagemNaoImportado(nome, modo);
    if (HOOKS.includes(nome)) {
      return `${prefixo}você usou ${nome}, mas não importou. Adicione no topo: import { ${nome} } from 'react';`;
    }
    const dicaProp =
      nome === 'abrirPorta' || nome === 'nome' || nome === 'classe'
        ? ` Ele chega como prop, então precisa estar nas chaves dos parênteses da função, tipo ({ ${nome} }).`
        : '';
    return `${prefixo}o nome ${nome} não existe aqui. Confira se está escrito certo (maiúsculas e minúsculas contam) ou se faltou criar ou receber ele.${dicaProp}`;
  }

  // em produção o React troca essa mensagem pelo erro #31
  const objeto =
    mensagem.match(/Objects are not valid as a React child \(found: (.+?)\)/) ||
    mensagem.match(/Minified React error #31;.*?args\[\]=([^&\s]+)/);
  if (objeto) {
    const encontrado = decodeURIComponent(objeto[1]);
    const chaves = encontrado.match(/\{(.+)\}/)?.[1];
    return `você tentou mostrar um objeto inteiro na tela${chaves ? ` (com ${chaves})` : ''}. O JSX só sabe mostrar textos e números. Se o componente recebe as props num nome só, use props.nome; ou pegue cada prop direto, com chaves: ({ nome, classe }).`;
  }

  if (/Element type is invalid|Minified React error #130/.test(mensagem)) {
    return 'uma das tags aponta pra algo que não é um componente. Confira se o nome da tag e o import estão certos.';
  }
  if (/Too many re-renders|Minified React error #301/.test(mensagem)) {
    return 'a tela entrou num loop: alguma coisa muda o estado enquanto a tela é desenhada, e isso redesenha a tela de novo, sem parar.';
  }
  if ((m = mensagem.match(/Cannot read properties of (undefined|null) \(reading '(.+)'\)/))) {
    return `você tentou ler .${m[2]} de algo que está vazio (${m[1]}). Confira se o nome antes do ponto está certo e se ele chega mesmo no componente.`;
  }
  if ((m = mensagem.match(/^(\w+)\.\w+ is not a function/)) && m[1] in DO_REACT_NATIVE) {
    const linha = acharLinha(codigo, m[1]);
    return (linha ? `Linha ${linha}: ` : '') + mensagemNaoImportado(m[1], modo);
  }
  if ((m = mensagem.match(/^(\S+) is not a function/))) {
    return `${m[1]} não é uma função, então não dá pra chamar com ( ). Confira o nome.`;
  }
  return `deu um erro ao rodar o código: ${mensagem}`;
}
