import {
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  normalizar,
  ok,
  quase,
} from '../../motor/testar';
import { CenaPlaca } from './CenaPlaca';

const FRASE = 'Bem-vindo à masmorra';

export const fasePlaca = {
  id: 'placa',
  numero: 1,
  titulo: 'A placa da entrada',
  conceito: 'JSX',
  componente: 'Placa',
  arquivo: 'Placa.jsx',
  Cena: CenaPlaca,

  falas: [
    { quem: 'guarda', texto: 'Alto lá! Ninguém entra na Masmorra do Código sem saber escrever.' },
    { quem: 'guarda', texto: 'A placa da entrada está em branco. Faça ela mostrar: Bem-vindo à masmorra' },
  ],
  objetivo: 'Faça o componente `Placa` mostrar o texto "Bem-vindo à masmorra".',

  codigoInicial: {
    web: `// O guarda quer que a placa mostre o texto: Bem-vindo à masmorra
// Troque o null pelo JSX da placa.

export function Placa() {
  return null;
}
`,
    mobile: `import { Text } from 'react-native';

// O guarda quer que a placa mostre o texto: Bem-vindo à masmorra
// Troque o null pelo JSX da placa.

export function Placa() {
  return null;
}
`,
  },

  passos: {
    web: [
      'Ache o `return null;` dentro da função `Placa`.',
      'Troque o `null` por uma tag de parágrafo com o texto dentro: `<p>...</p>`.',
      'O texto tem que ser exatamente: Bem-vindo à masmorra',
      'Aperte **Rodar**.',
    ],
    mobile: [
      'Ache o `return null;` dentro da função `Placa`.',
      'Troque o `null` por um `<Text>` com o texto dentro: `<Text>...</Text>`. O import já está pronto.',
      'O texto tem que ser exatamente: Bem-vindo à masmorra',
      'Aperte **Rodar**.',
    ],
  },

  livro: {
    titulo: 'Componentes e JSX',
    resumo: 'Um componente é uma função que devolve, no `return`, o pedaço de tela que deve aparecer.',
    ideia:
      'Pense num carimbo: você desenha uma vez e usa quantas vezes quiser. No React, cada pedaço de tela é um carimbo desses, chamado **componente**.\nPor dentro, ele é uma função comum do JavaScript. A diferença é o que ela devolve: a tela, escrita em **JSX**, que são tags parecidas com as do HTML, só que dentro do JavaScript.',
    exemplo: {
      codigo: {
        web: `export function Saudacao() {
  return <p>Olá, aventureiro!</p>;
}`,
        mobile: `import { Text } from 'react-native';

export function Saudacao() {
  return <Text>Olá, aventureiro!</Text>;
}`,
      },
      notas: [
        {
          marca: 'import',
          texto: 'No celular, as peças de tela vêm da biblioteca `react-native`. O import pega o `Text` emprestado de lá.',
        },
        {
          marca: 'export function',
          texto:
            '`export` deixa outros arquivos (e o jogo) usarem o componente. O nome começa com **letra maiúscula**: é assim que o React sabe que é um componente seu.',
        },
        {
          marca: 'return',
          texto: {
            web: 'Depois do `return` vem o que aparece na tela. A tag abre com `<p>`, o texto fica no meio e ela fecha com uma barra: `</p>`.',
            mobile: 'Depois do `return` vem o que aparece na tela. A tag abre com `<Text>`, o texto fica no meio e ela fecha com uma barra: `</Text>`.',
          },
        },
      ],
      legenda: 'Clique nas abas pra comparar os dois modos.',
    },
    experimente: 'jsx',
    diferencas: {
      web: 'Usa as tags do HTML: `<p>` pra parágrafo, `<h1>` pra título, `<div>` pra uma caixa que agrupa coisas. Não precisa de import.',
      mobile:
        'Não existe HTML. No lugar, vêm os componentes do React Native: `<Text>` pra qualquer texto e `<View>` pra caixas. Eles precisam de import no topo do arquivo.',
    },
    cuidado: {
      web: 'Toda tag que abre precisa fechar. `<p>Olá` sem o `</p>` é erro, e aí nada aparece na tela.',
      mobile:
        '**Todo texto precisa estar dentro de um `<Text>`.** Texto solto fecha o app com o erro *Text strings must be rendered within a Text component*.',
    },
    pratica:
      'Uma tela de verdade é um componente grande feito de vários pequenos: um `Cabecalho`, uma `Lista`, um `Rodape`. Cada um é uma função igual à sua `Placa`, só que com mais coisa dentro.',
  },

  dicas: [
    'O componente precisa devolver o texto. Troque o `null` por uma tag com o texto dentro.',
    {
      web: 'No navegador, a tag de parágrafo é a `<p>`. Ela abre com `<p>` e fecha com `</p>`.',
      mobile: 'No celular, texto vai dentro de `<Text>`, que abre com `<Text>` e fecha com `</Text>`. O import já está pronto lá em cima.',
    },
    {
      web: 'Fica assim: `return <p>...</p>;`, com o texto que o guarda pediu no lugar dos três pontinhos.',
      mobile: 'Fica assim: `return <Text>...</Text>;`, com o texto que o guarda pediu no lugar dos três pontinhos.',
    },
  ],

  solucao: {
    web: `export function Placa() {
  return <p>Bem-vindo à masmorra</p>;
}`,
    mobile: `import { Text } from 'react-native';

export function Placa() {
  return <Text>Bem-vindo à masmorra</Text>;
}`,
  },

  aprendeu: {
    web: 'Um componente é uma função que devolve JSX. No navegador, o texto vai dentro de tags do HTML, como `<p>`.',
    mobile: 'Um componente é uma função que devolve JSX. No celular, todo texto vai dentro de `<Text>`, que vem do import do `react-native`.',
  },

  verificar({ Componente, modo, traduzir }) {
    const teste = desenharEscondido(<Componente />);
    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      const bruto = teste.container.textContent.trim();
      if (!bruto) {
        return quase('A placa ainda está em branco. O componente precisa devolver, no `return`, uma tag com o texto dentro, no lugar do `null`.');
      }

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }
      if (modo === 'web' && !teste.container.firstElementChild) {
        return quase('O texto apareceu, mas está solto, sem tag nenhuma. O guarda quer ele dentro de uma tag, como `<p>`.');
      }

      const texto = normalizar(bruto);
      const esperado = normalizar(FRASE);
      if (texto === esperado) return ok('A placa está pronta! O guarda gostou.');
      if (texto.includes(esperado)) {
        return quase(`Quase! A placa mostra "${bruto}", mas o guarda pediu só "${FRASE}". Tire o que sobrou.`);
      }
      return quase(`A placa mostra "${bruto}", mas o guarda pediu "${FRASE}". Confira o texto.`);
    } finally {
      teste.desmontar();
    }
  },
};
