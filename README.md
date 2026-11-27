# Código da Masmorra

Jogo de fases pra praticar React e React Native. Cada fase pede um componente: a placa da entrada precisa de texto, a tocha precisa de um interruptor, a ponte precisa de uma tábua pra cada item da lista. O código roda no próprio navegador e o jogo aponta o que está errado.

Cada fase pode ser jogada em dois modos: Web, com tags do HTML e `onClick`, e Mobile, com os componentes do React Native e `onPress`. Antes de cada fase abre uma página do livro com a ideia do assunto, um exemplo comentado linha a linha, uma demonstração pra mexer e o passo a passo da fase.

Inspirado no The Farmer Was Replaced.

Jogar: https://guilhermeoliveirabrito.github.io/codigo-da-masmorra/

## Fases

1. A placa da entrada: componentes e JSX
2. Crachás: props
3. A alavanca: eventos
4. A tocha: estado com `useState`
5. Os portões: renderização condicional
6. A ponte: listas com `map` e `key`
7. Pedras no rio: layout com flexbox
8. A porta que fecha sozinha: `useEffect` com limpeza
9. O mensageiro: buscando dados de uma API com `fetch`
10. O guardião: uma batalha juntando tudo

Cada fase dá até 3 estrelas (passar, não ver a solução, não pedir dica) e tem conquistas escondidas pelo caminho.

## Moedas, segredos e loja

Passar de fase dá moedas: 20 na primeira vez mais 10 por estrela, e depois só as estrelas novas valem. Cada sala também esconde um segredo (um vaso, um tijolo solto, uma garrafa boiando no rio...), e a tela inicial tem mais um. Na loja, as moedas compram acessórios pra turma, um gatinho e uma gosminha que acompanham as viagens e tochas azuis.

## Caça aos bugs

Modo arcade liberado depois da primeira fase: o goblin Bugado quebra componentes e você tem 3 minutos pra consertar o máximo que conseguir. São 18 bugs (`src/caca/bugs.jsx`), e só entram os das fases que você já passou no modo escolhido. Consertos seguidos aumentam o combo, pular zera, e o recorde fica salvo por modo.

## Rodando

```bash
npm install
npm run dev
```

Pra abrir no celular durante o desenvolvimento, use `npm run dev -- --host` e acesse o endereço de rede que aparece no terminal (os dois na mesma rede).

## No celular

No celular, a fase fica dividida em duas abas (Missão e Código), com o botão Rodar sempre embaixo. Publicado no GitHub Pages, o jogo pode ser instalado na tela inicial e abre mesmo sem internet:

- Android: menu do Chrome, Instalar app (ou Instalar no celular, nos ajustes do jogo, a engrenagem no canto da tela inicial).
- iPhone: no Safari, Compartilhar e Adicionar à Tela de Início.

A cada push na `main`, o workflow em `.github/workflows/deploy.yml` faz o build e coloca o resultado na branch `gh-pages`, que é a que o GitHub Pages publica.

## Como funciona

O código do jogador é lido com o [acorn](https://github.com/acornjs/acorn) e o JSX vira chamadas de função (`src/motor/compilar.js`). Depois ele roda com `new Function`, recebendo o React, as peças do jogo (`import { Chama } from 'masmorra'`) e, no modo Mobile, uma imitação de `View`, `Text`, `Pressable` e `StyleSheet` feita com HTML (`src/motor/reactNative.jsx`). É essa imitação que permite checar regras do React Native, como texto fora de `<Text>`.

Como o código do jogador roda na própria página, algumas proteções ficam em volta dele: loops e componentes que não param são interrompidos com uma mensagem (em vez de travar a aba), erros dentro de cliques aparecem na tela, e a página publicada tem uma Content Security Policy que não deixa o código mandar dados pra outros sites.

Cada fase fica numa pasta em `src/fases`, com a cena, o texto do livro, as dicas e uma função `verificar`, que desenha o componente fora da tela e confere o resultado. Pra criar uma fase nova, dá pra copiar uma das pastas e adicionar ela em `src/fases/index.js`.

Os personagens, o cenário e os ícones são pixel art desenhada no código (`src/pixel`), com a paleta Endesga 32. Quando um personagem muda de lugar, ele troca pro desenho de lado e anda no ritmo dos passos; entre uma fase e outra, a turma atravessa um corredor (`src/components/Viagem.jsx`). Os acessórios da loja entram em cada quadro do desenho (`src/pixel/acessorios.js`), e o logo da tela inicial também é montado pixel a pixel (`src/pixel/letreiro.js`).

Nas fases 8 e 9 o código usa `setInterval` e `fetch`, mas não os do navegador: o jogo entrega versões próprias (`src/motor/ambiente.js`). Na cena elas funcionam de verdade, e no teste o tempo é controlado pelo jogo, o que permite conferir se o intervalo para quando o componente sai da tela. O `fetch` responde de um servidor de mentira, então nada sai da página.

Os sons são gerados na hora com Web Audio (`src/som.js`), sem arquivo de áudio.

O editor colore o código com um leitor simples de JavaScript e JSX (`src/components/realce.js`). No iPhone e no iPad ele fica sem cor: o Safari desloca o texto do campo uns pixels, e o cursor não bateria com o texto colorido.

## Licença

MIT
