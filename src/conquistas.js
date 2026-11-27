export const CONQUISTAS = [
  { id: 'primeiro-passo', titulo: 'Primeiro passo', descricao: 'Passou da primeira fase.' },
  { id: 'de-primeira', titulo: 'De primeira', descricao: 'Passou de uma fase logo no primeiro Rodar.' },
  { id: 'sem-ajuda', titulo: 'Sem mapa', descricao: 'Passou de uma fase sem pedir nenhuma dica.' },
  { id: 'teimoso', titulo: 'Teimoso', descricao: 'Errou 5 vezes na mesma fase e passou mesmo assim.' },
  { id: 'loop', titulo: 'Domador de loops', descricao: 'Travou a masmorra num loop sem fim. Acontece nas melhores famílias.' },
  { id: 'cientista', titulo: 'Cientista', descricao: 'Mexeu numa demonstração do livro.' },
  { id: 'bilingue', titulo: 'Bilíngue', descricao: 'Fez a mesma fase no modo Web e no Mobile.' },
  { id: 'tagarela', titulo: 'Tagarela', descricao: 'Puxou conversa com os personagens 10 vezes.' },
  { id: 'estrelas', titulo: 'Céu estrelado', descricao: 'Conseguiu 3 estrelas em 5 fases.' },
  { id: 'guardiao', titulo: 'Canção de ninar', descricao: 'Fez o Guardião dormir.' },
  { id: 'web', titulo: 'Mestre da Web', descricao: 'Terminou todas as fases no modo Web.' },
  { id: 'mobile', titulo: 'Mestre do Mobile', descricao: 'Terminou todas as fases no modo Mobile.' },
  { id: 'explorador', titulo: 'Explorador', descricao: 'Achou todos os segredos escondidos na masmorra.' },
  { id: 'fregues', titulo: 'Freguês', descricao: 'Comprou alguma coisa na loja.' },
  { id: 'cacador', titulo: 'Caçador de bugs', descricao: 'Consertou 5 bugs numa rodada só da Caça aos bugs.' },
  { id: 'combo', titulo: 'Combo máximo', descricao: 'Chegou no combo x5 da Caça aos bugs.' },
  { id: 'sequencia', titulo: 'Sete dias seguidos', descricao: 'Consertou o bug do dia sete dias seguidos.' },
  { id: 'gato', titulo: 'Amigo do gato', descricao: 'Fez carinho no gato da masmorra.', secreta: true },
  { id: 'coruja', titulo: 'Coruja', descricao: 'Jogou depois da meia-noite.', secreta: true },
];

// qualquer parte do jogo avisa que ganhou uma conquista; o App guarda e mostra o aviso
const EVENTO = 'masmorra:conquista';

export function conquistar(id) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: id }));
}

export function ouvirConquistas(funcao) {
  const ouvinte = (evento) => funcao(evento.detail);
  window.addEventListener(EVENTO, ouvinte);
  return () => window.removeEventListener(EVENTO, ouvinte);
}
