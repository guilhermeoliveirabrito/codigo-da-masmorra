import {
  acharPecas,
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaRio } from './CenaRio';

const LARGURA_DO_TESTE = 400;
const FOLGA = 3;

export const faseRio = {
  id: 'rio',
  numero: 7,
  titulo: 'Pedras no rio',
  conceito: 'flexbox',
  elenco: ['tom'],
  componente: 'Travessia',
  arquivo: 'Travessia.jsx',
  Cena: CenaRio,
  atrasoDaVitoria: 3200,

  falas: [
    { quem: 'tom', texto: 'Um rio no meio da masmorra, e eu não sei nadar.' },
    { quem: 'tom', texto: 'Se as pedras ficarem em fila, de uma margem à outra e com o mesmo espaço entre elas, eu atravesso pulando.' },
  ],
  objetivo: {
    web: 'Arrume a `<div>` da `Travessia` com flexbox pra deixar as 4 pedras em fila, espalhadas de uma margem à outra.',
    mobile: 'Arrume a `<View>` da `Travessia` com flexbox pra deixar as 4 pedras em fila, espalhadas de uma margem à outra.',
  },

  codigoInicial: {
    web: `import { Pedra } from 'masmorra';

// As pedras precisam ficar em fila, de uma margem à outra,
// com o mesmo espaço entre elas. Hoje estão empilhadas.

export function Travessia() {
  return (
    <div>
      <Pedra />
      <Pedra />
      <Pedra />
      <Pedra />
    </div>
  );
}
`,
    mobile: `import { StyleSheet, View } from 'react-native';
import { Pedra } from 'masmorra';

// As pedras precisam ficar em fila, de uma margem à outra,
// com o mesmo espaço entre elas. Hoje estão empilhadas.

export function Travessia() {
  return (
    <View>
      <Pedra />
      <Pedra />
      <Pedra />
      <Pedra />
    </View>
  );
}
`,
  },

  passos: {
    web: [
      'O estilo vai na `<div>` de fora, a que embrulha as pedras: `<div style={{ ... }}>`.',
      "Ligue o flexbox com `display: 'flex'`. As pedras ficam em fila.",
      'Espalhe as pedras com o `justifyContent`. Qual valor encosta as pontas nas margens e divide o resto do espaço?',
      'Aperte **Rodar**.',
    ],
    mobile: [
      'O estilo vai na `<View>` de fora, a que embrulha as pedras: `<View style={{ ... }}>`.',
      "Coloque as pedras em fila com `flexDirection: 'row'`.",
      'Espalhe as pedras com o `justifyContent`. Qual valor encosta as pontas nas margens e divide o resto do espaço?',
      'Aperte **Rodar**.',
    ],
  },

  livro: {
    titulo: 'Layout com flexbox',
    resumo: {
      web: "Pra arrumar elementos lado a lado, ligue o flexbox na caixa de fora (`display: 'flex'`) e use o `justifyContent` pra espalhar.",
      mobile:
        "No React Native toda `View` já é flexbox, mas em coluna. Pra arrumar lado a lado, use `flexDirection: 'row'` e o `justifyContent` pra espalhar.",
    },
    ideia:
      'O **flexbox** diz como os filhos de uma caixa se arrumam: em linha ou em coluna, juntos ou espalhados. Ele é ligado na caixa de fora (o **container**) e vale pros filhos diretos dela.\nÉ como arrumar pedras numa prateleira: você escolhe a direção e o espaço entre elas.',
    exemplo: {
      codigo: {
        web: `<div
  style={{
    display: 'flex',
    justifyContent: 'center',
  }}
>
  <Pedra />
  <Pedra />
</div>`,
        mobile: `<View
  style={{
    flexDirection: 'row',
    justifyContent: 'center',
  }}
>
  <Pedra />
  <Pedra />
</View>`,
      },
      notas: [
        {
          marca: 'style={{',
          texto:
            'O `style` recebe um **objeto**: as chaves de fora dizem "aqui entra JavaScript" e as de dentro são o objeto. Os nomes vão em camelCase: `justifyContent`, e não `justify-content`.',
        },
        { marca: "display: 'flex'", texto: 'Liga o flexbox. No navegador, os filhos passam a ficar **em linha**, um do lado do outro.' },
        {
          marca: "flexDirection: 'row'",
          texto: "No React Native toda View já é flexbox, mas em **coluna**. O `'row'` coloca os filhos em linha.",
        },
        {
          marca: 'justifyContent',
          texto:
            "Decide como os filhos se espalham:\n`'flex-start'`: todos no começo (é o padrão).\n`'center'`: todos juntos no meio.\n`'space-between'`: as pontas encostam nas bordas e o espaço que sobra é dividido entre eles.\n`'space-around'` e `'space-evenly'`: espalham, mas deixam espaço também nas pontas.",
        },
      ],
    },
    extras: [
      {
        tipo: 'codigo',
        codigo: {
          web: `// dá pra guardar o estilo numa constante
const fila = { display: 'flex', justifyContent: 'space-between' };

<div style={fila}>...</div>`,
          mobile: `// no React Native é comum usar o StyleSheet
const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
});

<View style={estilos.fila}>...</View>`,
        },
      },
    ],
    experimente: 'flex',
    diferencas: {
      web: "A `<div>` só vira flexbox com `display: 'flex'`, e aí começa **em linha**.",
      mobile: "Toda `View` já é flexbox, mas começa **em coluna**. Pra ficar em linha: `flexDirection: 'row'`.",
    },
    cuidado:
      'A diferença que mais engana: no navegador o flexbox começa em linha (`row`); no React Native, em coluna (`column`). O mesmo estilo pode sair diferente nas duas plataformas.',
    pratica:
      'Barra de navegação, linha de ícones, cartões lado a lado, botões espalhados no rodapé: quase todo layout de app é feito com flexbox.',
  },

  dicas: [
    {
      web: 'O estilo vai na `<div>` de fora, a que embrulha as pedras: `<div style={{ ... }}>`.',
      mobile: 'O estilo vai na `<View>` de fora, a que embrulha as pedras: `<View style={{ ... }}>`.',
    },
    {
      web: "Primeiro coloque as pedras em fila, ligando o flexbox: `display: 'flex'`.",
      mobile: "Toda View já é flexbox, mas em coluna. Pra deixar em fila: `flexDirection: 'row'`.",
    },
    {
      web: "Agora espalhe de margem a margem: `style={{ display: 'flex', justifyContent: 'space-between' }}`.",
      mobile: "Agora espalhe de margem a margem: `style={{ flexDirection: 'row', justifyContent: 'space-between' }}`.",
    },
  ],

  solucao: {
    web: `import { Pedra } from 'masmorra';

export function Travessia() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Pedra />
      <Pedra />
      <Pedra />
      <Pedra />
    </div>
  );
}`,
    mobile: `import { StyleSheet, View } from 'react-native';
import { Pedra } from 'masmorra';

export function Travessia() {
  return (
    <View style={estilos.rio}>
      <Pedra />
      <Pedra />
      <Pedra />
      <Pedra />
    </View>
  );
}

const estilos = StyleSheet.create({
  rio: { flexDirection: 'row', justifyContent: 'space-between' },
});`,
  },

  aprendeu: {
    web: "`display: 'flex'` coloca os filhos em linha, e o `justifyContent` decide como eles se espalham. Com `'space-between'`, as pontas encostam nas bordas e o resto do espaço é dividido.",
    mobile:
      "No React Native, toda View já é flexbox em coluna: `flexDirection: 'row'` coloca os filhos em linha, e o `justifyContent` decide como eles se espalham.",
  },

  verificar({ Componente, modo, traduzir }) {
    const teste = desenharEscondido(<Componente />, null, { largura: LARGURA_DO_TESTE });
    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      const pedras = acharPecas(teste.container, 'pedra');
      if (pedras.length !== 4) {
        return quase(`O Tom precisa de 4 pedras pra atravessar, e apareceram ${pedras.length}. Deixe as 4 \`<Pedra />\` do começo.`);
      }

      const margem = teste.container.getBoundingClientRect();
      const caixas = pedras.map((pedra) => pedra.getBoundingClientRect());

      const emFila = caixas.every((caixa) => Math.abs(caixa.top - caixas[0].top) < FOLGA);
      if (!emFila) {
        return quase(
          modo === 'web'
            ? "As pedras estão uma embaixo da outra. Pra colocar em fila, a `<div>` de fora precisa virar flexbox: `style={{ display: 'flex' }}`. No navegador, o flexbox já começa em linha."
            : "As pedras estão uma embaixo da outra. No React Native toda `View` já é flexbox, mas ela começa em coluna. Use `flexDirection: 'row'` no style da View de fora."
        );
      }

      const esquerda = caixas[0].left - margem.left;
      const direita = margem.right - caixas[3].right;
      const vaos = caixas.slice(1).map((caixa, i) => caixa.left - caixas[i].right);
      const vaosIguais = Math.max(...vaos) - Math.min(...vaos) < FOLGA;
      const juntas = Math.max(...vaos) < FOLGA;

      if (esquerda < FOLGA && direita < FOLGA && vaosIguais) {
        return ok('As pedras estão em fila, de margem a margem. Lá vai o Tom!');
      }
      if (juntas && esquerda < FOLGA) {
        return quase('As pedras estão em fila, mas amontoadas na margem esquerda. Use o `justifyContent` pra espalhar elas pelo rio.');
      }
      if (juntas) {
        return quase("As pedras estão juntinhas no meio do rio. O Tom precisa delas espalhadas: `justifyContent: 'space-between'`.");
      }
      if (vaosIguais) {
        return quase("As pedras estão espalhadas, mas as das pontas não encostam nas margens. O `'space-between'` deixa as pontas coladas nas bordas e divide o espaço entre as pedras.");
      }
      return quase("As pedras estão em fila, mas o espaço entre elas não está igual. Tente `justifyContent: 'space-between'` no container.");
    } finally {
      teste.desmontar();
    }
  },
};
