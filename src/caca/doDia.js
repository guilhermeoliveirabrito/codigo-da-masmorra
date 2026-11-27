// Bug do dia: um bug por data, igual pra todo mundo que já passou das mesmas fases

const dois = (n) => String(n).padStart(2, '0');
const formatar = (data) => `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;

// a data no relógio de quem joga (a meia-noite é a do jogador, não a do servidor)
export function hoje(agora = new Date()) {
  return formatar(agora);
}

export function ontemDe(dia) {
  const data = new Date(`${dia}T12:00:00`);
  data.setDate(data.getDate() - 1);
  return formatar(data);
}

export function bugDoDia(disponiveis, dia) {
  if (!disponiveis.length) return null;
  const ordem = [...disponiveis].sort((a, b) => a.id.localeCompare(b.id));
  let sorte = 0;
  for (const letra of dia) sorte = (sorte * 31 + letra.charCodeAt(0)) >>> 0;
  return ordem[sorte % ordem.length];
}

// a sequência só vale se o último bug do dia foi hoje ou ontem
export function sequenciaAtual(desafio, dia) {
  return desafio.dia === dia || desafio.dia === ontemDe(dia) ? desafio.sequencia : 0;
}

// 25 moedas, mais 5 por dia seguido (até 50)
export const moedasDoDia = (sequencia) => 25 + 5 * Math.min(sequencia, 5);
