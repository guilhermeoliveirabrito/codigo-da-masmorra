import { useState } from 'react';
import { flushSync } from 'react-dom';
import { criarRelogio } from '../../motor/ambiente';
import {
  acharTextoSolto,
  criarEspiao,
  desenharEscondido,
  erro,
  mensagemTextoSolto,
  ok,
  quase,
} from '../../motor/testar';
import { CenaPorta } from './CenaPorta';

export const fasePorta = {
  id: 'porta',
  numero: 8,
  titulo: 'A porta que fecha sozinha',
  conceito: 'useEffect',
  elenco: ['lia', 'tom'],
  segredo: { tipo: 'tijolo', x: 88, y: 40 },
  componente: 'Ampulheta',
  arquivo: 'Ampulheta.jsx',
  Cena: CenaPorta,

  falas: [
    { quem: 'lia', texto: 'Corre! Tem uma gosma vindo atrás da gente!' },
    { quem: 'tom', texto: 'Essa grade desce sozinha, mas alguém precisa contar o tempo. É pra isso que serve a ampulheta.' },
    { quem: 'tom', texto: 'Quando ela aparecer, tem que bater a cada segundo. E quando sair da tela, tem que parar de bater.' },
  ],
  objetivo:
    'Quando a `Ampulheta` aparecer, ela precisa chamar o `tique` a cada 1 segundo. Quando sair da tela, ela para.',

  codigoInicial: {
    web: `import { useEffect } from 'react';

// O jogo passa o tique pela prop: cada vez que você chama o
// tique(), a grade desce um pedaço. Três batidas e ela fecha.

export function Ampulheta({ tique }) {
  // Quando a ampulheta aparecer, chame o tique a cada 1 segundo.

  return <p>Tic-tac...</p>;
}
`,
    mobile: `import { useEffect } from 'react';
import { Text } from 'react-native';

// O jogo passa o tique pela prop: cada vez que você chama o
// tique(), a grade desce um pedaço. Três batidas e ela fecha.

export function Ampulheta({ tique }) {
  // Quando a ampulheta aparecer, chame o tique a cada 1 segundo.

  return <Text>Tic-tac...</Text>;
}
`,
  },

  passos: [
    'Dentro da função, crie um `useEffect` com `[]` no final: assim ele roda uma vez, quando a ampulheta aparece.',
    'Lá dentro, use o `setInterval` pra chamar o `tique` a cada 1000 milissegundos. Guarde o número que ele devolve: `const id = setInterval(...)`.',
    'No fim do efeito, devolva a limpeza, que para o intervalo: `return () => clearInterval(id);`.',
    'Aperte **Rodar** e veja a grade descer.',
  ],

  livro: {
    titulo: 'Efeitos: fazendo algo depois de desenhar',
    resumo:
      'O `useEffect` roda um código depois que o componente aparece na tela. O `[]` diz quando ele roda de novo, e a função que ele devolve faz a limpeza.',
    ideia:
      'O componente desenha a tela. Mas às vezes ele precisa **fazer** alguma coisa além de desenhar: ligar um cronômetro, buscar dados, ficar ouvindo o teclado. Isso é um **efeito**, e mora no `useEffect`.\nPense numa ampulheta: quando ela chega na mesa, alguém vira ela. Quando ela vai embora, alguém precisa parar a areia.',
    exemplo: {
      codigo: {
        web: `import { useEffect, useState } from 'react';

export function Cronometro() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSegundos((atual) => atual + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>Passaram {segundos} segundos</p>;
}`,
        mobile: `import { useEffect, useState } from 'react';
import { Text } from 'react-native';

export function Cronometro() {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSegundos((atual) => atual + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <Text>Passaram {segundos} segundos</Text>;
}`,
      },
      notas: [
        { marca: 'useEffect(() =>', texto: 'O `useEffect` recebe uma função, e o React roda ela **depois** de desenhar o componente na tela.' },
        {
          marca: 'setInterval(',
          texto:
            'O `setInterval` repete uma função a cada tantos milissegundos (1000 é um segundo). Ele devolve um número, o id, que serve pra parar depois.',
        },
        {
          marca: '(atual) => atual + 1',
          texto:
            'Passando uma função pro `setSegundos`, o React entrega o valor mais novo. Dentro de um intervalo isso importa: o `segundos` lá de cima ficaria parado no valor do começo.',
        },
        {
          marca: 'return () =>',
          texto: 'A função que o efeito devolve é a **limpeza**. O React chama ela quando o componente sai da tela, e o intervalo para.',
        },
        {
          marca: '}, []);',
          texto:
            'O `[]` é a lista de dependências. Vazia, quer dizer: rode só quando aparecer. Com `[nome]`, o efeito roda de novo toda vez que o `nome` mudar.',
        },
      ],
    },
    experimente: 'efeito',
    diferencas: {
      igual: 'O `useEffect` é igual nos dois modos: ele vem do `react`.',
      web: 'No navegador, efeitos também servem pra mudar o título da aba ou ouvir o teclado.',
      mobile: 'No celular, efeitos servem pra saber quando o teclado abre, quando a localização muda ou quando o app volta do segundo plano.',
    },
    cuidado:
      'Esquecer a limpeza é o erro mais comum: o intervalo continua rodando depois que o componente sumiu, e cada vez que ele volta nasce mais um. E sem o `[]`, o efeito roda depois de **todo** desenho.',
    pratica:
      'Um chat liga a conexão com o servidor num `useEffect` e desliga na limpeza. Um jogo liga o cronômetro quando a partida começa. Um campo de busca espera a pessoa parar de digitar antes de buscar.',
  },

  dicas: [
    'O `useEffect` recebe duas coisas: uma função (o que fazer) e uma lista (quando fazer de novo). Com `[]`, ele roda uma vez só, quando o componente aparece: `useEffect(() => { ... }, []);`.',
    '`setInterval(tique, 1000)` chama o `tique` a cada 1000 milissegundos. Repare: é `tique`, sem parênteses, igual no `onClick`. Guarde o id: `const id = setInterval(tique, 1000);`.',
    'A função que o `useEffect` devolve roda quando o componente sai da tela. Pare o intervalo nela: `return () => clearInterval(id);`.',
  ],

  solucao: {
    web: `import { useEffect } from 'react';

export function Ampulheta({ tique }) {
  useEffect(() => {
    const id = setInterval(tique, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Tic-tac...</p>;
}`,
    mobile: `import { useEffect } from 'react';
import { Text } from 'react-native';

export function Ampulheta({ tique }) {
  useEffect(() => {
    const id = setInterval(tique, 1000);
    return () => clearInterval(id);
  }, []);

  return <Text>Tic-tac...</Text>;
}`,
  },

  aprendeu:
    'O `useEffect` roda depois que o componente aparece. Com `[]` ele roda uma vez só, e a função que ele devolve faz a limpeza quando o componente sai. É o lugar de timers, conexões e tudo que precisa começar e parar junto com o componente.',

  // O teste roda a Ampulheta com um relógio de mentira: o tempo só anda quando o teste manda.
  verificar({ Componente, modo, traduzir, montar }) {
    const relogio = criarRelogio();
    let Ampulheta;
    try {
      Ampulheta = montar(relogio.ambiente) ?? Componente;
    } catch (e) {
      return erro(traduzir(e));
    }

    const tique = criarEspiao();
    let redesenhar = () => {};
    function Embrulho() {
      const [vez, setVez] = useState(0);
      redesenhar = () => setVez((n) => n + 1);
      return <Ampulheta tique={tique.fn} vez={vez} />;
    }

    const teste = desenharEscondido(<Embrulho />);
    let desmontado = false;
    const andar = (ms) => relogio.avancar(ms, (funcao) => flushSync(funcao));

    try {
      if (teste.erro) return erro(traduzir(teste.erro));

      if (modo === 'mobile') {
        const solto = acharTextoSolto(teste.container);
        if (solto) return quase(mensagemTextoSolto(solto));
      }

      if (tique.chamadas > 0) {
        return quase(
          'A ampulheta bateu na mesma hora em que apareceu, sem esperar o segundo passar. Se você escreveu `setInterval(tique(), 1000)`, tire os parênteses: o setInterval precisa receber a função, e não o resultado dela.'
        );
      }

      andar(1000);
      if (relogio.erro) return erro(traduzir(relogio.erro));
      if (tique.chamadas === 0) {
        if (relogio.criados.intervalo + relogio.criados.timeout === 0) {
          return quase(
            'A ampulheta não bateu nenhuma vez. Dentro de um `useEffect`, use o `setInterval` pra chamar o `tique` a cada 1000 milissegundos.'
          );
        }
        andar(5000);
        if (tique.chamadas === 0) {
          return quase(
            'Tem um timer rodando, mas o `tique` nunca foi chamado. Confira se o setInterval recebe o `tique` e o tempo: `setInterval(tique, 1000)`.'
          );
        }
        return quase('A ampulheta demorou mais de 1 segundo pra bater. O tempo do setInterval é em milissegundos: 1 segundo é 1000.');
      }
      if (tique.chamadas > 1) {
        return quase(
          `A ampulheta bateu ${tique.chamadas} vezes no primeiro segundo. O tempo do setInterval é em milissegundos: 1 segundo é 1000.`
        );
      }

      andar(2000);
      if (relogio.erro) return erro(traduzir(relogio.erro));
      if (tique.chamadas === 1) {
        return quase('A ampulheta bateu uma vez e parou. O `setTimeout` roda uma vez só; pra repetir, use o `setInterval`.');
      }
      if (tique.chamadas !== 3) {
        return quase(`Em 3 segundos a ampulheta bateu ${tique.chamadas} vezes, e o certo seria 3. Confira o tempo do setInterval.`);
      }

      if (!teste.container.textContent.trim()) {
        return quase('A ampulheta bate certinho, mas não aparece nada na tela. Deixe um texto no return, tipo Tic-tac...');
      }

      // desenha de novo: o efeito com [] não pode rodar outra vez
      const intervalosAntes = relogio.criados.intervalo;
      flushSync(() => redesenhar());
      if (teste.erro) return erro(traduzir(teste.erro));
      andar(1000);
      if (tique.chamadas > 4) {
        return quase(
          'Depois que o componente foi desenhado de novo, a ampulheta passou a bater dobrado: nasceu um intervalo novo e o velho continuou. O setInterval precisa ficar dentro de um `useEffect` com `[]` no final.'
        );
      }
      const criouDeNovo = relogio.criados.intervalo > intervalosAntes;

      // sai da tela: tem que parar de bater
      teste.desmontar();
      desmontado = true;
      const antes = tique.chamadas;
      andar(3000);
      if (tique.chamadas > antes || relogio.pendentes() > 0) {
        return quase(
          'Quando a ampulheta saiu da tela, ela continuou batendo. Falta a limpeza: no fim do useEffect, `return () => clearInterval(id);`.'
        );
      }
      if (criouDeNovo) {
        return quase(
          'Funciona, mas o efeito roda de novo a cada desenho e cria um intervalo novo toda vez. Coloque `[]` no fim do useEffect, pra ele rodar só quando a ampulheta aparece.'
        );
      }

      return ok('A ampulheta bate a cada segundo e para quando sai da tela. Olha a grade descendo!', {
        esperarInteracao: true,
      });
    } finally {
      if (!desmontado) teste.desmontar();
    }
  },
};
