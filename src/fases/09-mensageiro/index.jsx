import { criarServidor } from '../../motor/ambiente';
import {
  acharTextoSolto,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  normalizar,
  ok,
  quase,
} from '../../motor/testar';
import { CenaMensageiro } from './CenaMensageiro';

const SALAS = [
  { id: 1, nome: 'Cripta dos Ecos' },
  { id: 2, nome: 'Biblioteca Afogada' },
  { id: 3, nome: 'Covil do Guardião' },
];

// no teste o corvo traz outras salas, pra ninguém escrever os nomes na mão
const OUTRAS_SALAS = ['Ponte de Ossos', 'Salão dos Espelhos', 'Jardim de Cogumelos', 'Poço sem Fundo', 'Forja Apagada'];

function sortearSalas() {
  const nomes = [...OUTRAS_SALAS].sort(() => Math.random() - 0.5).slice(0, 3);
  return nomes.map((nome, i) => ({ id: 10 + i, nome }));
}

const esperar = (ms) => new Promise((pronto) => setTimeout(pronto, ms));

async function esperarAte(condicao, limite) {
  for (let passou = 0; passou < limite; passou += 15) {
    if (condicao()) return;
    await esperar(15);
  }
}

export const faseMensageiro = {
  id: 'mensageiro',
  numero: 9,
  titulo: 'O mensageiro',
  conceito: 'API',
  elenco: ['lia', 'tom'],
  componente: 'Mapa',
  arquivo: 'Mapa.jsx',
  Cena: CenaMensageiro,
  // o que o servidor da masmorra responde lá na cena
  rotas: { '/api/salas': SALAS },
  atrasoDaVitoria: 3400,

  falas: [
    { quem: 'tom', texto: 'Daqui pra frente nenhum mapa mostra o caminho. Só o castelo sabe onde ficam as salas.' },
    { quem: 'lia', texto: 'O corvo mensageiro vai lá buscar. Mas ele demora, então a gente avisa que está esperando.' },
    { quem: 'tom', texto: 'Quando ele voltar com a lista, é só escrever o nome de cada sala no pergaminho.' },
  ],
  objetivo:
    "Quando o `Mapa` aparecer, peça as salas em `'/api/salas'`. Enquanto a resposta não chega, mostre Carregando. Quando chegar, mostre o nome de cada sala.",

  codigoInicial: {
    web: `import { useEffect, useState } from 'react';

// O corvo busca as salas em '/api/salas'.
// A resposta é uma lista assim: [{ id: 1, nome: 'Cripta dos Ecos' }, ...]

export function Mapa() {
  const [salas, setSalas] = useState(null);

  // 1. Quando o Mapa aparecer, peça as salas com o fetch.

  // 2. Enquanto salas for null, mostre que está carregando.

  // 3. Depois, mostre o nome de cada sala.
  return <p>Sem mapa ainda.</p>;
}
`,
    mobile: `import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

// O corvo busca as salas em '/api/salas'.
// A resposta é uma lista assim: [{ id: 1, nome: 'Cripta dos Ecos' }, ...]

export function Mapa() {
  const [salas, setSalas] = useState(null);

  // 1. Quando o Mapa aparecer, peça as salas com o fetch.

  // 2. Enquanto salas for null, mostre que está carregando.

  // 3. Depois, mostre o nome de cada sala.
  return <Text>Sem mapa ainda.</Text>;
}
`,
  },

  passos: [
    "Num `useEffect` com `[]`, chame `fetch('/api/salas')`. Ele não devolve as salas na hora: devolve uma promessa.",
    'Encadeie `.then((resposta) => resposta.json())` pra ler a resposta, e outro `.then` que guarda os dados com `setSalas`.',
    'Antes do `return` principal, se `salas` ainda for `null`, devolva um texto de Carregando.',
    'No `return` principal, use o `map` pra mostrar o nome de cada sala, com a `key`.',
    'Aperte **Rodar** e veja o corvo voar.',
  ],

  livro: {
    titulo: 'Buscando dados de uma API',
    resumo:
      'Uma API é um endereço que responde com dados. Com o `fetch` dentro de um `useEffect`, o componente pede os dados quando aparece e guarda a resposta no estado.',
    ideia:
      'Os dados de um app quase nunca moram no código: eles vêm de um servidor, por uma **API**, que é um endereço que devolve dados.\nPedir é como mandar um corvo: ele leva o pedido e volta depois com a resposta. Enquanto ele não volta, a tela avisa que está carregando.',
    exemplo: {
      codigo: {
        web: `export function Tarefas() {
  const [tarefas, setTarefas] = useState(null);

  useEffect(() => {
    fetch('/api/tarefas')
      .then((resposta) => resposta.json())
      .then((dados) => setTarefas(dados));
  }, []);

  if (tarefas === null) return <p>Carregando...</p>;

  return <p>Você tem {tarefas.length} tarefas.</p>;
}`,
        mobile: `export function Tarefas() {
  const [tarefas, setTarefas] = useState(null);

  useEffect(() => {
    fetch('/api/tarefas')
      .then((resposta) => resposta.json())
      .then((dados) => setTarefas(dados));
  }, []);

  if (tarefas === null) return <Text>Carregando...</Text>;

  return <Text>Você tem {tarefas.length} tarefas.</Text>;
}`,
      },
      notas: [
        { marca: 'useState(null)', texto: 'O estado começa em `null`: ainda não chegou nada. É assim que a tela sabe que está esperando.' },
        { marca: 'fetch(', texto: 'O `fetch` faz o pedido e devolve uma **promessa**: uma resposta que vai chegar depois.' },
        {
          marca: 'resposta.json()',
          texto: 'A resposta chega como texto. O `.json()` transforma em dados de JavaScript. Ele também demora, por isso vem outro `.then`.',
        },
        { marca: 'setTarefas(dados)', texto: 'Quando os dados chegam, eles vão pro estado, e o React desenha de novo.' },
        { marca: 'tarefas === null', texto: 'Enquanto o estado for `null`, a tela mostra que está carregando.' },
      ],
    },
    extras: [
      {
        tipo: 'codigo',
        codigo: `// o mesmo pedido, com async e await
useEffect(() => {
  async function buscar() {
    const resposta = await fetch('/api/tarefas');
    const dados = await resposta.json();
    setTarefas(dados);
  }
  buscar();
}, []);`,
        legenda:
          'O `await` espera a promessa cumprir. A função async fica dentro do efeito, porque o `useEffect` não aceita receber uma função async direto.',
      },
    ],
    experimente: 'api',
    diferencas: {
      igual: 'O `fetch` e as promessas são JavaScript, então funcionam igual nos dois modos.',
      web: 'No navegador, um site só consegue buscar dados de outro endereço se o servidor deixar. Esse controle se chama CORS.',
      mobile: 'No celular não tem CORS, mas o app precisa de internet e o endereço precisa ser https.',
    },
    cuidado:
      'Nunca chame o `fetch` solto no corpo do componente: cada resposta muda o estado, o que desenha de novo, que chama o fetch de novo... um pedido atrás do outro, sem parar. O lugar dele é dentro do `useEffect` com `[]`.',
    pratica:
      'Feed de rede social, previsão do tempo, vitrine de loja: quase toda tela de app busca dados de uma API quando abre, mostra um carregando e depois a lista.',
  },

  dicas: [
    'O `fetch` não devolve os dados na hora: ele devolve uma **promessa**. O `.then(...)` diz o que fazer quando ela cumprir. Tudo isso fica dentro de `useEffect(() => { ... }, []);`.',
    "São dois passos: `.then((resposta) => resposta.json())` lê a resposta, e `.then((dados) => setSalas(dados))` guarda no estado. Começa com `fetch('/api/salas')`.",
    {
      web: 'Pro carregando: `if (salas === null) return <p>Carregando...</p>;`. Depois, no return com a lista: `{salas.map((sala) => <li key={sala.id}>{sala.nome}</li>)}` dentro de um `<ul>`.',
      mobile:
        'Pro carregando: `if (salas === null) return <Text>Carregando...</Text>;`. Depois, no return com a lista: `{salas.map((sala) => <Text key={sala.id}>{sala.nome}</Text>)}` dentro de uma `<View>`.',
    },
  ],

  solucao: {
    web: `import { useEffect, useState } from 'react';

export function Mapa() {
  const [salas, setSalas] = useState(null);

  useEffect(() => {
    fetch('/api/salas')
      .then((resposta) => resposta.json())
      .then((dados) => setSalas(dados));
  }, []);

  if (salas === null) {
    return <p>Carregando...</p>;
  }

  return (
    <ul>
      {salas.map((sala) => (
        <li key={sala.id}>{sala.nome}</li>
      ))}
    </ul>
  );
}`,
    mobile: `import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export function Mapa() {
  const [salas, setSalas] = useState(null);

  useEffect(() => {
    fetch('/api/salas')
      .then((resposta) => resposta.json())
      .then((dados) => setSalas(dados));
  }, []);

  if (salas === null) {
    return <Text>Carregando...</Text>;
  }

  return (
    <View>
      {salas.map((sala) => (
        <Text key={sala.id}>{sala.nome}</Text>
      ))}
    </View>
  );
}`,
  },

  aprendeu:
    'Dados de fora chegam por uma API. O `fetch` fica dentro de um `useEffect` com `[]`, a resposta vai pro estado e, enquanto ela não chega, a tela mostra um carregando.',

  // O teste usa um servidor de mentira: a resposta só chega quando o teste manda.
  async verificar({ Componente, modo, traduzir, avisos, codigo, montar }) {
    if (/useEffect\s*\(\s*async/.test(codigo)) {
      return quase(
        'O `useEffect` não aceita uma função async direto. Crie a função async lá dentro e chame em seguida: `async function buscar() { ... }` e depois `buscar();`.'
      );
    }

    const salas = sortearSalas();
    const servidor = criarServidor({ '/api/salas': salas });
    let Mapa;
    try {
      Mapa = montar({ fetch: servidor.fetch }) ?? Componente;
    } catch (e) {
      return erro(traduzir(e));
    }

    const teste = desenharEscondido(<Mapa />);
    const texto = () => normalizar(teste.container.textContent);
    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      if (servidor.pedidos.length === 0) {
        return quase(
          "O corvo nem saiu da janela: o `fetch` não foi chamado. Chame `fetch('/api/salas')` dentro de um `useEffect` com `[]`."
        );
      }
      if (!texto().includes('carregando')) {
        return quase(
          'Enquanto o corvo não volta, a tela precisa avisar que está esperando. Quando `salas` ainda for `null`, mostre Carregando...'
        );
      }

      servidor.entregar();
      const nomes = salas.map((sala) => normalizar(sala.nome));
      await esperarAte(() => teste.erro || nomes.every((nome) => texto().includes(nome)) || servidor.pedidos.length > 3, 800);
      if (teste.erro) return erro(traduzir(teste.erro));

      const endereco = servidor.pedidos[0];
      if (endereco !== '/api/salas') {
        return quase(`O corvo foi buscar em '${endereco}', mas o mapa fica em '/api/salas'.`);
      }

      const faltando = salas.filter((sala) => !texto().includes(normalizar(sala.nome)));
      if (faltando.length === salas.length) {
        if (texto().includes('carregando')) {
          return quase(
            'O mapa chegou, mas a tela ficou em Carregando. Depois do `.then((resposta) => resposta.json())`, guarde os dados com `.then((dados) => setSalas(dados))`.'
          );
        }
        return quase('O mapa chegou, mas os nomes das salas não apareceram. Use o `map` pra mostrar o `nome` de cada sala.');
      }
      if (faltando.length) {
        return quase(`Faltou aparecer: ${faltando.map((sala) => sala.nome).join(', ')}. Mostre todas as salas da lista com o \`map\`.`);
      }
      if (texto().includes('carregando')) {
        return quase('As salas apareceram, mas o Carregando continuou na tela. Ele só deve aparecer enquanto `salas` for `null`.');
      }

      // se o fetch estiver fora do useEffect (ou sem o []), ele pede de novo a cada desenho
      await esperar(60);
      if (servidor.pedidos.length > 1) {
        return quase(
          `O corvo voou ${servidor.pedidos.length} vezes. O \`fetch\` precisa ficar dentro de um \`useEffect\` com \`[]\`, pra pedir uma vez só.`
        );
      }

      const avisoDeKey = [...avisos].find((aviso) => aviso.includes('key'));
      if (avisoDeKey) return quase(avisoDeKey);

      return ok('O corvo trouxe o mapa e cada sala apareceu no pergaminho. Olha ele voando lá na cena!');
    } finally {
      teste.desmontar();
      servidor.desligar();
    }
  },
};
