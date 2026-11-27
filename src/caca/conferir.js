import { carregarMotor } from '../motor/carregarMotor';
import { pegarComponente } from '../motor/componente';
import { traduzirErro } from '../motor/erros';

// roda o código do jogador e o teste do bug; devolve o veredito com os avisos do React
export async function conferir(bug, codigo, modo) {
  const avisos = new Set();
  const errosDeClique = [];
  const traduzir = (e) => traduzirErro(e, codigo, modo);
  let veredito;
  try {
    const { executar } = await carregarMotor();
    const opcoes = { aoErroEmEvento: (e) => errosDeClique.push(e) };
    const { Componente, problema } = pegarComponente(executar(codigo, modo, avisos, opcoes), bug.componente);
    if (!Componente) veredito = { tipo: 'erro', mensagem: problema };
    else {
      const montar = (ambiente) => pegarComponente(executar(codigo, modo, avisos, { ...opcoes, ambiente }), bug.componente).Componente;
      veredito = await bug.testar({ Componente, modo, traduzir, avisos, montar });
    }
  } catch (e) {
    // código que nem roda: a dica do bug ajuda a achar onde
    const dica = bug.dica?.[modo] ?? bug.dica;
    veredito = { tipo: 'erro', mensagem: `${traduzir(e)}${typeof dica === 'string' ? ` ${dica}` : ''}` };
  }
  if (errosDeClique.length && veredito.tipo !== 'ok') {
    veredito = { tipo: 'erro', mensagem: `${traduzir(errosDeClique[0])} (Isso aconteceu no clique.)` };
  }
  return { ...veredito, avisos: veredito.esconderAvisos ? [] : [...avisos] };
}
