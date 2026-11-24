import {
  acharTextoSolto,
  criarEspiao,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaAlavanca } from './CenaAlavanca';

export const faseAlavanca = {
  id: 'alavanca',
  numero: 3,
  titulo: 'A alavanca',
  componente: 'Alavanca',
  arquivo: 'Alavanca.jsx',
  Cena: CenaAlavanca,

  falas: [
    { quem: 'lia', texto: 'A porta do corredor está trancada! Tem um encaixe de alavanca na parede, mas está vazio.' },
    { quem: 'lia', texto: 'Dizem que quem constrói a alavanca recebe a função abrirPorta. Me ajuda?' },
  ],
  objetivo: {
    web: 'Faça a `Alavanca` chamar a função `abrirPorta` quando alguém clicar nela.',
    mobile: 'Faça a `Alavanca` chamar a função `abrirPorta` quando alguém tocar nela.',
  },

  codigoInicial: {
    web: `// A porta do corredor está trancada!
// O jogo vai usar a sua alavanca assim:
//   <Alavanca abrirPorta={abrirPorta} />
// abrirPorta é uma função: quando ela roda, a porta abre.

export function Alavanca({ abrirPorta }) {
  return <p>Puxar alavanca</p>;
}
`,
    mobile: `import { Text } from 'react-native';

// A porta do corredor está trancada!
// O jogo vai usar a sua alavanca assim:
//   <Alavanca abrirPorta={abrirPorta} />
// abrirPorta é uma função: quando ela roda, a porta abre.

export function Alavanca({ abrirPorta }) {
  return <Text>Puxar alavanca</Text>;
}
`,
  },

  livro: {
    titulo: 'Eventos: fazendo algo acontecer',
    blocos: [
      {
        texto:
          'Props não servem só para textos. Você também pode passar uma **função**. Aqui o jogo te entrega a função `abrirPorta`: quando ela roda, a porta abre. O seu trabalho é fazer ela rodar na hora certa, quando alguém usar a alavanca.',
      },
      {
        texto: {
          web: 'No navegador, o elemento clicável é o `<button>`, e o evento de clique se chama `onClick`. Você entrega a função pra ele entre chaves.',
          mobile:
            'No celular, o que recebe toque é o `<Pressable>`, e o evento de toque se chama `onPress`. O `Pressable` não mostra nada sozinho: o texto vai num `<Text>` dentro dele. E ele também precisa entrar no import.',
        },
      },
      {
        tipo: 'codigo',
        codigo: {
          web: `export function Sino({ tocar }) {
  return <button onClick={tocar}>Tocar o sino</button>;
}`,
          mobile: `import { Pressable, Text } from 'react-native';

export function Sino({ tocar }) {
  return (
    <Pressable onPress={tocar}>
      <Text>Tocar o sino</Text>
    </Pressable>
  );
}`,
        },
        legenda: 'O sino recebe a função tocar como prop e liga ela ao evento.',
      },
      {
        tipo: 'alerta',
        texto: {
          web: '**Sem parênteses!** `onClick={tocar}` entrega a função para o botão chamar *quando* alguém clicar. Já `onClick={tocar()}` chama a função *na hora*, enquanto a tela ainda está sendo desenhada. É a diferença entre entregar o controle remoto e já sair apertando o botão.',
          mobile:
            '**Sem parênteses!** `onPress={tocar}` entrega a função para o Pressable chamar *quando* alguém tocar. Já `onPress={tocar()}` chama a função *na hora*, enquanto a tela ainda está sendo desenhada. É a diferença entre entregar o controle remoto e já sair apertando o botão.',
        },
      },
      {
        tipo: 'codigo',
        codigo: {
          web: `// Precisa passar alguma informação? Use uma arrow function:
<button onClick={() => tocar('forte')}>Tocar forte</button>`,
          mobile: `// Precisa passar alguma informação? Use uma arrow function:
<Pressable onPress={() => tocar('forte')}>
  <Text>Tocar forte</Text>
</Pressable>`,
        },
        legenda: 'A arrow function () => ... só roda quando o evento acontece.',
      },
      {
        tipo: 'projeto',
        texto: {
          web: 'No MeuCine, a `Pagination.jsx` usa `onClick={() => onChange(page + 1)}`: a arrow function deixa passar o número da próxima página, e só roda no clique.',
          mobile:
            'No Mentor, o `Button.tsx` recebe `onPress` como prop e repassa para o `Pressable`: `onPress={onPress}`. É exatamente o que a alavanca faz com o `abrirPorta`.',
        },
      },
    ],
  },

  dicas: [
    {
      web: 'Um `<p>` não é clicável. No navegador, o elemento que a gente clica é o `<button>`. Troque a tag.',
      mobile: 'Um `<Text>` sozinho não recebe toque. Envolva ele com um `<Pressable>`, e não esqueça de colocar o `Pressable` no import.',
    },
    {
      web: 'A função `abrirPorta` já chega pronta nas props. O evento de clique do `<button>` se chama `onClick`, e ele recebe a função entre chaves.',
      mobile: "O import fica `import { Pressable, Text } from 'react-native';`. O evento de toque do Pressable se chama `onPress`, e ele recebe a função entre chaves.",
    },
    {
      web: '`<button onClick={abrirPorta}>Puxar alavanca</button>`. Sem parênteses depois do abrirPorta!',
      mobile: '`<Pressable onPress={abrirPorta}>`, com o `<Text>` que já existe dentro dele, e depois `</Pressable>` para fechar. Sem parênteses depois do abrirPorta!',
    },
  ],

  solucao: {
    web: `export function Alavanca({ abrirPorta }) {
  return <button onClick={abrirPorta}>Puxar alavanca</button>;
}`,
    mobile: `import { Pressable, Text } from 'react-native';

export function Alavanca({ abrirPorta }) {
  return (
    <Pressable onPress={abrirPorta}>
      <Text>Puxar alavanca</Text>
    </Pressable>
  );
}`,
  },

  aprendeu: {
    web: 'Funções também viajam como props. `onClick={funcao}` entrega a função para o botão, e ela só roda no clique. Com parênteses, ela rodaria na hora.',
    mobile: 'Funções também viajam como props. `onPress={funcao}` entrega a função para o Pressable, e ela só roda no toque. Com parênteses, ela rodaria na hora.',
  },

  verificar({ Componente, modo, traduzir, avisos }) {
    const evento = modo === 'web' ? 'onClick' : 'onPress';
    const espiao = criarEspiao();
    const teste = desenharEscondido(<Componente abrirPorta={espiao.fn} />, espiao);

    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (espiao.chamadasDesenhando > 0) {
        return quase(`A porta abriu sozinha, antes de alguém usar a alavanca! Isso acontece com \`abrirPorta()\`, com parênteses: a função roda na hora de desenhar a tela. Passe a função sem parênteses: \`${evento}={abrirPorta}\`.`);
      }

      if (!teste.container.textContent.trim() && !teste.container.firstElementChild) {
        return quase('O encaixe da alavanca está vazio. O componente precisa devolver alguma coisa no `return`.');
      }

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      const alvo = teste.container.querySelector(modo === 'web' ? 'button' : '[data-rn="Pressable"]');
      if (!alvo) {
        return quase(
          modo === 'web'
            ? 'A alavanca aparece, mas não tem onde clicar. No navegador, o elemento clicável é o `<button>`.'
            : 'A alavanca aparece, mas não tem onde tocar. Um `<Text>` sozinho não recebe toque: envolva ele com um `<Pressable>`, que também precisa entrar no import.'
        );
      }

      teste.clicar(alvo);
      if (espiao.chamadas === 0) {
        const avisoDoEvento = [...avisos].find((aviso) => aviso.includes('evento'));
        return quase(
          avisoDoEvento ??
            `A alavanca existe, mas não faz nada quando é ${modo === 'web' ? 'clicada' : 'tocada'}. Falta ligar a função no evento: \`${evento}={abrirPorta}\`.`
        );
      }

      return ok(`A alavanca funciona! Agora ${modo === 'web' ? 'clique' : 'toque'} nela lá na cena para abrir a porta.`, {
        esperarInteracao: true,
      });
    } finally {
      teste.desmontar();
    }
  },
};
