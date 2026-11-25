import { createContext } from 'react';

// As peças da masmorra usam isso pra avisar a cena (por exemplo, que a tocha acendeu).
// Fora de uma cena, como nos testes escondidos, o aviso não faz nada.
export const ContextoDaCena = createContext({ avisar() {} });
