// Compartilhar o resultado. No celular abre a janela de compartilhar do sistema;
// onde ela não existe ou está bloqueada (dentro de um iframe, por exemplo), copia o texto.
export const ENDERECO = 'https://guilhermeoliveirabrito.github.io/codigo-da-masmorra/';

const nomeDoModo = (modo) => (modo === 'web' ? 'Web' : 'Mobile');

export function textoDaCaca(resumo, modo) {
  const bugs = resumo.consertados === 1 ? '1 bug consertado' : `${resumo.consertados} bugs consertados`;
  const recorde = resumo.novoRecorde ? ' Recorde novo!' : '';
  return `Fiz ${resumo.pontos} pontos na Caça aos bugs do Código da Masmorra (${nomeDoModo(modo)}): ${bugs}, combo x${resumo.melhorCombo}.${recorde}`;
}

export function textoDoDia(dia, sequencia) {
  const [, mes, numero] = dia.split('-');
  const seguidos = sequencia > 1 ? ` São ${sequencia} dias seguidos!` : '';
  return `Consertei o bug do dia ${numero}/${mes} no Código da Masmorra.${seguidos}`;
}

export function textoDoFim(modo, estrelas, maximo) {
  return `Cheguei ao fim do Código da Masmorra no modo ${nomeDoModo(modo)}, com ${estrelas} de ${maximo} estrelas.`;
}

function podeUsarJanelaDoSistema() {
  if (!navigator.share) return false;
  // num iframe sem permissão o share só falha, e ainda gasta o clique que o copiar precisaria
  return document.featurePolicy?.allowsFeature?.('web-share') ?? true;
}

export async function compartilhar(texto) {
  if (podeUsarJanelaDoSistema()) {
    try {
      await navigator.share({ title: 'Código da Masmorra', text: texto, url: ENDERECO });
      return 'compartilhado';
    } catch (erro) {
      if (erro?.name === 'AbortError') return 'cancelado';
    }
  }
  try {
    await navigator.clipboard.writeText(`${texto}\n${ENDERECO}`);
    return 'copiado';
  } catch {
    return 'falhou';
  }
}
