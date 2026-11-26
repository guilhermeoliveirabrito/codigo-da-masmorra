import * as React from 'react';
import { compilar } from './compilar';
import { ErroDoJogo, mensagemNaoImportado } from './erros';
import * as Masmorra from './masmorra';
import * as ReactNativeSimulado from './reactNative';

// existem no React Native de verdade, mas ainda não são simulados
const NAO_SIMULADOS = [
  'Image',
  'ScrollView',
  'FlatList',
  'TextInput',
  'TouchableOpacity',
  'Button',
  'SafeAreaView',
  'ActivityIndicator',
  'Switch',
  'Modal',
];

const COMPONENTES_RN = ['View', 'Text', 'Pressable', 'StyleSheet', ...NAO_SIMULADOS];

// o código do jogador usa estes no lugar dos do navegador (ver ambiente.js)
const DO_AMBIENTE = ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch'];

const SEM_INTERNET = {
  setTimeout: (...argumentos) => window.setTimeout(...argumentos),
  setInterval: (...argumentos) => window.setInterval(...argumentos),
  clearTimeout: (id) => window.clearTimeout(id),
  clearInterval: (id) => window.clearInterval(id),
  fetch: () => Promise.reject(new ErroDoJogo('Aqui na masmorra não tem internet. O corvo mensageiro só aparece na fase 9.')),
};

const HTML_PARA_RN = {
  div: 'View',
  section: 'View',
  main: 'View',
  header: 'View',
  footer: 'View',
  article: 'View',
  nav: 'View',
  p: 'Text',
  span: 'Text',
  h1: 'Text',
  h2: 'Text',
  h3: 'Text',
  strong: 'Text',
  button: 'Pressable',
  a: 'Pressable',
};

// limites por tarefa: tempo, voltas de loop e elementos criados (um componente que
// desenha ele mesmo cria elementos sem fim e pode estourar a memória antes do tempo)
const LIMITE_EM_MS = 1500;
const LIMITE_DE_VOLTAS = 5_000_000;
const LIMITE_DE_ELEMENTOS = 20_000;

// avisos: coisas que não quebram o código, mas provavelmente estão erradas
// aoErroEmEvento: recebe erros que acontecem dentro de um onClick/onPress do jogador
export function executar(codigo, modo, avisos, { aoErroEmEvento, ambiente = SEM_INTERNET } = {}) {
  const js = compilar(codigo);

  const react = {
    ...React,
    useEffect: efeitoProtegido(React.useEffect, avisos, aoErroEmEvento),
    useLayoutEffect: efeitoProtegido(React.useLayoutEffect, avisos, aoErroEmEvento),
  };
  react.default = react;
  const modulos = { react, masmorra: Masmorra };
  if (modo === 'mobile') modulos['react-native'] = ReactNativeSimulado;

  function importar(nomeDoModulo, linha, nomes) {
    if (nomeDoModulo === 'react-native' && modo === 'web') {
      throw new ErroDoJogo(
        `Linha ${linha}: 'react-native' é a biblioteca do celular. No modo Web você usa as tags do HTML (<p>, <div>, <button>), que não precisam de import.`
      );
    }

    const modulo = modulos[nomeDoModulo];
    if (!modulo) {
      const permitidos = modo === 'mobile' ? "'react', 'react-native' e 'masmorra'" : "'react' e 'masmorra'";
      throw new ErroDoJogo(
        `Linha ${linha}: a biblioteca '${nomeDoModulo}' não existe aqui na masmorra. Por enquanto dá pra importar ${permitidos}.`
      );
    }

    for (const nome of nomes) {
      if (nome in modulo) continue;
      if (nomeDoModulo === 'react-native' && NAO_SIMULADOS.includes(nome)) {
        throw new ErroDoJogo(
          `Linha ${linha}: o ${nome} existe no React Native de verdade, mas a masmorra ainda não simula ele. Por enquanto use View, Text, Pressable e StyleSheet.`
        );
      }
      throw new ErroDoJogo(
        `Linha ${linha}: '${nomeDoModulo}' não tem nada chamado ${nome}. Confira se o nome está escrito certo (maiúsculas contam).`
      );
    }

    return modulo;
  }

  // Text, Image e StyleSheet já existem no window. Sem esconder, esquecer o
  // import dá um erro confuso do navegador em vez da nossa mensagem.
  const marcadores = COMPONENTES_RN.map((nome) => ({ naoImportado: nome }));
  const rodar = new Function(
    '__h',
    '__Fragment',
    '__importar',
    '__guarda',
    ...COMPONENTES_RN,
    ...DO_AMBIENTE,
    `return (function () {\n${js}\n})();`
  );
  // a mesma guarda vale pros loops e pros componentes que se desenham sem fim
  const guarda = criarGuarda();
  return rodar(
    criarH(modo, avisos, aoErroEmEvento, guarda),
    React.Fragment,
    importar,
    guarda,
    ...marcadores,
    ...DO_AMBIENTE.map((nome) => ambiente[nome] ?? SEM_INTERNET[nome])
  );
}

// Conta tempo e quantidade desde o começo da tarefa atual; quando a tarefa termina,
// o microtask zera. Depois de interromper uma vez, interrompe na hora: o React tenta
// desenhar de novo quando dá erro, e cada tentativa ficaria presa até o limite.
const MOTIVOS = {
  loop: 'esse loop não para nunca, e o jogo precisou interromper. Confira se a condição dele fica falsa em algum momento.',
  desenho:
    'o componente ficou se desenhando sem parar, e o jogo precisou interromper. Isso acontece quando um componente usa ele mesmo no return, tipo <Placa /> dentro da Placa.',
};
const LIMITES = { loop: LIMITE_DE_VOLTAS, desenho: LIMITE_DE_ELEMENTOS };

function criarGuarda() {
  let inicio = null;
  let contagem = { loop: 0, desenho: 0 };
  let estourou = null;
  const erro = (linha, motivo) => new ErroDoJogo(`Linha ${linha}: ${MOTIVOS[motivo]}`);

  return function guarda(linha, motivo = 'loop') {
    if (estourou) throw erro(linha, estourou);
    if (inicio === null) {
      inicio = performance.now();
      queueMicrotask(() => {
        inicio = null;
        contagem = { loop: 0, desenho: 0 };
      });
    }
    contagem[motivo] += 1;
    const passouDoTempo = contagem[motivo] % 1000 === 0 && performance.now() - inicio > LIMITE_EM_MS;
    if (contagem[motivo] > LIMITES[motivo] || passouDoTempo) {
      estourou = motivo;
      throw erro(linha, motivo);
    }
  };
}

// Um efeito que devolve algo que não é função (o useEffect(async ...) devolve uma promessa)
// ou uma limpeza que dá erro derrubariam o jogo inteiro quando a cena sai da tela.
function efeitoProtegido(usarEfeito, avisos, aoErroEmEvento) {
  return function (efeito, dependencias) {
    if (typeof efeito !== 'function') {
      throw new ErroDoJogo(
        'o useEffect precisa receber uma função, tipo useEffect(() => { ... }, []). Do jeito que está, ele recebeu o resultado de uma chamada.'
      );
    }
    return usarEfeito(() => {
      const limpeza = efeito();
      if (typeof limpeza === 'function') {
        return () => {
          try {
            limpeza();
          } catch (erro) {
            aoErroEmEvento?.(erro);
          }
        };
      }
      if (typeof limpeza?.then === 'function') {
        avisos.add(
          'O useEffect recebeu uma função async, e ele não aceita isso direto. Crie a função async dentro do efeito e chame ela em seguida.'
        );
      }
      return undefined;
    }, dependencias);
  };
}

// erro dentro de um onClick não passa pelo error boundary do React, então a gente segura aqui
function protegerEventos(props, aoErroEmEvento) {
  if (!aoErroEmEvento) return props;
  let protegidas = props;
  for (const [nome, valor] of Object.entries(props)) {
    if (!/^on[A-Z]/.test(nome) || typeof valor !== 'function') continue;
    if (protegidas === props) protegidas = { ...props };
    protegidas[nome] = function (...argumentos) {
      try {
        return valor.apply(this, argumentos);
      } catch (erro) {
        aoErroEmEvento(erro);
        return undefined;
      }
    };
  }
  return protegidas;
}

function criarH(modo, avisos, aoErroEmEvento, guarda) {
  return function h(linha, tipo, props, ...filhos) {
    guarda(linha, 'desenho');

    if (tipo?.naoImportado) {
      throw new ErroDoJogo(`Linha ${linha}: ${mensagemNaoImportado(tipo.naoImportado, modo)}`);
    }

    if (tipo === undefined || tipo === null) {
      throw new ErroDoJogo(
        `Linha ${linha}: uma das tags aponta pra algo que não existe. Confira o nome e o import.`
      );
    }

    if (modo === 'mobile' && typeof tipo === 'string') {
      const troca = HTML_PARA_RN[tipo];
      throw new ErroDoJogo(
        `Linha ${linha}: <${tipo}> é uma tag do HTML, e no celular não existe HTML. ` +
          (troca
            ? `No React Native, use <${troca}> no lugar (e lembre de importar).`
            : 'No React Native, use <View> para caixas e <Text> para textos.')
      );
    }

    if (props) {
      if (modo === 'web' && typeof tipo === 'string' && 'onPress' in props) {
        avisos.add(
          `Linha ${linha}: no navegador, o evento de clique se chama onClick. O onPress é do React Native (celular).`
        );
      }
      if (modo === 'mobile' && 'onClick' in props) {
        avisos.add(
          `Linha ${linha}: no React Native, o evento de toque se chama onPress. O onClick é do navegador.`
        );
      }
      if (modo === 'web' && 'class' in props) {
        avisos.add(`Linha ${linha}: no JSX se escreve className, e não class.`);
      }
    }

    for (const filho of filhos) {
      if (Array.isArray(filho)) conferirKeys(filho, linha, avisos);
    }

    return React.createElement(tipo, props && protegerEventos(props, aoErroEmEvento), ...filhos);
  };
}

function conferirKeys(lista, linha, avisos) {
  const elementos = lista.filter((item) => React.isValidElement(item));
  if (elementos.some((elemento) => elemento.key === null)) {
    avisos.add(
      `Linha ${linha}: cada item criado pelo map precisa de uma key, tipo key={item.id}. É assim que o React sabe qual item é qual quando a lista muda.`
    );
    return;
  }
  const keys = elementos.map((elemento) => elemento.key);
  const repetidas = [...new Set(keys.filter((key, i) => keys.indexOf(key) !== i))];
  if (repetidas.length) {
    avisos.add(
      `Linha ${linha}: tem key repetida na lista (${repetidas.join(', ')}). Cada key precisa ser única: o id de cada item é a melhor escolha.`
    );
  }
}
