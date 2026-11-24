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

  livro: {
    titulo: 'Componentes e JSX',
    blocos: [
      {
        texto:
          'Toda tela feita com React é montada com **componentes**. Um componente é só uma **função** que devolve, com `return`, o que deve aparecer na tela.',
      },
      {
        texto:
          'O que vem depois do `return` parece HTML, mas se chama **JSX**: um jeito de descrever a tela dentro do JavaScript. Ele é escrito com **tags**, que abrem e fecham. `<p>` abre, `</p>` fecha, e o texto fica no meio.',
      },
      {
        tipo: 'codigo',
        codigo: {
          web: `export function Saudacao() {
  return <p>Olá, aventureiro!</p>;
}`,
          mobile: `import { Text } from 'react-native';

export function Saudacao() {
  return <Text>Olá, aventureiro!</Text>;
}`,
        },
        legenda: 'Clique nas abas para comparar os dois modos.',
      },
      {
        texto: {
          web: 'No navegador, as tags são as do HTML: `<p>` para um parágrafo, `<h1>` para um título, `<div>` para uma caixa que agrupa outras coisas. Elas não precisam de import.',
          mobile:
            "No celular **não existe HTML**. No lugar das tags, você usa componentes prontos do React Native: `<Text>` para qualquer texto e `<View>` para caixas. Eles precisam ser **importados** no topo do arquivo: `import { Text } from 'react-native';` quer dizer \"pega o Text emprestado da biblioteca react-native\".",
        },
      },
      {
        tipo: 'alerta',
        texto: {
          web: 'O nome de um componente sempre começa com **letra maiúscula** (`Placa`, e não `placa`). É assim que o React sabe que é um componente seu, e não uma tag do HTML.',
          mobile:
            'Regra de ouro do mobile: **todo texto precisa estar dentro de um `<Text>`**. Texto solto fecha o app com o erro *Text strings must be rendered within a Text component*.',
        },
      },
      {
        texto:
          'A palavra `export` na frente da função deixa outros arquivos usarem o componente. É assim que o jogo consegue pegar a sua `Placa` e pendurar ela na parede.',
      },
      {
        tipo: 'projeto',
        texto: {
          web: 'No seu MeuCine, o `Footer.jsx` é um componente assim: uma função com `export` que devolve um `<footer>` com um `<p>` dentro.',
          mobile:
            'No seu Mentor, o `Button.tsx` usa `<Text>` para o texto do botão, e o import do topo pega `Pressable`, `StyleSheet` e `Text` do `react-native`.',
        },
      },
    ],
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
