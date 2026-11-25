// O motor (com o leitor de JavaScript, a parte mais pesada do jogo) fica num arquivo
// separado: a tela inicial abre sem ele, e ele é baixado logo depois, em segundo plano.
let promessa = null;

export function carregarMotor() {
  promessa ??= import('./executar').catch((erro) => {
    promessa = null;
    throw erro;
  });
  return promessa;
}

export function carregarMotorDepois() {
  const carregar = () => carregarMotor().catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(carregar, { timeout: 3000 });
  else setTimeout(carregar, 1500);
}
