import {
  acharPecas,
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaPortoes } from './CenaPortoes';

function conferirPortao({ Componente, modo, traduzir }, temChave) {
  const teste = desenharEscondido(<Componente temChave={temChave} />);
  try {
    if (teste.erro) return erro(traduzir(teste.erro));

    if (modo === 'mobile') {
      const solto = acharTextoSolto(teste.container);
      if (solto) return quase(mensagemTextoSolto(solto));
    }

    const aberta = acharPecas(teste.container, 'porta-aberta').length > 0;
    const fechada = acharPecas(teste.container, 'porta-fechada').length > 0;
    const chave = acharPecas(teste.container, 'chave').length > 0;

    if (!aberta && !fechada) {
      return quase('O portão sumiu. O componente precisa mostrar a `<PortaAberta />` ou a `<PortaFechada />`.');
    }
    if (aberta && fechada) {
      return quase('Apareceram as duas portas ao mesmo tempo. O `? :` escolhe uma só: `{temChave ? <PortaAberta /> : <PortaFechada />}`.');
    }

    if (temChave) {
      if (!aberta) {
        return quase('A Lia tem a chave, mas o portão dela continua fechado. Use a condição pra escolher a porta: `{temChave ? <PortaAberta /> : <PortaFechada />}`.');
      }
      if (!chave) return quase('A porta da Lia abriu! Falta mostrar a `<Chave />` pra quem tem chave: `{temChave && <Chave />}`.');
    } else {
      if (aberta) {
        return quase('O Tom não tem chave, mas o portão dele abriu. Quando `temChave` é `false`, a porta tem que ser a fechada.');
      }
      if (chave) {
        return quase('O Tom não tem chave, mas apareceu uma pra ele. Com `{temChave && <Chave />}`, a chave só aparece quando `temChave` é verdadeiro.');
      }
    }
    return null;
  } finally {
    teste.desmontar();
  }
}

export const fasePortoes = {
  id: 'portoes',
  numero: 5,
  titulo: 'Os portões',
  conceito: 'condicional',
  elenco: ['lia', 'tom'],
  componente: 'Portao',
  arquivo: 'Portao.jsx',
  Cena: CenaPortoes,
  atrasoDaVitoria: 2600,

  falas: [
    { quem: 'guarda', texto: 'Estes portões são encantados: só abrem pra quem tem a chave.' },
    { quem: 'guarda', texto: 'A Lia trouxe a dela. O Tom... esqueceu. Cada um tem que ver o portão certo.' },
  ],
  objetivo:
    'Faça o `Portao` mostrar a `PortaAberta` e a `Chave` quando `temChave` for verdadeiro, e só a `PortaFechada` quando for falso.',

  codigoInicial: {
    web: `import { PortaAberta, PortaFechada, Chave } from 'masmorra';

// O jogo usa o seu portão assim:
//   <Portao temChave={true} />   (a Lia tem a chave)
//   <Portao temChave={false} />  (o Tom esqueceu a dele)
// Quem tem chave vê a porta aberta e a chave.
// Quem não tem vê só a porta fechada.

export function Portao({ temChave }) {
  return (
    <div>
      <PortaFechada />
    </div>
  );
}
`,
    mobile: `import { View } from 'react-native';
import { PortaAberta, PortaFechada, Chave } from 'masmorra';

// O jogo usa o seu portão assim:
//   <Portao temChave={true} />   (a Lia tem a chave)
//   <Portao temChave={false} />  (o Tom esqueceu a dele)
// Quem tem chave vê a porta aberta e a chave.
// Quem não tem vê só a porta fechada.

export function Portao({ temChave }) {
  return (
    <View>
      <PortaFechada />
    </View>
  );
}
`,
  },

  passos: [
    'Troque a `<PortaFechada />` fixa por uma escolha com `? :`. Com chave, `<PortaAberta />`; sem chave, `<PortaFechada />`.',
    'Logo abaixo, mostre a `<Chave />` só pra quem tem chave. Pra isso serve o `&&`.',
    'Aperte **Rodar**. A Lia (com chave) e o Tom (sem chave) precisam ver portões diferentes.',
  ],

  livro: {
    titulo: 'Mostrando uma coisa ou outra',
    resumo:
      'Dentro das chaves do JSX dá pra escolher o que aparece: `condição ? A : B` mostra um ou outro, e `condição && A` mostra ou esconde.',
    ideia:
      'Muita tela muda conforme a situação: logado ou não, lista vazia ou cheia, porta aberta ou fechada. Em vez de criar um componente pra cada caso, você usa JavaScript dentro das chaves do JSX pra escolher o que aparece.\nIsso se chama **renderização condicional**.',
    exemplo: {
      codigo: {
        web: `export function Entrada({ logado }) {
  return (
    <div>
      {logado ? <p>Bem-vindo de volta!</p> : <button>Entrar</button>}
      {logado && <button>Sair</button>}
    </div>
  );
}`,
        mobile: `import { Pressable, Text, View } from 'react-native';

export function Entrada({ logado }) {
  return (
    <View>
      {logado ? <Text>Bem-vindo de volta!</Text> : <Text>Faça login</Text>}
      {logado && (
        <Pressable>
          <Text>Sair</Text>
        </Pressable>
      )}
    </View>
  );
}`,
      },
      notas: [
        {
          marca: ' ? ',
          texto:
            '**Um ou outro:** se `logado` for verdadeiro, aparece o que vem depois do `?`. Se for falso, aparece o que vem depois do `:`.',
        },
        { marca: '&&', texto: '**Mostrar ou esconder:** se `logado` for verdadeiro, aparece o botão de sair. Se for falso, não aparece nada.' },
      ],
    },
    extras: [
      {
        texto:
          'Também dá pra usar um `if` normal antes do `return`, pra devolver telas inteiras diferentes. Mas dentro das chaves do JSX só cabem expressões, e por isso existem o `? :` e o `&&`.',
      },
    ],
    experimente: 'condicional',
    diferencas: {
      igual: 'O `? :` e o `&&` são JavaScript puro, então funcionam igual nos dois modos.',
      web: 'As peças ficam dentro de uma `<div>`.',
      mobile: 'As peças ficam dentro de uma `<View>`.',
    },
    cuidado: {
      web: 'Cuidado com números no `&&`: `{quantidade && <p>...</p>}` mostra um `0` solto na tela quando a quantidade é zero. Prefira uma comparação: `{quantidade > 0 && ...}`.',
      mobile:
        'Cuidado com números no `&&`: `{quantidade && <Text>...</Text>}` deixa um `0` solto quando a quantidade é zero, e no React Native texto fora de `<Text>` fecha o app. Prefira uma comparação: `{quantidade > 0 && ...}`.',
    },
    pratica:
      'Tela de carregando ou lista pronta (`{carregando ? <Carregando /> : <Lista />}`), mensagem de erro que só aparece quando dá erro, botão de sair que só aparece pra quem entrou.',
  },

  dicas: [
    'A porta depende da chave. Troque a `<PortaFechada />` por um `? :` dentro de chaves: `{temChave ? ... : ...}`.',
    'Com chave, porta aberta; sem chave, porta fechada: `{temChave ? <PortaAberta /> : <PortaFechada />}`.',
    'Falta a chave, só pra quem tem. Logo abaixo da porta: `{temChave && <Chave />}`.',
  ],

  solucao: {
    web: `import { PortaAberta, PortaFechada, Chave } from 'masmorra';

export function Portao({ temChave }) {
  return (
    <div>
      {temChave ? <PortaAberta /> : <PortaFechada />}
      {temChave && <Chave />}
    </div>
  );
}`,
    mobile: `import { View } from 'react-native';
import { PortaAberta, PortaFechada, Chave } from 'masmorra';

export function Portao({ temChave }) {
  return (
    <View>
      {temChave ? <PortaAberta /> : <PortaFechada />}
      {temChave && <Chave />}
    </View>
  );
}`,
  },

  aprendeu:
    'Com `condição ? A : B` o componente escolhe entre duas coisas, e com `condição && A` ele mostra ou esconde uma. As duas ficam dentro das chaves do JSX.',

  verificar(contexto) {
    for (const temChave of [true, false]) {
      const problema = conferirPortao(contexto, temChave);
      if (problema) return problema;
    }
    return ok('Cada um viu o portão certo. A Lia pode entrar!');
  },
};
