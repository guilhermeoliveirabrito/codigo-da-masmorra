import { flushSync } from 'react-dom';
import { criarRelogio, criarServidor } from '../motor/ambiente';
import {
  acharBotao,
  acharTextoSolto,
  criarEspiao,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  normalizar,
  ok,
  quase,
} from '../motor/testar';

// Os bugs que o goblin espalha. Cada um é de uma fase: só aparece depois que você passou dela.
// codigo: o componente quebrado; testar: confere o conserto (igual ao verificar das fases)

const esperar = (ms) => new Promise((pronto) => setTimeout(pronto, ms));

async function esperarAte(condicao, limite) {
  for (let passou = 0; passou < limite; passou += 15) {
    if (condicao()) return;
    await esperar(15);
  }
}

const evento = (modo) => (modo === 'web' ? 'onClick' : 'onPress');

// desenha escondido e já confere erro e texto solto; quem chama desmonta no fim
function abrir(elemento, { modo, traduzir }, opcoes) {
  const teste = desenharEscondido(elemento, opcoes?.espiao, opcoes);
  const texto = () => normalizar(teste.container.textContent);
  const bruto = () => teste.container.textContent.trim();
  let problema = null;
  if (teste.erro) problema = erro(traduzir(teste.erro));
  else if (modo === 'mobile') {
    const solto = acharTextoSolto(teste.container);
    if (solto) problema = quase(mensagemTextoSolto(solto));
  }
  return { teste, texto, bruto, problema };
}

// o conserto certo é a tela mostrar exatamente esse texto
function textoIgual(esperado, dica) {
  return ({ Componente, modo, traduzir }) => {
    const { teste, texto, bruto, problema } = abrir(<Componente />, { modo, traduzir });
    try {
      if (problema) return problema;
      if (texto() === normalizar(esperado)) return ok('Consertado!');
      return quase(dica(bruto()));
    } finally {
      teste.desmontar();
    }
  };
}

// alavanca: não pode disparar sozinha e dispara uma vez por clique
function testarAlavanca(dicaDoClique) {
  return ({ Componente, modo, traduzir }) => {
    const espiao = criarEspiao();
    const { teste, problema } = abrir(<Componente aoPuxar={espiao.fn} />, { modo, traduzir }, { espiao });
    try {
      if (problema) return problema;
      if (espiao.chamadasDesenhando > 0) {
        return quase(
          `A alavanca disparou sozinha, na hora de aparecer. Passe a função sem os parênteses: \`${evento(modo)}={aoPuxar}\`. Com parênteses ela roda na hora.`
        );
      }
      const botao = acharBotao(teste.container, modo);
      if (!botao) return quase('Cadê a alavanca? Precisa ter um botão pra puxar.');
      teste.clicar(botao);
      if (espiao.chamadas === 0) return quase(dicaDoClique(modo));
      if (espiao.chamadas > 1) return quase('Um clique só puxou a alavanca mais de uma vez.');
      return ok('Consertado!');
    } finally {
      teste.desmontar();
    }
  };
}

// tocha: começa apagada (Acender) e cada clique troca
function testarTocha(dicaDoComeco) {
  return ({ Componente, modo, traduzir }) => {
    const { teste, texto, problema } = abrir(<Componente />, { modo, traduzir });
    try {
      if (problema) return problema;
      if (!texto().includes('acender')) return quase(dicaDoComeco);
      const botao = acharBotao(teste.container, modo);
      if (!botao) return quase('Cadê o botão da tocha?');
      teste.clicar(botao);
      if (teste.erro) return erro(traduzir(teste.erro));
      if (!texto().includes('apagar')) {
        return quase('Clicar não acendeu a tocha. Quem muda o estado é a função do useState: `setAcesa(!acesa)`.');
      }
      teste.clicar(botao);
      if (!texto().includes('acender')) return quase('A tocha acendeu, mas não apagou no segundo clique.');
      return ok('Consertado!');
    } finally {
      teste.desmontar();
    }
  };
}

// portão: o texto muda conforme a prop temChave
function testarPortao(conferir) {
  return ({ Componente, modo, traduzir }) => {
    for (const temChave of [true, false]) {
      const { teste, texto, problema } = abrir(<Componente temChave={temChave} />, { modo, traduzir });
      try {
        if (problema) return problema;
        const dica = conferir(temChave, texto());
        if (dica) return quase(dica);
      } finally {
        teste.desmontar();
      }
    }
    return ok('Consertado!');
  };
}

const TABUAS = ['carvalho', 'pinho', 'cedro'];

export const BUGS = [
  {
    id: 'placa-letra',
    fase: 'placa',
    componente: 'Placa',
    arquivo: 'Placa.jsx',
    missao: 'A placa devia dizer "Bem-vindo à masmorra". O goblin mexeu numa letra.',
    codigo: {
      web: `export function Placa() {
  return <p>Bem-vindo à masmorrra</p>;
}
`,
      mobile: `import { Text } from 'react-native';

export function Placa() {
  return <Text>Bem-vindo à masmorrra</Text>;
}
`,
    },
    testar: textoIgual('Bem-vindo à masmorra', (bruto) => `A placa está dizendo "${bruto}". Compare letra por letra com "Bem-vindo à masmorra".`),
  },
  {
    id: 'placa-fecha',
    fase: 'placa',
    componente: 'Placa',
    arquivo: 'Placa.jsx',
    missao: 'A placa sumiu e o código nem roda. Tem uma tag que não fecha.',
    dica: {
      web: 'Toda tag que abre precisa fechar, com a barra: `<p>...</p>`.',
      mobile: 'Toda tag que abre precisa fechar, com a barra: `<Text>...</Text>`.',
    },
    codigo: {
      web: `export function Placa() {
  return <p>Bem-vindo à masmorra<p>;
}
`,
      mobile: `import { Text } from 'react-native';

export function Placa() {
  return <Text>Bem-vindo à masmorra<Text>;
}
`,
    },
    testar: textoIgual('Bem-vindo à masmorra', (bruto) => `A placa está dizendo "${bruto}", e devia ser "Bem-vindo à masmorra".`),
  },
  {
    id: 'placa-return',
    fase: 'placa',
    componente: 'Placa',
    arquivo: 'Placa.jsx',
    missao: 'O componente monta a placa, mas ela não aparece na tela.',
    codigo: {
      web: `export function Placa() {
  <p>Bem-vindo à masmorra</p>;
}
`,
      mobile: `import { Text } from 'react-native';

export function Placa() {
  <Text>Bem-vindo à masmorra</Text>;
}
`,
    },
    testar: textoIgual('Bem-vindo à masmorra', (bruto) =>
      bruto ? `A placa está dizendo "${bruto}".` : 'A tela continua vazia. O JSX está ali, mas a função não devolve ele: falta o `return`.'
    ),
  },
  {
    id: 'cracha-nome',
    fase: 'crachas',
    componente: 'Turma',
    arquivo: 'Turma.jsx',
    missao: 'Cada crachá devia mostrar um nome: Lia e Tom. Um deles saiu em branco.',
    codigo: {
      web: `function Cracha(props) {
  return <p>{props.nome}</p>;
}

export function Turma() {
  return (
    <div>
      <Cracha name="Lia" />
      <Cracha nome="Tom" />
    </div>
  );
}
`,
      mobile: `import { Text, View } from 'react-native';

function Cracha(props) {
  return <Text>{props.nome}</Text>;
}

export function Turma() {
  return (
    <View>
      <Cracha name="Lia" />
      <Cracha nome="Tom" />
    </View>
  );
}
`,
    },
    testar({ Componente, modo, traduzir }) {
      const { teste, texto, problema } = abrir(<Componente />, { modo, traduzir });
      try {
        if (problema) return problema;
        if (!texto().includes('lia')) {
          return quase('O crachá da Lia continua em branco. O Cracha lê `props.nome`, então a prop precisa se chamar `nome`.');
        }
        if (!texto().includes('tom')) return quase('Agora sumiu o nome do Tom.');
        return ok('Consertado!');
      } finally {
        teste.desmontar();
      }
    },
  },
  {
    id: 'cracha-chaves',
    fase: 'crachas',
    componente: 'Turma',
    arquivo: 'Turma.jsx',
    missao: 'O crachá devia mostrar "Nome: Lia", mas está escrevendo outra coisa.',
    codigo: {
      web: `function Cracha(props) {
  return <p>Nome: props.nome</p>;
}

export function Turma() {
  return <Cracha nome="Lia" />;
}
`,
      mobile: `import { Text } from 'react-native';

function Cracha(props) {
  return <Text>Nome: props.nome</Text>;
}

export function Turma() {
  return <Cracha nome="Lia" />;
}
`,
    },
    testar: textoIgual('Nome: Lia', (bruto) =>
      /props/.test(bruto)
        ? `O crachá está escrevendo "${bruto}" ao pé da letra. Pra usar a prop dentro do JSX, coloque entre chaves: \`{props.nome}\`.`
        : `O crachá mostra "${bruto}", e devia ser "Nome: Lia".`
    ),
  },
  {
    id: 'alavanca-parenteses',
    fase: 'alavanca',
    componente: 'Alavanca',
    arquivo: 'Alavanca.jsx',
    missao: 'A alavanca só devia disparar quando alguém clicasse nela. Agora ela dispara sozinha.',
    props: { aoPuxar: () => {} },
    codigo: {
      web: `export function Alavanca({ aoPuxar }) {
  return <button onClick={aoPuxar()}>Puxar</button>;
}
`,
      mobile: `import { Pressable, Text } from 'react-native';

export function Alavanca({ aoPuxar }) {
  return (
    <Pressable onPress={aoPuxar()}>
      <Text>Puxar</Text>
    </Pressable>
  );
}
`,
    },
    testar: testarAlavanca((modo) => `Clicar na alavanca não fez nada. Passe a função pro \`${evento(modo)}\`, sem parênteses.`),
  },
  {
    id: 'alavanca-nome',
    fase: 'alavanca',
    componente: 'Alavanca',
    arquivo: 'Alavanca.jsx',
    missao: 'Clicar na alavanca não faz nada. Parece certo, mas tem uma letra fora do lugar.',
    props: { aoPuxar: () => {} },
    codigo: {
      web: `export function Alavanca({ aoPuxar }) {
  return <button onclick={aoPuxar}>Puxar</button>;
}
`,
      mobile: `import { Pressable, Text } from 'react-native';

export function Alavanca({ aoPuxar }) {
  return (
    <Pressable onpress={aoPuxar}>
      <Text>Puxar</Text>
    </Pressable>
  );
}
`,
    },
    testar: testarAlavanca(
      (modo) => `O clique não chega na alavanca. No React, o nome do evento tem uma maiúscula no meio: \`${evento(modo)}\`.`
    ),
  },
  {
    id: 'tocha-const',
    fase: 'tocha',
    componente: 'Tocha',
    arquivo: 'Tocha.jsx',
    missao: 'A tocha devia acender e apagar a cada clique, mas o botão não funciona.',
    codigo: {
      web: `import { useState } from 'react';

export function Tocha() {
  const [acesa, setAcesa] = useState(false);

  return (
    <button onClick={() => { acesa = !acesa; }}>
      {acesa ? 'Apagar' : 'Acender'}
    </button>
  );
}
`,
      mobile: `import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export function Tocha() {
  const [acesa, setAcesa] = useState(false);

  return (
    <Pressable onPress={() => { acesa = !acesa; }}>
      <Text>{acesa ? 'Apagar' : 'Acender'}</Text>
    </Pressable>
  );
}
`,
    },
    testar: testarTocha('O botão devia começar mostrando Acender.'),
  },
  {
    id: 'tocha-comeca',
    fase: 'tocha',
    componente: 'Tocha',
    arquivo: 'Tocha.jsx',
    missao: 'A tocha devia começar apagada, com o botão mostrando Acender.',
    codigo: {
      web: `import { useState } from 'react';

export function Tocha() {
  const [acesa, setAcesa] = useState(true);

  return (
    <button onClick={() => setAcesa(!acesa)}>
      {acesa ? 'Apagar' : 'Acender'}
    </button>
  );
}
`,
      mobile: `import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export function Tocha() {
  const [acesa, setAcesa] = useState(true);

  return (
    <Pressable onPress={() => setAcesa(!acesa)}>
      <Text>{acesa ? 'Apagar' : 'Acender'}</Text>
    </Pressable>
  );
}
`,
    },
    testar: testarTocha('A tocha já começa acesa. O valor do começo é o que vai dentro do `useState(...)`.'),
  },
  {
    id: 'portao-troca',
    fase: 'portoes',
    componente: 'Portao',
    arquivo: 'Portao.jsx',
    missao: 'Quem tem a chave devia ver o portão Aberto. Quem não tem, Fechado.',
    props: { temChave: true },
    codigo: {
      web: `export function Portao({ temChave }) {
  return <p>{temChave ? 'Fechado' : 'Aberto'}</p>;
}
`,
      mobile: `import { Text } from 'react-native';

export function Portao({ temChave }) {
  return <Text>{temChave ? 'Fechado' : 'Aberto'}</Text>;
}
`,
    },
    testar: testarPortao((temChave, texto) => {
      const esperado = temChave ? 'aberto' : 'fechado';
      if (texto === esperado) return null;
      return `Com temChave ${temChave ? 'true' : 'false'}, o portão mostrou "${texto}". No \`?\`, o primeiro valor é o do true e o segundo, o do false.`;
    }),
  },
  {
    id: 'portao-passar',
    fase: 'portoes',
    componente: 'Portao',
    arquivo: 'Portao.jsx',
    missao: 'O "Pode passar" só devia aparecer pra quem tem a chave.',
    props: { temChave: true },
    codigo: {
      web: `export function Portao({ temChave }) {
  return (
    <div>
      <p>Portão de ferro</p>
      {!temChave && <p>Pode passar</p>}
    </div>
  );
}
`,
      mobile: `import { Text, View } from 'react-native';

export function Portao({ temChave }) {
  return (
    <View>
      <Text>Portão de ferro</Text>
      {!temChave && <Text>Pode passar</Text>}
    </View>
  );
}
`,
    },
    testar: testarPortao((temChave, texto) => {
      const aparece = texto.includes('pode passar');
      if (temChave && !aparece) return 'Quem tem a chave não viu o "Pode passar". Confira a condição antes do `&&`: o `!` inverte ela.';
      if (!temChave && aparece) return 'Quem não tem a chave está passando. O `&&` só mostra o que vem depois quando a condição é true.';
      if (!texto.includes('portao de ferro')) return 'O "Portão de ferro" sumiu. Ele aparece sempre.';
      return null;
    }),
  },
  {
    id: 'ponte-foreach',
    fase: 'ponte',
    componente: 'Ponte',
    arquivo: 'Ponte.jsx',
    missao: 'A ponte devia ter uma tábua pra cada item: carvalho, pinho e cedro. Não aparece nenhuma.',
    codigo: {
      web: `const TABUAS = ['carvalho', 'pinho', 'cedro'];

export function Ponte() {
  return (
    <ul>
      {TABUAS.forEach((tabua) => (
        <li key={tabua}>{tabua}</li>
      ))}
    </ul>
  );
}
`,
      mobile: `import { Text, View } from 'react-native';

const TABUAS = ['carvalho', 'pinho', 'cedro'];

export function Ponte() {
  return (
    <View>
      {TABUAS.forEach((tabua) => (
        <Text key={tabua}>{tabua}</Text>
      ))}
    </View>
  );
}
`,
    },
    testar({ Componente, modo, traduzir }) {
      const { teste, texto, problema } = abrir(<Componente />, { modo, traduzir });
      try {
        if (problema) return problema;
        const faltando = TABUAS.filter((tabua) => !texto().includes(tabua));
        if (faltando.length === TABUAS.length) {
          return quase('Nenhuma tábua apareceu. O `forEach` passa pelos itens, mas não devolve nada. Pra virar JSX, use o `map`.');
        }
        if (faltando.length) return quase(`Faltou a tábua de ${faltando.join(' e ')}.`);
        return ok('Consertado!');
      } finally {
        teste.desmontar();
      }
    },
  },
  {
    id: 'ponte-key',
    fase: 'ponte',
    componente: 'Ponte',
    arquivo: 'Ponte.jsx',
    missao: 'A ponte aparece, mas o React reclama. Cada tábua da lista precisa de uma coisa.',
    codigo: {
      web: `const TABUAS = ['carvalho', 'pinho', 'cedro'];

export function Ponte() {
  return (
    <ul>
      {TABUAS.map((tabua) => (
        <li>{tabua}</li>
      ))}
    </ul>
  );
}
`,
      mobile: `import { Text, View } from 'react-native';

const TABUAS = ['carvalho', 'pinho', 'cedro'];

export function Ponte() {
  return (
    <View>
      {TABUAS.map((tabua) => (
        <Text>{tabua}</Text>
      ))}
    </View>
  );
}
`,
    },
    testar({ Componente, modo, traduzir, avisos }) {
      const { teste, texto, problema } = abrir(<Componente />, { modo, traduzir });
      try {
        if (problema) return problema;
        if (TABUAS.some((tabua) => !texto().includes(tabua))) return quase('Alguma tábua sumiu. As três precisam aparecer.');
        if ([...avisos].some((aviso) => aviso.includes('key'))) {
          return { ...quase('Cada item criado no `map` precisa de uma `key` única. Aqui o próprio nome serve: `key={tabua}`.'), esconderAvisos: true };
        }
        return ok('Consertado!');
      } finally {
        teste.desmontar();
      }
    },
  },
  {
    id: 'rio-coluna',
    fase: 'rio',
    componente: 'Rio',
    arquivo: 'Rio.jsx',
    missao: 'As pedras deviam ficar lado a lado, em fila, pro Tom atravessar.',
    codigo: {
      web: `export function Rio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span>pedra</span>
      <span>pedra</span>
      <span>pedra</span>
    </div>
  );
}
`,
      mobile: `import { Text, View } from 'react-native';

export function Rio() {
  return (
    <View style={{ flexDirection: 'column', gap: 8 }}>
      <Text>pedra</Text>
      <Text>pedra</Text>
      <Text>pedra</Text>
    </View>
  );
}
`,
    },
    testar({ Componente, modo, traduzir }) {
      const { teste, problema } = abrir(<Componente />, { modo, traduzir }, { largura: 320 });
      try {
        if (problema) return problema;
        const pedras = [...(teste.container.firstElementChild?.children ?? [])];
        if (pedras.length !== 3) return quase('O rio precisa das três pedras.');
        const caixas = pedras.map((pedra) => pedra.getBoundingClientRect());
        const emFila = caixas.every((caixa, i) => i === 0 || (Math.abs(caixa.top - caixas[0].top) < 3 && caixa.left > caixas[i - 1].left));
        if (!emFila) {
          return quase("As pedras estão uma embaixo da outra. Pra ficarem lado a lado, a direção do flex é `'row'`.");
        }
        return ok('Consertado!');
      } finally {
        teste.desmontar();
      }
    },
  },
  {
    id: 'porta-limpeza',
    fase: 'porta',
    componente: 'Ampulheta',
    arquivo: 'Ampulheta.jsx',
    missao: 'A ampulheta continua batendo depois que sai da tela. Falta arrumar a bagunça no fim.',
    props: { tique: () => {} },
    codigo: {
      web: `import { useEffect } from 'react';

export function Ampulheta({ tique }) {
  useEffect(() => {
    setInterval(tique, 1000);
  }, []);

  return <p>Tic-tac...</p>;
}
`,
      mobile: `import { useEffect } from 'react';
import { Text } from 'react-native';

export function Ampulheta({ tique }) {
  useEffect(() => {
    setInterval(tique, 1000);
  }, []);

  return <Text>Tic-tac...</Text>;
}
`,
    },
    testar({ Componente, modo, traduzir, montar }) {
      const relogio = criarRelogio();
      let Ampulheta;
      try {
        Ampulheta = montar(relogio.ambiente) ?? Componente;
      } catch (e) {
        return erro(traduzir(e));
      }
      const tique = criarEspiao();
      const { teste, problema } = abrir(<Ampulheta tique={tique.fn} />, { modo, traduzir });
      const andar = (ms) => relogio.avancar(ms, (funcao) => flushSync(funcao));
      let desmontado = false;
      try {
        if (problema) return problema;
        andar(1000);
        if (relogio.erro) return erro(traduzir(relogio.erro));
        if (tique.chamadas === 0) return quase('A ampulheta parou de bater. O `setInterval(tique, 1000)` continua lá dentro do useEffect.');
        teste.desmontar();
        desmontado = true;
        const antes = tique.chamadas;
        andar(3000);
        if (tique.chamadas > antes) {
          return quase(
            'A ampulheta saiu da tela e continuou batendo. Guarde o id do intervalo e devolva a limpeza no efeito: `const id = setInterval(tique, 1000);` e `return () => clearInterval(id);`.'
          );
        }
        return ok('Consertado!');
      } finally {
        if (!desmontado) teste.desmontar();
      }
    },
  },
  {
    id: 'porta-dependencia',
    fase: 'porta',
    componente: 'Porta',
    arquivo: 'Porta.jsx',
    missao: 'A porta devia contar um rangido toda vez que abre. O contador não sai do zero.',
    codigo: {
      web: `import { useEffect, useState } from 'react';

export function Porta() {
  const [aberta, setAberta] = useState(false);
  const [rangidos, setRangidos] = useState(0);

  useEffect(() => {
    if (aberta) setRangidos((n) => n + 1);
  }, []);

  return (
    <button onClick={() => setAberta(!aberta)}>
      {aberta ? 'Fechar' : 'Abrir'} (rangeu {rangidos})
    </button>
  );
}
`,
      mobile: `import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

export function Porta() {
  const [aberta, setAberta] = useState(false);
  const [rangidos, setRangidos] = useState(0);

  useEffect(() => {
    if (aberta) setRangidos((n) => n + 1);
  }, []);

  return (
    <Pressable onPress={() => setAberta(!aberta)}>
      <Text>{aberta ? 'Fechar' : 'Abrir'} (rangeu {rangidos})</Text>
    </Pressable>
  );
}
`,
    },
    async testar({ Componente, modo, traduzir }) {
      const { teste, texto, problema } = abrir(<Componente />, { modo, traduzir });
      try {
        if (problema) return problema;
        const botao = () => acharBotao(teste.container, modo);
        if (!botao()) return quase('Cadê o botão da porta?');
        const rangeu = (vezes) => texto().includes(`rangeu ${vezes}`);
        for (const [vez, esperado] of [
          [1, 1],
          [2, 1],
          [3, 2],
        ]) {
          teste.clicar(botao());
          await esperarAte(() => teste.erro || rangeu(esperado), 300);
          if (teste.erro) return erro(traduzir(teste.erro));
          if (!rangeu(esperado)) {
            if (vez === 1) {
              return quase(
                'A porta abriu e o rangido não contou. Com `[]` no fim, o efeito roda uma vez só. Coloque nessa lista o que ele precisa vigiar: `[aberta]`.'
              );
            }
            return quase(`Depois de abrir, fechar e abrir de novo, o rangido devia estar em ${esperado}.`);
          }
        }
        return ok('Consertado!');
      } finally {
        teste.desmontar();
      }
    },
  },
  {
    id: 'mensageiro-json',
    fase: 'mensageiro',
    componente: 'Mapa',
    arquivo: 'Mapa.jsx',
    missao: 'O corvo trouxe o mapa, mas a tela quebra quando ele chega.',
    rotas: { '/api/salas': [{ nome: 'Cripta' }, { nome: 'Biblioteca' }] },
    codigo: {
      web: `import { useEffect, useState } from 'react';

export function Mapa() {
  const [salas, setSalas] = useState([]);

  useEffect(() => {
    fetch('/api/salas').then((resposta) => setSalas(resposta));
  }, []);

  return (
    <ul>
      {salas.map((sala) => (
        <li key={sala.nome}>{sala.nome}</li>
      ))}
    </ul>
  );
}
`,
      mobile: `import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export function Mapa() {
  const [salas, setSalas] = useState([]);

  useEffect(() => {
    fetch('/api/salas').then((resposta) => setSalas(resposta));
  }, []);

  return (
    <View>
      {salas.map((sala) => (
        <Text key={sala.nome}>{sala.nome}</Text>
      ))}
    </View>
  );
}
`,
    },
    async testar({ Componente, modo, traduzir, montar }) {
      const servidor = criarServidor({ '/api/salas': [{ nome: 'Cripta' }, { nome: 'Biblioteca' }] });
      let Mapa;
      try {
        Mapa = montar({ fetch: servidor.fetch }) ?? Componente;
      } catch (e) {
        return erro(traduzir(e));
      }
      const { teste, texto, problema } = abrir(<Mapa />, { modo, traduzir });
      try {
        if (problema) return problema;
        if (servidor.pedidos.length === 0) return quase("O corvo nem saiu: chame `fetch('/api/salas')` dentro do useEffect.");
        servidor.entregar();
        const chegou = () => texto().includes('cripta') && texto().includes('biblioteca');
        await esperarAte(() => teste.erro || chegou(), 600);
        if (teste.erro) {
          if (/map/.test(String(teste.erro.message))) {
            return quase(
              'Quando o mapa chegou, a tela quebrou no `salas.map`. A resposta do fetch vem embrulhada: abra antes de guardar, com `.then((resposta) => resposta.json())` e depois `.then((dados) => setSalas(dados))`.'
            );
          }
          return erro(traduzir(teste.erro));
        }
        if (!chegou()) return quase('O mapa chegou, mas as salas não apareceram na tela.');
        return ok('Consertado!');
      } finally {
        servidor.desligar();
        teste.desmontar();
      }
    },
  },
  {
    id: 'guardiao-igual',
    fase: 'guardiao',
    componente: 'Dragao',
    arquivo: 'Dragao.jsx',
    missao: 'Com a energia em 0, o dragão devia aparecer Dormindo. Com energia, Acordado.',
    props: { energia: 0 },
    codigo: {
      web: `export function Dragao({ energia }) {
  return <p>{energia = 0 ? 'Dormindo' : 'Acordado'}</p>;
}
`,
      mobile: `import { Text } from 'react-native';

export function Dragao({ energia }) {
  return <Text>{energia = 0 ? 'Dormindo' : 'Acordado'}</Text>;
}
`,
    },
    testar({ Componente, modo, traduzir }) {
      for (const [energia, esperado] of [
        [0, 'dormindo'],
        [5, 'acordado'],
      ]) {
        const { teste, texto, problema } = abrir(<Componente energia={energia} />, { modo, traduzir });
        try {
          if (problema) return problema;
          if (texto() !== esperado) {
            return quase(
              `Com energia ${energia}, o dragão apareceu "${texto()}". Um \`=\` sozinho guarda um valor; pra comparar, use \`===\` (ou \`<=\`).`
            );
          }
        } finally {
          teste.desmontar();
        }
      }
      return ok('Consertado!');
    },
  },
];
