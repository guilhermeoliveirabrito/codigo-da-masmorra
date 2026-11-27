import { createContext } from 'react';

// o que dá pra comprar com as moedas. Os acessórios estão desenhados em pixel/acessorios.js
// grupo: itens do mesmo grupo não se usam juntos (um tema de editor por vez)
export const ITENS = [
  { id: 'coroa', nome: 'Coroa da Lia', descricao: 'A arqueira mais nobre da masmorra.', preco: 60, quem: 'lia' },
  { id: 'oculos', nome: 'Óculos escuros do Tom', descricao: 'Mago que se preza não olha direto pra tocha.', preco: 60, quem: 'tom' },
  { id: 'chapeu', nome: 'Chapéu de festa do Guarda', descricao: 'Ele diz que não gostou, mas não tira por nada.', preco: 60, quem: 'guarda' },
  { id: 'tochas-azuis', nome: 'Tochas azuis', descricao: 'Fogo mágico em todas as tochas da masmorra.', preco: 80 },
  { id: 'gato', nome: 'Gatinho', descricao: 'Fica no canto das salas e vai junto nas viagens. Aceita carinho.', preco: 120 },
  { id: 'gosminha', nome: 'Gosminha', descricao: 'Uma gosma que resolveu ser do bem.', preco: 120 },
  { id: 'tema-pergaminho', nome: 'Editor pergaminho', descricao: 'Código escrito com tinta, em papel velho.', preco: 100, grupo: 'tema' },
  { id: 'tema-neon', nome: 'Editor neon', descricao: 'Cores de fliperama pra programar de madrugada.', preco: 100, grupo: 'tema' },
  { id: 'tema-musgo', nome: 'Editor musgo', descricao: 'Tudo verde, igual monitor de computador antigo.', preco: 100, grupo: 'tema' },
];

export const IDS_DOS_ITENS = ITENS.map((item) => item.id);

const grupoDe = (id) => ITENS.find((item) => item.id === id)?.grupo;

// põe o item em uso e tira quem for do mesmo grupo
export function usarItem(usando, id) {
  const grupo = grupoDe(id);
  return [...usando.filter((outro) => outro !== id && (!grupo || grupoDe(outro) !== grupo)), id];
}

export const temaEmUso = (usando) => usando.find((id) => grupoDe(id) === 'tema') ?? null;

// o que está sendo usado agora (lista de ids), pra cena e os personagens se vestirem
export const ItensEmUso = createContext([]);
