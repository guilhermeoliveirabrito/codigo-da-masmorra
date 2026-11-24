# Código da Masmorra

Jogo de fases pra praticar React e React Native. Cada fase pede um componente: a placa da entrada precisa de texto, os aventureiros precisam de crachás, a porta só abre com uma alavanca. O código roda no próprio navegador e o jogo aponta o que está errado.

Cada fase pode ser jogada em dois modos: Web, com tags do HTML e `onClick`, e Mobile, com os componentes do React Native e `onPress`. Antes de cada fase abre uma página do livro explicando o assunto.

Inspirado no The Farmer Was Replaced.

## Rodando

```bash
npm install
npm run dev
```

Pra abrir no celular, use `npm run dev -- --host` e acesse o endereço de rede que aparece no terminal (os dois na mesma rede).

## Fases

1. A placa da entrada: componentes e JSX
2. Crachás: props
3. A alavanca: eventos

Próximas: estado com `useState`, renderização condicional, listas, layout com flexbox, `useEffect` e chamadas à API.

## Como funciona

O código do jogador é lido com o [acorn](https://github.com/acornjs/acorn) e o JSX vira chamadas de função (`src/motor/compilar.js`). Depois ele roda com `new Function`, recebendo o React e, no modo Mobile, uma imitação de `View`, `Text`, `Pressable` e `StyleSheet` feita com HTML (`src/motor/reactNative.jsx`). É essa imitação que permite checar regras do React Native, como texto fora de `<Text>`.

Cada fase fica numa pasta em `src/fases`, com a cena, o texto do livro, as dicas e uma função `verificar`, que desenha o componente fora da tela e confere o resultado. Pra criar uma fase nova, dá pra copiar uma das pastas e adicionar ela em `src/fases/index.js`.

Os personagens e o cenário são pixel art desenhada no código (`src/pixel`), com a paleta Endesga 32.

## Licença

MIT
