// acha no código do jogador o componente que a fase pede, ou explica por que não achou
export function pegarComponente(modulo, nome) {
  const { exportados, declarados } = modulo;
  if (typeof exportados[nome] === 'function') return { Componente: exportados[nome] };
  if (exportados.default && exportados.default === declarados[nome]) {
    return { Componente: exportados.default };
  }

  if (nome in declarados) {
    return {
      problema: `Achei a função \`${nome}\`, mas falta o \`export\` na frente dela: \`export function ${nome}() {\`. Sem o export, o jogo não consegue usar o componente.`,
    };
  }
  const parecido = Object.keys(declarados).find((n) => n.toLowerCase() === nome.toLowerCase());
  if (parecido) {
    return {
      problema: `Não achei \`${nome}\`, mas achei \`${parecido}\`. O nome precisa ser igualzinho, com as mesmas maiúsculas e minúsculas.`,
    };
  }
  return {
    problema: `Não achei o componente \`${nome}\`. O jogo procura uma função chamada ${nome}, com \`export\` na frente.`,
  };
}
