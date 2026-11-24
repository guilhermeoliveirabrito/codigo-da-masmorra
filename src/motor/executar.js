import * as React from 'react';
import { compilar } from './compilar';
import { ErroDoJogo, mensagemNaoImportado } from './erros';
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

// avisos: coisas que não quebram o código, mas provavelmente estão erradas
export function executar(codigo, modo, avisos) {
  const js = compilar(codigo);

  const modulos = { react: { ...React, default: React } };
  if (modo === 'mobile') modulos['react-native'] = ReactNativeSimulado;

  function importar(nomeDoModulo, linha, nomes) {
    if (nomeDoModulo === 'react-native' && modo === 'web') {
      throw new ErroDoJogo(
        `Linha ${linha}: 'react-native' é a biblioteca do celular. No modo Web você usa as tags do HTML (<p>, <div>, <button>), que não precisam de import.`
      );
    }

    const modulo = modulos[nomeDoModulo];
    if (!modulo) {
      const permitidos = modo === 'mobile' ? "'react' e 'react-native'" : "'react'";
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
    ...COMPONENTES_RN,
    `return (function () {\n${js}\n})();`
  );
  return rodar(criarH(modo, avisos), React.Fragment, importar, ...marcadores);
}

function criarH(modo, avisos) {
  return function h(linha, tipo, props, ...filhos) {
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

    return React.createElement(tipo, props, ...filhos);
  };
}
