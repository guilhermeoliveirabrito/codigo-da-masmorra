// Separa o código em pedaços coloridos: palavra-chave, texto, tag do JSX, atributo...
// Não precisa entender o código inteiro, só o bastante pra colorir. Por isso nunca falha:
// código pela metade (enquanto a pessoa digita) também sai colorido, do jeito que der.

const PALAVRAS = new Set([
  'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let', 'var', 'if', 'else',
  'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'typeof', 'instanceof', 'in',
  'of', 'try', 'catch', 'finally', 'throw', 'class', 'extends', 'async', 'await', 'this', 'delete',
]);
const VALORES = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

// depois disso, um < começa JSX (e não é "menor que")
const ABRE_EXPRESSAO = new Set(['', '(', '[', '{', ',', '=', ':', '?', '&&', '||', '=>', '!', 'return', 'default', '}', ';']);

const LETRA = /[A-Za-z_$À-ɏ]/;
const PALAVRA = /[\w$À-ɏ]/;

export function realcar(codigo) {
  const pedacos = [];
  const pilha = [{ modo: 'js', chaves: 0 }];
  let i = 0;
  let anterior = '';

  function empurrar(tipo, texto) {
    if (!texto) return;
    const ultimo = pedacos[pedacos.length - 1];
    if (ultimo && ultimo[0] === tipo) ultimo[1] += texto;
    else pedacos.push([tipo, texto]);
  }

  function lerTexto(inicio) {
    const aspa = codigo[inicio];
    let fim = inicio + 1;
    while (fim < codigo.length && codigo[fim] !== aspa) {
      if (codigo[fim] === '\\') fim++;
      else if (codigo[fim] === '\n' && aspa !== '`') break;
      fim++;
    }
    return Math.min(fim + 1, codigo.length);
  }

  function abrirTag() {
    const fechando = codigo[i + 1] === '/';
    empurrar('sinal', fechando ? '</' : '<');
    i += fechando ? 2 : 1;
    pilha.push({ modo: 'tag', fechando, temNome: false });
  }

  while (i < codigo.length) {
    const topo = pilha[pilha.length - 1];
    const c = codigo[i];
    const inicio = i;

    if (topo.modo === 'filhos') {
      if (c === '{') {
        empurrar('', c);
        pilha.push({ modo: 'js', chaves: 0, voltaPara: true });
        anterior = '{';
        i++;
      } else if (c === '<') {
        abrirTag();
      } else {
        let fim = i;
        while (fim < codigo.length && codigo[fim] !== '<' && codigo[fim] !== '{') fim++;
        empurrar('', codigo.slice(i, fim));
        i = fim;
      }
    } else if (topo.modo === 'tag') {
      if (/\s/.test(c)) {
        empurrar('', c);
        i++;
      } else if (codigo.startsWith('/>', i)) {
        empurrar('sinal', '/>');
        pilha.pop();
        anterior = ')';
        i += 2;
      } else if (c === '>') {
        empurrar('sinal', '>');
        pilha.pop();
        if (topo.fechando) {
          if (pilha[pilha.length - 1]?.modo === 'filhos') pilha.pop();
          anterior = ')';
        } else {
          pilha.push({ modo: 'filhos' });
        }
        i++;
      } else if (c === '{') {
        empurrar('', c);
        pilha.push({ modo: 'js', chaves: 0, voltaPara: true });
        anterior = '{';
        i++;
      } else if (c === '"' || c === "'") {
        const fim = lerTexto(i);
        empurrar('texto', codigo.slice(i, fim));
        i = fim;
      } else if (LETRA.test(c)) {
        let fim = i + 1;
        while (fim < codigo.length && /[\w$.:\-À-ɏ]/.test(codigo[fim])) fim++;
        empurrar(topo.temNome ? 'atributo' : 'tag', codigo.slice(i, fim));
        topo.temNome = true;
        i = fim;
      } else {
        empurrar('sinal', c);
        i++;
      }
    } else if (/\s/.test(c)) {
      let fim = i + 1;
      while (fim < codigo.length && /\s/.test(codigo[fim])) fim++;
      empurrar('', codigo.slice(i, fim));
      i = fim;
    } else if (codigo.startsWith('//', i)) {
      let fim = codigo.indexOf('\n', i);
      if (fim === -1) fim = codigo.length;
      empurrar('comentario', codigo.slice(i, fim));
      i = fim;
    } else if (codigo.startsWith('/*', i)) {
      let fim = codigo.indexOf('*/', i + 2);
      fim = fim === -1 ? codigo.length : fim + 2;
      empurrar('comentario', codigo.slice(i, fim));
      i = fim;
    } else if (c === '"' || c === "'" || c === '`') {
      const fim = lerTexto(i);
      empurrar('texto', codigo.slice(i, fim));
      anterior = 'texto';
      i = fim;
    } else if (/\d/.test(c)) {
      let fim = i + 1;
      while (fim < codigo.length && /[\w.]/.test(codigo[fim])) fim++;
      empurrar('valor', codigo.slice(i, fim));
      anterior = '0';
      i = fim;
    } else if (LETRA.test(c)) {
      let fim = i + 1;
      while (fim < codigo.length && PALAVRA.test(codigo[fim])) fim++;
      const palavra = codigo.slice(i, fim);
      if (PALAVRAS.has(palavra)) empurrar('palavra', palavra);
      else if (VALORES.has(palavra)) empurrar('valor', palavra);
      else empurrar('', palavra);
      anterior = PALAVRAS.has(palavra) ? palavra : 'nome';
      i = fim;
    } else if (c === '<' && ABRE_EXPRESSAO.has(anterior) && /[A-Za-z>]/.test(codigo[i + 1] ?? '')) {
      abrirTag();
    } else if (c === '{') {
      topo.chaves++;
      empurrar('', c);
      anterior = '{';
      i++;
    } else if (c === '}') {
      empurrar('', c);
      i++;
      if (topo.chaves > 0) topo.chaves--;
      else if (topo.voltaPara) pilha.pop();
      anterior = '}';
    } else {
      // operadores de dois caracteres contam como um só pro "anterior"
      const dois = codigo.slice(i, i + 2);
      if (['&&', '||', '=>', '==', '!=', '<=', '>='].includes(dois)) {
        empurrar('', dois);
        anterior = dois;
        i += 2;
      } else {
        empurrar('', c);
        anterior = c === ')' || c === ']' ? ')' : c;
        i++;
      }
    }

    // garantia: sempre anda pelo menos um caractere
    if (i === inicio) {
      empurrar('', c);
      i++;
    }
  }
  return pedacos;
}

// mesma coisa, mas separado em linhas (pra marcar linhas no livro)
export function realcarEmLinhas(codigo) {
  const linhas = [[]];
  for (const [tipo, texto] of realcar(codigo)) {
    const partes = texto.split('\n');
    partes.forEach((parte, i) => {
      if (i > 0) linhas.push([]);
      if (parte) linhas[linhas.length - 1].push([tipo, parte]);
    });
  }
  return linhas;
}
