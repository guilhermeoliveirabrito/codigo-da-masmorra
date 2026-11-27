import {
  acharBotao,
  acharPecas,
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaTocha } from './CenaTocha';

export const faseTocha = {
  id: 'tocha',
  numero: 4,
  titulo: 'A tocha',
  conceito: 'useState',
  elenco: ['tom'],
  segredo: { tipo: 'caveira', x: 106, y: 72 },
  componente: 'Tocha',
  arquivo: 'Tocha.jsx',
  Cena: CenaTocha,

  falas: [
    { quem: 'tom', texto: 'Esta sala está um breu. Tem uma tocha na parede, mas ninguém consegue acender.' },
    { quem: 'tom', texto: 'Faz um botão que acende e apaga a tocha? Ela precisa lembrar se está acesa.' },
  ],
  objetivo: {
    web: 'Faça a `Tocha` guardar se está acesa (com `useState`) e trocar a cada clique no botão.',
    mobile: 'Faça a `Tocha` guardar se está acesa (com `useState`) e trocar a cada toque no botão.',
  },

  codigoInicial: {
    web: `import { useState } from 'react';
import { Chama } from 'masmorra';

// A <Chama /> é a tocha da parede:
//   <Chama acesa={true} />  mostra a tocha acesa
//   <Chama acesa={false} /> mostra a tocha apagada
// Faça o botão acender e apagar a tocha a cada clique.

export function Tocha() {
  const acesa = false;

  return (
    <div>
      <Chama acesa={acesa} />
      <button>Acender</button>
    </div>
  );
}
`,
    mobile: `import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chama } from 'masmorra';

// A <Chama /> é a tocha da parede:
//   <Chama acesa={true} />  mostra a tocha acesa
//   <Chama acesa={false} /> mostra a tocha apagada
// Faça o botão acender e apagar a tocha a cada toque.

export function Tocha() {
  const acesa = false;

  return (
    <View>
      <Chama acesa={acesa} />
      <Pressable>
        <Text>Acender</Text>
      </Pressable>
    </View>
  );
}
`,
  },

  passos: {
    web: [
      'Troque a `const acesa = false` por um estado: `const [acesa, setAcesa] = useState(false);`.',
      'No `<button>`, use o `onClick` com uma arrow function que chama o `setAcesa`.',
      'Pra acender e apagar, passe o contrário do valor atual: `!acesa`.',
      'Aperte **Rodar** e clique no botão da tocha, lá na cena.',
    ],
    mobile: [
      'Troque a `const acesa = false` por um estado: `const [acesa, setAcesa] = useState(false);`.',
      'No `<Pressable>`, use o `onPress` com uma arrow function que chama o `setAcesa`.',
      'Pra acender e apagar, passe o contrário do valor atual: `!acesa`.',
      'Aperte **Rodar** e toque no botão da tocha, lá na cena.',
    ],
  },

  livro: {
    titulo: 'Estado: a memória do componente',
    resumo: 'O `useState` dá memória ao componente: ele guarda um valor e desenha a tela de novo sempre que o valor muda.',
    ideia:
      'Até aqui, os componentes só mostravam o que recebiam. Mas uma tocha precisa **lembrar** se está acesa, e a tela precisa mudar quando ela acende.\nUma variável comum não serve: mudar `acesa = true` não avisa o React, então a tela continua igual. Pra isso existe o **estado**, criado com o `useState`.',
    exemplo: {
      codigo: {
        web: `import { useState } from 'react';

export function Contador() {
  const [cliques, setCliques] = useState(0);

  return (
    <button onClick={() => setCliques(cliques + 1)}>
      Cliquei {cliques} vezes
    </button>
  );
}`,
        mobile: `import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export function Contador() {
  const [cliques, setCliques] = useState(0);

  return (
    <Pressable onPress={() => setCliques(cliques + 1)}>
      <Text>Cliquei {cliques} vezes</Text>
    </Pressable>
  );
}`,
      },
      notas: [
        { marca: "from 'react'", texto: 'O `useState` vem do React e precisa ser importado.' },
        {
          marca: 'useState(0)',
          texto:
            '`useState(0)` cria o estado, começando em `0`. Ele devolve duas coisas: o valor atual (`cliques`) e a função que troca o valor (`setCliques`). Os colchetes pegam as duas.',
        },
        {
          marca: 'setCliques(cliques + 1)',
          texto: 'No clique, o `setCliques` guarda o valor novo, e o React desenha o componente de novo, já com ele.',
        },
        { marca: 'Cliquei', texto: 'A tela sempre mostra o valor atual do estado.' },
      ],
    },
    extras: [
      {
        texto:
          'Pra inverter verdadeiro e falso, use o `!`, que quer dizer "o contrário de": `!true` é `false`. Então `setAcesa(!acesa)` acende quando está apagada e apaga quando está acesa.',
      },
    ],
    experimente: 'estado',
    diferencas: {
      igual: 'O `useState` é igual nos dois modos. Ele vem do `react`, e não do `react-native`.',
      web: 'O botão é um `<button onClick={...}>`.',
      mobile: 'O botão é um `<Pressable onPress={...}>`, com um `<Text>` dentro.',
    },
    cuidado: {
      web: 'Repare na arrow function: `onClick={() => setAcesa(!acesa)}`. Sem ela, `onClick={setAcesa(!acesa)}` muda o estado na hora de desenhar, o que desenha de novo, que muda de novo... e a tela trava num loop.\nE o `useState` fica sempre no começo do componente, nunca dentro de um `if` ou de um loop.',
      mobile:
        'Repare na arrow function: `onPress={() => setAcesa(!acesa)}`. Sem ela, `onPress={setAcesa(!acesa)}` muda o estado na hora de desenhar, o que desenha de novo, que muda de novo... e a tela trava num loop.\nE o `useState` fica sempre no começo do componente, nunca dentro de um `if` ou de um loop.',
    },
    pratica:
      'Estado está em todo lugar: um menu aberto ou fechado, o texto de um campo de busca, o item escolhido numa lista, o coração de curtir que fica vermelho.',
  },

  dicas: [
    'Troque a `const acesa = false` por um estado: `const [acesa, setAcesa] = useState(false);`. O import do `useState` já está lá em cima.',
    {
      web: 'Agora o botão precisa trocar o estado quando for clicado: `<button onClick={() => ...}>`.',
      mobile: 'Agora o botão precisa trocar o estado quando for tocado: `<Pressable onPress={() => ...}>`.',
    },
    "Dentro da arrow function, chame `setAcesa(!acesa)`. Se quiser, troque o texto do botão com `{acesa ? 'Apagar' : 'Acender'}`.",
  ],

  solucao: {
    web: `import { useState } from 'react';
import { Chama } from 'masmorra';

export function Tocha() {
  const [acesa, setAcesa] = useState(false);

  return (
    <div>
      <Chama acesa={acesa} />
      <button onClick={() => setAcesa(!acesa)}>
        {acesa ? 'Apagar' : 'Acender'}
      </button>
    </div>
  );
}`,
    mobile: `import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Chama } from 'masmorra';

export function Tocha() {
  const [acesa, setAcesa] = useState(false);

  return (
    <View>
      <Chama acesa={acesa} />
      <Pressable onPress={() => setAcesa(!acesa)}>
        <Text>{acesa ? 'Apagar' : 'Acender'}</Text>
      </Pressable>
    </View>
  );
}`,
  },

  aprendeu:
    '`useState` dá memória ao componente: ele devolve o valor e a função que troca o valor. Cada vez que o estado muda, o React desenha o componente de novo.',

  verificar({ Componente, modo, traduzir, avisos, codigo }) {
    const evento = modo === 'web' ? 'onClick' : 'onPress';
    const teste = desenharEscondido(<Componente />);
    const chama = () => acharPecas(teste.container, 'chama')[0];
    const acesa = () => chama()?.dataset.acesa === 'true';

    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      if (!chama()) return quase('A tocha sumiu. O componente precisa mostrar a `<Chama acesa={acesa} />`.');
      if (acesa()) {
        return quase('A tocha já começou acesa, mas a sala começa escura. O valor inicial do estado precisa ser `false`.');
      }

      if (!acharBotao(teste.container, modo)) {
        return quase(
          modo === 'web'
            ? 'Não achei o botão. A tocha precisa de um `<button>` pra acender.'
            : 'Não achei o botão. A tocha precisa de um `<Pressable>` pra acender.'
        );
      }

      teste.clicar(acharBotao(teste.container, modo));
      if (teste.erro) return erro(traduzir(teste.erro));

      if (!acesa()) {
        const avisoDoEvento = [...avisos].find((aviso) => aviso.includes('evento'));
        if (avisoDoEvento) return quase(avisoDoEvento);
        if (!/useState\s*\(/.test(codigo)) {
          return quase('O clique não acendeu a tocha. Mudar uma variável comum não avisa o React, então a tela não muda. Use o estado: `const [acesa, setAcesa] = useState(false);`.');
        }
        return quase(`A tocha continuou apagada depois do clique. Confira se o \`${evento}\` chama o \`setAcesa\` e se a \`<Chama>\` recebe o \`acesa\`.`);
      }

      teste.clicar(acharBotao(teste.container, modo));
      if (teste.erro) return erro(traduzir(teste.erro));
      if (acesa()) return quase('A tocha acende, mas não apaga. O clique precisa inverter o valor: `setAcesa(!acesa)`.');

      return ok(`A tocha acende e apaga! Agora ${modo === 'web' ? 'clique' : 'toque'} no botão lá na cena pra iluminar a sala.`, {
        esperarInteracao: true,
      });
    } finally {
      teste.desmontar();
    }
  },
};
