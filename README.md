# Código da Masmorra

Jogo de fases pra praticar React e React Native. Cada fase pede um componente: a placa da entrada precisa de texto, a tocha precisa de um interruptor, a ponte precisa de uma tábua pra cada item da lista. O código roda no próprio navegador e o jogo aponta o que está errado.

Cada fase pode ser jogada em dois modos: Web, com tags do HTML e `onClick`, e Mobile, com os componentes do React Native e `onPress`. Antes de cada fase abre uma página do livro explicando o assunto.

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

Próximas: `useEffect`, chamada de API e uma fase final juntando tudo.

## Rodando

```bash
npm install
npm run dev
```

Pra abrir no celular durante o desenvolvimento, use `npm run dev -- --host` e acesse o endereço de rede que aparece no terminal (os dois na mesma rede).

## No celular

No celular, a fase fica dividida em duas abas (Missão e Código), com o botão Rodar sempre embaixo. Publicado no GitHub Pages, o jogo pode ser instalado na tela inicial e abre mesmo sem internet:

- Android: menu do Chrome, Instalar app (ou o botão Instalar no celular, no menu do jogo).
- iPhone: no Safari, Compartilhar e Adicionar à Tela de Início.

A cada push na `main`, o workflow em `.github/workflows/deploy.yml` faz o build e coloca o resultado na branch `gh-pages`, que é a que o GitHub Pages publica.

## Como funciona

O código do jogador é lido com o [acorn](https://github.com/acornjs/acorn) e o JSX vira chamadas de função (`src/motor/compilar.js`). Depois ele roda com `new Function`, recebendo o React, as peças do jogo (`import { Chama } from 'masmorra'`) e, no modo Mobile, uma imitação de `View`, `Text`, `Pressable` e `StyleSheet` feita com HTML (`src/motor/reactNative.jsx`). É essa imitação que permite checar regras do React Native, como texto fora de `<Text>`.

Como o código do jogador roda na própria página, algumas proteções ficam em volta dele: loops e componentes que não param são interrompidos com uma mensagem (em vez de travar a aba), erros dentro de cliques aparecem na tela, e a página publicada tem uma Content Security Policy que não deixa o código mandar dados pra outros sites.

Cada fase fica numa pasta em `src/fases`, com a cena, o texto do livro, as dicas e uma função `verificar`, que desenha o componente fora da tela e confere o resultado. Pra criar uma fase nova, dá pra copiar uma das pastas e adicionar ela em `src/fases/index.js`.

Os personagens, o cenário e os ícones são pixel art desenhada no código (`src/pixel`), com a paleta Endesga 32.

## Licença

MIT
