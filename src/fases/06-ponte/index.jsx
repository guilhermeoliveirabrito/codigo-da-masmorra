import {
  acharPecas,
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaPonte, TABUAS_DA_CENA } from './CenaPonte';

// a segunda lista é diferente pra pegar tábua escrita fixa no código
const LISTAS = [
  TABUAS_DA_CENA,
  [
    { id: 7, madeira: 'ebano' },
    { id: 8, madeira: 'cedro' },
    { id: 9, madeira: 'ebano' },
  ],
];

function conferirPonte({ Componente, modo, traduzir }, lista, primeira) {
  const teste = desenharEscondido(<Componente tabuas={lista} />);
  try {
    if (teste.erro) return erro(traduzir(teste.erro));

    if (modo === 'mobile') {
      const solto = acharTextoSolto(teste.container);
      if (solto) return quase(mensagemTextoSolto(solto));
    }

    const tabuas = acharPecas(teste.container, 'tabua');
    if (tabuas.length === 0) {
      return quase('A ponte ficou sem tábuas. Use `tabuas.map(...)` pra transformar cada item da lista numa `<Tabua />`.');
    }
    if (tabuas.length !== lista.length) {
      if (tabuas.length === 1) {
        return quase('Só apareceu uma tábua. Em vez de escrever a `<Tabua>` na mão, use `tabuas.map((tabua) => <Tabua ... />)`: o map cria uma pra cada item da lista.');
      }
      if (!primeira && tabuas.length === LISTAS[0].length) {
        return quase('A ponte sai sempre com 5 tábuas, mesmo quando a lista muda. Parece que as tábuas foram escritas fixas no código. Use a lista que chega na prop `tabuas`.');
      }
      return quase(`A lista tem ${lista.length} tábuas, mas a ponte saiu com ${tabuas.length}.`);
    }

    const madeiras = tabuas.map((tabua) => tabua.dataset.madeira);
    const esperadas = lista.map((item) => item.madeira);
    if (madeiras.join() !== esperadas.join()) {
      if (madeiras.every((madeira) => madeira === madeiras[0])) {
        return quase('A quantidade de tábuas está certa, mas saíram todas iguais. Passe a madeira de cada item: `madeira={tabua.madeira}`.');
      }
      return quase('As tábuas saíram com a madeira trocada. Cada `<Tabua>` deve receber a madeira do próprio item: `madeira={tabua.madeira}`.');
    }
    return null;
  } finally {
    teste.desmontar();
  }
}

export const fasePonte = {
  id: 'ponte',
  numero: 6,
  titulo: 'A ponte',
  conceito: 'listas',
  componente: 'Ponte',
  arquivo: 'Ponte.jsx',
  Cena: CenaPonte,
  atrasoDaVitoria: 2600,

  falas: [
    { quem: 'lia', texto: 'Um abismo! Do outro lado está a saída, e temos uma pilha de tábuas.' },
    { quem: 'lia', texto: 'Monta a ponte com elas? Uma tábua pra cada item da lista, na ordem.' },
  ],
  objetivo: 'Faça a `Ponte` transformar cada item da lista `tabuas` numa `<Tabua />` com a madeira certa, usando `map` e `key`.',

  codigoInicial: {
    web: `import { Tabua } from 'masmorra';

// O jogo usa a sua ponte assim:
//   <Ponte tabuas={tabuas} />
// tabuas é uma lista, tipo:
//   [{ id: 1, madeira: 'carvalho' }, { id: 2, madeira: 'pinho' }, ...]
// Cada item vira uma <Tabua madeira="..." />.

export function Ponte({ tabuas }) {
  return (
    <>
      <Tabua madeira="carvalho" />
    </>
  );
}
`,
    mobile: `import { Tabua } from 'masmorra';

// O jogo usa a sua ponte assim:
//   <Ponte tabuas={tabuas} />
// tabuas é uma lista, tipo:
//   [{ id: 1, madeira: 'carvalho' }, { id: 2, madeira: 'pinho' }, ...]
// Cada item vira uma <Tabua madeira="..." />.

export function Ponte({ tabuas }) {
  return (
    <>
      <Tabua madeira="carvalho" />
    </>
  );
}
`,
  },

  livro: {
    titulo: 'Listas: um componente para cada item',
    blocos: [
      {
        texto:
          'Quase todo app mostra listas: mensagens, produtos, tarefas. Em vez de escrever cada item na mão, você pega a lista de dados e transforma cada item num componente com o `map`.',
      },
      {
        texto:
          'O `map` passa por cada item de um array e devolve um array novo com o que você retornar. Com JSX, ele vira uma lista de elementos:',
      },
      {
        tipo: 'codigo',
        codigo: {
          web: `const tarefas = [
  { id: 1, titulo: 'Comprar pão' },
  { id: 2, titulo: 'Estudar React' },
];

export function Lista() {
  return (
    <ul>
      {tarefas.map((tarefa) => (
        <li key={tarefa.id}>{tarefa.titulo}</li>
      ))}
    </ul>
  );
}`,
          mobile: `const tarefas = [
  { id: 1, titulo: 'Comprar pão' },
  { id: 2, titulo: 'Estudar React' },
];

export function Lista() {
  return (
    <View>
      {tarefas.map((tarefa) => (
        <Text key={tarefa.id}>{tarefa.titulo}</Text>
      ))}
    </View>
  );
}`,
        },
      },
      {
        texto:
          'Repare na `key`. Ela é obrigatória em listas: o React usa a key pra saber qual item é qual quando a lista muda (um item novo, um apagado, a ordem trocada). Ela precisa ser **única** entre os itens, e o melhor é usar um id que já venha nos dados.',
      },
      {
        tipo: 'alerta',
        texto:
          'Evite usar como key um valor que pode se repetir, tipo o nome. Duas tábuas de pinho teriam a mesma key, e o React se confunde na hora de atualizar.',
      },
      {
        texto:
          'O `<>` e `</>` em volta são um **fragment**: um embrulho que não aparece na tela. Ele serve quando o componente precisa devolver vários elementos sem criar uma caixa a mais.',
      },
      {
        tipo: 'pratica',
        texto: {
          web: 'Num app de mensagens, o histórico inteiro é um `mensagens.map(...)` que transforma cada mensagem num balão. Quando chega uma nova, a key evita que o React redesenhe todas as outras.',
          mobile:
            'Num app de mensagens, o histórico inteiro é um `mensagens.map(...)` que transforma cada mensagem num balão. Em listas grandes, o React Native costuma usar a `FlatList`, que só desenha o que aparece na tela, mas a ideia da key é a mesma.',
        },
      },
    ],
  },

  dicas: [
    'Troque a `<Tabua>` escrita na mão por um `map` dentro de chaves: `{tabuas.map((tabua) => ...)}`.',
    'Pra cada item, devolva uma tábua com a madeira dele: `<Tabua madeira={tabua.madeira} />`.',
    'Falta a key, que precisa ser única. Use o id: `<Tabua key={tabua.id} madeira={tabua.madeira} />`.',
  ],

  solucao: {
    web: `import { Tabua } from 'masmorra';

export function Ponte({ tabuas }) {
  return (
    <>
      {tabuas.map((tabua) => (
        <Tabua key={tabua.id} madeira={tabua.madeira} />
      ))}
    </>
  );
}`,
    mobile: `import { Tabua } from 'masmorra';

export function Ponte({ tabuas }) {
  return (
    <>
      {tabuas.map((tabua) => (
        <Tabua key={tabua.id} madeira={tabua.madeira} />
      ))}
    </>
  );
}`,
  },

  aprendeu:
    'O `map` transforma cada item de uma lista num componente, e cada um precisa de uma `key` única, de preferência o id. Assim a tela acompanha a lista, seja qual for o tamanho dela.',

  verificar(contexto) {
    for (let i = 0; i < LISTAS.length; i++) {
      const problema = conferirPonte(contexto, LISTAS[i], i === 0);
      if (problema) return problema;
    }

    const avisosDeKey = [...contexto.avisos].filter((aviso) => aviso.includes('key'));
    const semKey = avisosDeKey.find((aviso) => aviso.includes('precisa de uma key'));
    if (semKey) return { ...quase(`A ponte ficou de pé, mas falta um detalhe. ${semKey}`), esconderAvisos: true };
    if (avisosDeKey.length) {
      const repetidas = [...new Set(avisosDeKey.flatMap((aviso) => aviso.match(/\(([^)]+)\)/)?.[1].split(', ') ?? []))];
      return {
        ...quase(`A ponte ficou de pé, mas tem key repetida (${repetidas.join(', ')}). Cada key precisa ser única: use o id, \`key={tabua.id}\`.`),
        esconderAvisos: true,
      };
    }

    return ok('A ponte está firme! Cada item da lista virou uma tábua.');
  },
};
