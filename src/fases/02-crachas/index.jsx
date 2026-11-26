import {
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  normalizar,
  ok,
  quase,
} from '../../motor/testar';
import { CenaCrachas } from './CenaCrachas';

// a Bia não aparece na cena: é o teste escondido contra nome fixo no código
const CASOS = [
  ['Lia', 'arqueira', 'da'],
  ['Tom', 'mago', 'do'],
  ['Bia', 'ladina', 'da'],
];

function conferirCracha({ Componente, modo, traduzir }, [nome, classe, de], anteriores) {
  const teste = desenharEscondido(<Componente nome={nome} classe={classe} />);
  try {
    if (teste.erro) return erro(traduzir(teste.erro));

    const bruto = teste.container.textContent.trim();
    if (!bruto) return quase('O crachá saiu em branco. O componente precisa devolver uma tag com o nome e a classe.');

    if (modo === 'mobile') {
      const solto = acharTextoSolto(teste.container);
      if (solto) return quase(mensagemTextoSolto(solto));
    }

    const texto = normalizar(bruto);
    const temNome = texto.includes(normalizar(nome));
    const temClasse = texto.includes(normalizar(classe));
    if (temNome && temClasse) return null;

    if (anteriores.some(([outro]) => texto.includes(normalizar(outro)))) {
      return quase(`O crachá ${de} ${nome} saiu como "${bruto}". Parece que o nome foi escrito direto no código. O crachá precisa usar as props, pra funcionar com qualquer aventureiro.`);
    }
    if (texto.includes('nome aqui')) {
      return quase('O crachá ainda mostra "Nome aqui". Troque esse texto pelo nome e pela classe que chegam nas props.');
    }
    const palavra = texto.match(/\b(nome|classe)\b/);
    if (palavra) {
      return quase(`O crachá mostrou a palavra "${palavra[1]}" escrita, em vez do valor. Para mostrar o valor de uma prop dentro do JSX, coloque ela entre chaves: \`{${palavra[1]}}\`.`);
    }
    if (temNome) {
      return quase(`O nome apareceu! Falta a classe: o crachá ${de} ${nome} precisa mostrar também "${classe}". Ela chega numa prop chamada \`classe\`.`);
    }
    if (temClasse) {
      return quase(`A classe apareceu! Falta o nome: o crachá precisa mostrar também "${nome}". Ele chega numa prop chamada \`nome\`.`);
    }
    return quase(`O crachá ${de} ${nome} mostrou "${bruto}". Ele precisa mostrar o nome (${nome}) e a classe (${classe}).`);
  } finally {
    teste.desmontar();
  }
}

export const faseCrachas = {
  id: 'crachas',
  numero: 2,
  titulo: 'Crachás para todos',
  conceito: 'props',
  elenco: ['lia', 'tom', 'guarda'],
  componente: 'Cracha',
  arquivo: 'Cracha.jsx',
  Cena: CenaCrachas,

  falas: [
    { quem: 'guarda', texto: 'Muito bem! Agora estes aventureiros precisam de crachás.' },
    { quem: 'guarda', texto: 'Mas atenção: quero UM componente só, que sirva para qualquer aventureiro.' },
  ],
  objetivo: 'Faça o `Cracha` mostrar o nome e a classe que chegam pelas props `nome` e `classe`.',

  codigoInicial: {
    web: `// Os aventureiros precisam de crachás!
// O jogo vai usar o seu componente assim:
//   <Cracha nome="Lia" classe="arqueira" />
//   <Cracha nome="Tom" classe="mago" />
// Cada crachá precisa mostrar o nome e a classe de quem usa.

export function Cracha() {
  return <p>Nome aqui</p>;
}
`,
    mobile: `import { Text } from 'react-native';

// Os aventureiros precisam de crachás!
// O jogo vai usar o seu componente assim:
//   <Cracha nome="Lia" classe="arqueira" />
//   <Cracha nome="Tom" classe="mago" />
// Cada crachá precisa mostrar o nome e a classe de quem usa.

export function Cracha() {
  return <Text>Nome aqui</Text>;
}
`,
  },

  passos: [
    'Receba as duas props nos parênteses da função, entre chaves: `({ nome, classe })`.',
    'No JSX, troque o "Nome aqui" pelas props, cada uma entre chaves: `{nome}` e `{classe}`.',
    'Aperte **Rodar**. O jogo testa com a Lia, com o Tom e com uma aventureira surpresa.',
  ],

  livro: {
    titulo: 'Props: passando informações',
    resumo: 'Props são as informações que você entrega pro componente na hora de usar, como os argumentos de uma função.',
    ideia:
      'Um crachá em branco serve pra qualquer pessoa: o que muda é o que está escrito nele. Com componentes é igual. Você escreve o `Cracha` uma vez, e quem usa entrega o nome e a classe pelas **props**.\nNa hora de usar, elas parecem atributos do HTML: `<Cracha nome="Lia" />`.',
    exemplo: {
      codigo: {
        web: `// usando: <Saudacao nome="Lia" />

export function Saudacao({ nome }) {
  return <p>Olá, {nome}!</p>;
}`,
        mobile: `import { Text } from 'react-native';

// usando: <Saudacao nome="Lia" />

export function Saudacao({ nome }) {
  return <Text>Olá, {nome}!</Text>;
}`,
      },
      notas: [
        { marca: 'usando', texto: 'Quem usa o componente passa as props como atributos. Aqui, `nome` vale `"Lia"`.' },
        {
          marca: '({ nome })',
          texto:
            'As props chegam todas juntas, num objeto. As chaves `{ nome }` pegam uma prop pelo nome. Pra pegar duas, separe com vírgula: `({ nome, classe })`.',
        },
        {
          marca: '{nome}',
          texto: 'No JSX, as chaves querem dizer "aqui entra JavaScript". Aparece o **valor** da prop (Lia), e não a palavra nome.',
        },
      ],
    },
    extras: [
      {
        tipo: 'codigo',
        codigo: {
          web: `// também funciona, sem as chaves nos parênteses:
export function Saudacao(props) {
  return <p>Olá, {props.nome}!</p>;
}`,
          mobile: `// também funciona, sem as chaves nos parênteses:
export function Saudacao(props) {
  return <Text>Olá, {props.nome}!</Text>;
}`,
        },
        legenda: 'As duas formas fazem a mesma coisa. A com chaves é a mais usada.',
      },
    ],
    experimente: 'props',
    diferencas: {
      igual: 'Passar e receber props é igual nos dois modos. Só muda a tag que mostra o texto.',
      web: '`<p>{nome}</p>`',
      mobile: '`<Text>{nome}</Text>`',
    },
    cuidado:
      'Erro comum: esquecer as chaves nos parênteses, `function Cracha(nome, classe)`. Aí `nome` recebe o objeto inteiro das props, e o React reclama que não sabe mostrar um objeto na tela.',
    pratica:
      'Numa loja, um único `CartaoDeProduto` recebe nome, preço e foto pelas props e desenha todos os produtos da tela. Dá até pra ter valor padrão: `({ preco = 0 })` usa `0` quando ninguém passa o preço.',
  },

  dicas: [
    'O jogo entrega duas props: `nome` e `classe`. Primeiro receba as duas nos parênteses da função, usando chaves.',
    'A primeira linha da função fica `export function Cracha({ nome, classe }) {`. Agora use as duas dentro do JSX.',
    {
      web: 'Pra mostrar o valor de uma prop no JSX, coloque entre chaves. Por exemplo: `<p>{nome} ({classe})</p>`.',
      mobile: 'Pra mostrar o valor de uma prop no JSX, coloque entre chaves. Por exemplo: `<Text>{nome} ({classe})</Text>`.',
    },
  ],

  solucao: {
    web: `export function Cracha({ nome, classe }) {
  return <p>{nome} ({classe})</p>;
}`,
    mobile: `import { Text } from 'react-native';

export function Cracha({ nome, classe }) {
  return <Text>{nome} ({classe})</Text>;
}`,
  },

  aprendeu:
    'As props levam informações para dentro do componente, e as chaves `{ }` mostram o valor delas no JSX. Um componente só, vários aventureiros.',

  verificar(contexto) {
    for (let i = 0; i < CASOS.length; i++) {
      const problema = conferirCracha(contexto, CASOS[i], CASOS.slice(0, i));
      if (problema) return problema;
    }
    return ok('Os três crachás saíram certinhos, até o da Bia, que o jogo testou escondido.');
  },
};
