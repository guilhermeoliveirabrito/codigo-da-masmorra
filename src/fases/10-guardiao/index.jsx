import { acharTextoSolto, desenharEscondido, erro, mensagemTextoSolto, normalizar, ok, quase } from '../../motor/testar';
import { CenaGuardiao } from './CenaGuardiao';

const LARGURA_DO_TESTE = 440;
const FOLGA = 3;

// dois times de teste: um igual ao da cena e outro com nomes e forças diferentes,
// pra pegar quem escreveu os nomes na mão ou comparou com === 0
const TIME_A = [
  { id: 'lia', nome: 'Lia', forca: 2 },
  { id: 'tom', nome: 'Tom', forca: 3 },
  { id: 'guarda', nome: 'Guarda', forca: 1 },
];
const TIME_B = [
  { id: 'bia', nome: 'Bia', forca: 5 },
  { id: 'caio', nome: 'Caio', forca: 4 },
];

const mostraNumero = (texto, n) => new RegExp(`(^|[^0-9-])${n}([^0-9]|$)`).test(texto);
const dormiu = (texto) => normalizar(texto).includes('guardiao dormiu');

function acharBotoes(container, modo) {
  return [...container.querySelectorAll(modo === 'web' ? 'button' : '[data-rn="Pressable"]')];
}

export const faseGuardiao = {
  id: 'guardiao',
  numero: 10,
  titulo: 'O guardião',
  conceito: 'tudo junto',
  elenco: ['lia', 'tom', 'guarda'],
  componente: 'Batalha',
  arquivo: 'Batalha.jsx',
  Cena: CenaGuardiao,

  falas: [
    { quem: 'guarda', texto: 'Vim junto porque essa parte eu não perco. Ali dorme o Guardião, o dragão mais velho da masmorra.' },
    { quem: 'lia', texto: 'Dorme? Então a gente passa de fininho.' },
    { quem: 'guarda', texto: 'Dormia. Acordou com o barulho do corvo. Agora só cansando ele pra dormir de novo.' },
    { quem: 'tom', texto: 'Precisamos de um painel de batalha: a energia dele e um botão pra cada um atacar com a sua força.' },
  ],
  objetivo:
    'Monte a `Batalha`: mostre a energia do Guardião e um botão pra cada herói, lado a lado. Cada golpe tira a força do herói da energia. Quando ela chegar a zero, mostre O Guardião dormiu!',

  codigoInicial: {
    web: `import { useState } from 'react';

// herois: [{ id: 'lia', nome: 'Lia', forca: 3 }, ...]
// energia: a energia do Guardião no começo da luta
// aoAtacar: chame com o herói que atacou, pra cena mostrar o golpe

export function Batalha({ herois, energia, aoAtacar }) {
  return (
    <div>
      <p>Energia do Guardião: ?</p>
    </div>
  );
}
`,
    mobile: `import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// herois: [{ id: 'lia', nome: 'Lia', forca: 3 }, ...]
// energia: a energia do Guardião no começo da luta
// aoAtacar: chame com o herói que atacou, pra cena mostrar o golpe

export function Batalha({ herois, energia, aoAtacar }) {
  return (
    <View>
      <Text>Energia do Guardião: ?</Text>
    </View>
  );
}
`,
  },

  passos: {
    web: [
      'Guarde a energia num estado que começa com a prop: `const [restante, setRestante] = useState(energia);`.',
      'Mostre a energia no lugar do `?`.',
      "Faça um `<button>` pra cada herói com o `map` (com `key` e o nome dele), todos dentro de uma `<div>` com `display: 'flex'`.",
      'No clique, tire a `forca` do herói da energia e chame `aoAtacar(heroi)`.',
      'Quando a energia chegar a zero ou menos, mostre só o texto O Guardião dormiu!',
      'Aperte **Rodar** e depois lute de verdade, clicando nos heróis lá na cena.',
    ],
    mobile: [
      'Guarde a energia num estado que começa com a prop: `const [restante, setRestante] = useState(energia);`.',
      'Mostre a energia no lugar do `?`.',
      "Faça um `<Pressable>` pra cada herói com o `map` (com `key` e o nome dele num `<Text>`), todos dentro de uma `<View>` com `flexDirection: 'row'`.",
      'No toque, tire a `forca` do herói da energia e chame `aoAtacar(heroi)`.',
      'Quando a energia chegar a zero ou menos, mostre só o texto O Guardião dormiu!',
      'Aperte **Rodar** e depois lute de verdade, tocando nos heróis lá na cena.',
    ],
  },

  livro: {
    titulo: 'Juntando tudo',
    resumo:
      'Uma tela de verdade junta tudo que você viu: props trazem os dados, o estado guarda o que muda, o map faz a lista, o evento reage ao clique, a condição escolhe o que aparece e o flexbox arruma.',
    ideia:
      'Nenhum conceito vive sozinho. O painel de batalha recebe os heróis pelas **props**, lembra a energia no **estado**, desenha um botão por herói com o **map**, muda a energia no **evento** de clique, troca a tela inteira com uma **condição** e põe os botões lado a lado com **flexbox**.\nNa hora de montar, vá por partes e aperte Rodar a cada passo: o jogo diz o que falta.',
    exemplo: {
      codigo: {
        web: `export function Placar({ jogadores, meta }) {
  const [pontos, setPontos] = useState(0);

  if (pontos >= meta) return <p>Vitória!</p>;

  return (
    <div>
      <p>Pontos: {pontos}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {jogadores.map((jogador) => (
          <button key={jogador.id} onClick={() => setPontos(pontos + jogador.valor)}>
            {jogador.nome}
          </button>
        ))}
      </div>
    </div>
  );
}`,
        mobile: `export function Placar({ jogadores, meta }) {
  const [pontos, setPontos] = useState(0);

  if (pontos >= meta) return <Text>Vitória!</Text>;

  return (
    <View>
      <Text>Pontos: {pontos}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {jogadores.map((jogador) => (
          <Pressable key={jogador.id} onPress={() => setPontos(pontos + jogador.valor)}>
            <Text>{jogador.nome}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}`,
      },
      notas: [
        { marca: '({ jogadores, meta })', texto: '**Props:** os dados chegam de fora. O componente não sabe quem são os jogadores até alguém passar.' },
        { marca: 'useState(0)', texto: '**Estado:** os pontos mudam durante o jogo, então moram num estado.' },
        { marca: 'pontos >= meta', texto: '**Condição:** chegou na meta, a tela inteira vira outra. O `>=` pega também quando passa da meta.' },
        { marca: "style={{", texto: '**Flexbox:** os botões ficam lado a lado, com um espaço entre eles.' },
        { marca: '.map(', texto: '**Lista:** um botão pra cada jogador, cada um com a sua `key`.' },
        { marca: 'setPontos(pontos +', texto: '**Evento:** o clique muda o estado, e o React desenha de novo com os pontos novos.' },
      ],
    },
    experimente: 'treino',
    diferencas: {
      igual: 'A lógica é a mesma nos dois modos: estado, map, condição e eventos são React e JavaScript.',
      web: "Botões são `<button onClick>`, e a fila precisa de `display: 'flex'`.",
      mobile: "Botões são `<Pressable onPress>` com `<Text>` dentro, e a fila precisa de `flexDirection: 'row'`.",
    },
    cuidado:
      'Compare com `<= 0` e não com `=== 0`: um golpe forte pode passar do zero e deixar a energia negativa. Com `===`, a luta nunca acabaria.',
    pratica:
      'Carrinho de compras, placar de jogo, lista de tarefas com contador: quase toda tela juntando dados, cliques e listas é feita desse jeito, um pedaço de cada vez.',
  },

  dicas: [
    {
      web: 'Comece pela lista: `{herois.map((heroi) => <button key={heroi.id}>{heroi.nome}</button>)}`, dentro de uma `<div style={{ display: \'flex\' }}>`.',
      mobile:
        "Comece pela lista: `{herois.map((heroi) => <Pressable key={heroi.id}><Text>{heroi.nome}</Text></Pressable>)}`, dentro de uma `<View style={{ flexDirection: 'row' }}>`.",
    },
    {
      web: 'Crie a função `atacar(heroi)`, que faz `setRestante(restante - heroi.forca)` e chama `aoAtacar(heroi)`. No botão: `onClick={() => atacar(heroi)}`.',
      mobile:
        'Crie a função `atacar(heroi)`, que faz `setRestante(restante - heroi.forca)` e chama `aoAtacar(heroi)`. No Pressable: `onPress={() => atacar(heroi)}`.',
    },
    {
      web: 'Antes do return com os botões: `if (restante <= 0) return <p>O Guardião dormiu!</p>;`.',
      mobile: 'Antes do return com os botões: `if (restante <= 0) return <Text>O Guardião dormiu!</Text>;`.',
    },
  ],

  solucao: {
    web: `import { useState } from 'react';

export function Batalha({ herois, energia, aoAtacar }) {
  const [restante, setRestante] = useState(energia);

  function atacar(heroi) {
    setRestante(restante - heroi.forca);
    aoAtacar(heroi);
  }

  if (restante <= 0) {
    return <p>O Guardião dormiu!</p>;
  }

  return (
    <div>
      <p>Energia do Guardião: {restante}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {herois.map((heroi) => (
          <button key={heroi.id} onClick={() => atacar(heroi)}>
            {heroi.nome}
          </button>
        ))}
      </div>
    </div>
  );
}`,
    mobile: `import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function Batalha({ herois, energia, aoAtacar }) {
  const [restante, setRestante] = useState(energia);

  function atacar(heroi) {
    setRestante(restante - heroi.forca);
    aoAtacar(heroi);
  }

  if (restante <= 0) {
    return <Text>O Guardião dormiu!</Text>;
  }

  return (
    <View>
      <Text>Energia do Guardião: {restante}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {herois.map((heroi) => (
          <Pressable key={heroi.id} onPress={() => atacar(heroi)}>
            <Text>{heroi.nome}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}`,
  },

  aprendeu:
    'Você juntou tudo: props com os dados, estado pra energia, map pros botões, evento no clique, condição pro fim da luta e flexbox pra arrumar. É assim que se monta uma tela de verdade, um pedaço de cada vez.',

  verificar({ Componente, modo, traduzir, avisos }) {
    const clique = modo === 'web' ? 'clique' : 'toque';
    const ataques = [];
    const aoAtacar = (heroi) => ataques.push(heroi);

    function lutar(herois, energia) {
      return desenharEscondido(<Componente herois={herois} energia={energia} aoAtacar={aoAtacar} />, null, {
        largura: LARGURA_DO_TESTE,
      });
    }
    const botaoDe = (teste, nome) =>
      acharBotoes(teste.container, modo).find((botao) => normalizar(botao.textContent).includes(normalizar(nome)));

    let teste = lutar(TIME_A, 6);
    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      if (!mostraNumero(teste.container.textContent, 6)) {
        return quase(
          'A energia do Guardião não aparece na tela. Ela começa com o valor da prop `energia`: guarde num estado e mostre no lugar do `?`.'
        );
      }

      const botoes = acharBotoes(teste.container, modo);
      if (botoes.length === 0) {
        return quase(
          `Não achei os botões dos heróis. Use o \`map\` nos \`herois\` pra criar um ${modo === 'web' ? '`<button>`' : '`<Pressable>`'} pra cada um, com o nome dele.`
        );
      }
      if (botoes.length !== TIME_A.length) {
        return quase(`Apareceram ${botoes.length} botões, mas o time tem ${TIME_A.length} heróis. Faça um botão por herói com o \`map\`.`);
      }
      const semNome = TIME_A.find((heroi) => !botaoDe(teste, heroi.nome));
      if (semNome) return quase(`O botão de ${semNome.nome} não mostra o nome dele. Escreva \`{heroi.nome}\` dentro do botão.`);

      const avisoDeKey = [...avisos].find((aviso) => aviso.includes('key'));
      if (avisoDeKey) return quase(avisoDeKey);

      const caixas = botoes.map((botao) => botao.getBoundingClientRect());
      const emFila = caixas.every((caixa, i) => Math.abs(caixa.top - caixas[0].top) < FOLGA && (i === 0 || caixa.left > caixas[i - 1].left));
      if (!emFila) {
        return quase(
          modo === 'web'
            ? "Os botões estão um embaixo do outro. Coloque eles numa `<div>` com `style={{ display: 'flex' }}` pra ficarem lado a lado."
            : "Os botões estão um embaixo do outro. A `View` de fora precisa de `style={{ flexDirection: 'row' }}` pra eles ficarem lado a lado."
        );
      }

      // o Tom ataca (força 3): de 6 vai pra 3
      teste.clicar(botaoDe(teste, 'Tom'));
      if (teste.erro) return erro(traduzir(teste.erro));
      const texto = teste.container.textContent;
      if (!dormiu(texto) && mostraNumero(texto, 6)) {
        return quase(
          `O ${clique} não mudou a energia. Guarde a energia num estado (\`useState(energia)\`) e, no ${clique}, tire a força do herói: \`setRestante(restante - heroi.forca)\`.`
        );
      }
      if (mostraNumero(texto, 5)) {
        return quase('A energia baixou só 1. Cada herói tem uma força: tire a `heroi.forca` da energia.');
      }
      if (!mostraNumero(texto, 3)) {
        return quase('O golpe do Tom tem força 3, então a energia devia ir de 6 pra 3. Confira a conta: `restante - heroi.forca`.');
      }
      if (ataques.length === 0) {
        return quase(`A energia baixou, mas a cena não ficou sabendo do golpe. No ${clique}, chame também \`aoAtacar(heroi)\`.`);
      }
      if (!ataques[0] || typeof ataques[0] !== 'object' || !ataques[0].nome) {
        return quase('Passe o herói inteiro pro `aoAtacar`, assim a cena sabe quem atacou: `aoAtacar(heroi)`.');
      }

      // Lia (2) e Guarda (1): chega a zero
      teste.clicar(botaoDe(teste, 'Lia'));
      if (teste.erro) return erro(traduzir(teste.erro));
      teste.clicar(botaoDe(teste, 'Guarda'));
      if (teste.erro) return erro(traduzir(teste.erro));
      if (!dormiu(teste.container.textContent)) {
        return quase('A energia chegou a zero, mas a luta continuou. Quando ela for 0 ou menos, mostre O Guardião dormiu! no lugar dos botões.');
      }
      if (acharBotoes(teste.container, modo).length) {
        return quase('O Guardião dormiu, mas os botões continuaram na tela. Quando a energia acabar, mostre só a mensagem.');
      }
      teste.desmontar();

      // outro time, com um golpe que passa do zero
      teste = lutar(TIME_B, 9);
      if (teste.erro) return erro(traduzir(teste.erro));
      const faltou = TIME_B.find((heroi) => !botaoDe(teste, heroi.nome));
      if (faltou || !mostraNumero(teste.container.textContent, 9)) {
        return quase(
          'Com outro time e outra energia, o painel não mudou. Use os dados que chegam pelas props (`herois` e `energia`), sem escrever nomes ou números na mão.'
        );
      }
      teste.clicar(botaoDe(teste, 'Bia'));
      teste.clicar(botaoDe(teste, 'Bia'));
      if (teste.erro) return erro(traduzir(teste.erro));
      if (!dormiu(teste.container.textContent)) {
        return quase(
          'Um golpe forte fez a energia passar do zero (ficou -1), e a luta não acabou. Compare com `<= 0` (menor ou igual) em vez de `=== 0`.'
        );
      }

      return ok(`Painel pronto! Agora lute de verdade: ${modo === 'web' ? 'clique' : 'toque'} nos heróis lá na cena até o Guardião dormir.`, {
        esperarInteracao: true,
      });
    } finally {
      teste.desmontar();
    }
  },
};
