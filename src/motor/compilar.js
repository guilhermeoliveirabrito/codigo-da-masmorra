import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import { ErroDoJogo, traduzirErroDeSintaxe } from './erros';

const ParserComJSX = Parser.extend(jsx());

// Transforma JSX, import e export em JS comum, pra rodar com new Function.
// <p>Olá</p> vira __h(linha, "p", null, "Olá")
export function compilar(codigo) {
  let ast;
  try {
    ast = ParserComJSX.parse(codigo, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    });
  } catch (erro) {
    throw new ErroDoJogo(traduzirErroDeSintaxe(erro, codigo));
  }

  const trocas = []; // pedaços do código original que vão ser substituídos
  const exportados = []; // pares [nome exportado, nome dentro do arquivo]
  const declarados = []; // funções e variáveis criadas no topo do arquivo

  for (const no of ast.body) {
    declarados.push(...nomesDeclarados(no.declaration ?? no));

    if (no.type === 'ImportDeclaration') {
      trocas.push({ inicio: no.start, fim: no.end, texto: gerarImport(no) });
    } else if (no.type === 'ExportNamedDeclaration') {
      if (no.declaration) {
        // tira só o export, a declaração fica
        trocas.push({ inicio: no.start, fim: no.declaration.start, texto: '' });
        for (const nome of nomesDeclarados(no.declaration)) exportados.push([nome, nome]);
      } else {
        // export { A, B as C }
        trocas.push({ inicio: no.start, fim: no.end, texto: '' });
        for (const s of no.specifiers) exportados.push([s.exported.name, s.local.name]);
      }
    } else if (no.type === 'ExportDefaultDeclaration') {
      const decl = no.declaration;
      const temNome =
        (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') && decl.id;
      trocas.push({
        inicio: no.start,
        fim: decl.start,
        texto: temNome ? '' : 'const __padrao = ',
      });
      exportados.push(['default', temNome ? decl.id.name : '__padrao']);
    }
  }

  const raizesJSX = acharJSX(ast);
  for (const raiz of raizesJSX) {
    const original = codigo.slice(raiz.start, raiz.end);
    trocas.push({
      inicio: raiz.start,
      fim: raiz.end,
      texto: manterLinhas(gerarJSX(raiz, codigo), original),
    });
  }

  // cada volta de loop passa pelo __guarda, que interrompe um loop infinito em vez
  // de travar a aba. Os loops que estão dentro de JSX entram pelo trecho().
  trocas.push(...guardasDosLacos(ast, raizesJSX));

  // de trás pra frente pra não bagunçar as posições
  ordenarTrocas(trocas);
  let js = codigo;
  for (const troca of trocas) {
    js = js.slice(0, troca.inicio) + troca.texto + js.slice(troca.fim);
  }

  const listaExportados = exportados
    .map(([nome, local]) => `${JSON.stringify(nome)}: ${local}`)
    .join(', ');
  const listaDeclarados = [...new Set(declarados)]
    .map((nome) => `${JSON.stringify(nome)}: ${nome}`)
    .join(', ');

  return `${js}\nreturn { exportados: { ${listaExportados} }, declarados: { ${listaDeclarados} } };`;
}

function nomesDeclarados(no) {
  if (!no) return [];
  if ((no.type === 'FunctionDeclaration' || no.type === 'ClassDeclaration') && no.id) {
    return [no.id.name];
  }
  if (no.type === 'VariableDeclaration') {
    return no.declarations.filter((d) => d.id.type === 'Identifier').map((d) => d.id.name);
  }
  return [];
}

function gerarImport(no) {
  const modulo = JSON.stringify(no.source.value);
  const linha = no.loc.start.line;
  const partes = [];
  const nomes = [];

  for (const s of no.specifiers) {
    if (s.type === 'ImportSpecifier') {
      nomes.push([s.imported.name, s.local.name]);
    } else if (s.type === 'ImportDefaultSpecifier') {
      partes.push(`const ${s.local.name} = __importar(${modulo}, ${linha}, ["default"]).default;`);
    } else {
      partes.push(`const ${s.local.name} = __importar(${modulo}, ${linha}, []);`);
    }
  }

  if (nomes.length) {
    const chaves = nomes.map(([nome, local]) => (nome === local ? nome : `${nome}: ${local}`));
    const lista = JSON.stringify(nomes.map(([nome]) => nome));
    partes.push(`const { ${chaves.join(', ')} } = __importar(${modulo}, ${linha}, ${lista});`);
  }
  if (!partes.length) partes.push(`__importar(${modulo}, ${linha}, []);`);

  return partes.join(' ');
}

const LACOS = ['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement'];

// do fim pro começo; na mesma posição, a troca de um trecho vem antes da inserção,
// assim o que é inserido fica na frente do trecho trocado
function ordenarTrocas(trocas) {
  return trocas.sort((a, b) => b.inicio - a.inicio || (a.inicio === a.fim) - (b.inicio === b.fim));
}

function guardasDosLacos(raiz, raizesJSX) {
  const dentroDeJSX = (no) => raizesJSX.some((jsx) => no.start >= jsx.start && no.end <= jsx.end);
  const trocas = [];
  for (const laco of acharLacos(raiz)) {
    if (dentroDeJSX(laco)) continue;
    const corpo = laco.body;
    const guarda = `__guarda(${laco.loc.start.line});`;
    if (corpo.type === 'BlockStatement') {
      trocas.push({ inicio: corpo.start + 1, fim: corpo.start + 1, texto: guarda });
    } else {
      trocas.push({ inicio: corpo.start, fim: corpo.start, texto: `{ ${guarda} ` });
      trocas.push({ inicio: corpo.end, fim: corpo.end, texto: ' }' });
    }
  }
  return trocas;
}

function acharLacos(raiz) {
  const lacos = [];
  function visitar(no) {
    if (!no || typeof no.type !== 'string') return;
    if (LACOS.includes(no.type)) lacos.push(no);
    for (const chave of Object.keys(no)) {
      if (chave === 'loc') continue;
      const valor = no[chave];
      if (Array.isArray(valor)) valor.forEach(visitar);
      else if (valor && typeof valor === 'object') visitar(valor);
    }
  }
  visitar(raiz);
  return lacos;
}

// só os JSX de fora; os de dentro são gerados junto
function acharJSX(raiz) {
  const achados = [];

  function visitar(no) {
    if (!no || typeof no.type !== 'string') return;
    if (no.type === 'JSXElement' || no.type === 'JSXFragment') {
      achados.push(no);
      return;
    }
    for (const chave of Object.keys(no)) {
      if (chave === 'loc') continue;
      const valor = no[chave];
      if (Array.isArray(valor)) valor.forEach(visitar);
      else if (valor && typeof valor === 'object') visitar(valor);
    }
  }

  visitar(raiz);
  return achados;
}

// código de uma expressão de dentro do JSX, com o JSX interno gerado e os loops guardados
function trecho(no, codigo) {
  const internos = acharJSX(no);
  const trocas = [
    ...internos.map((j) => ({ inicio: j.start, fim: j.end, texto: gerarJSX(j, codigo) })),
    ...guardasDosLacos(no, internos),
  ];
  let texto = codigo.slice(no.start, no.end);
  for (const t of ordenarTrocas(trocas)) {
    texto = texto.slice(0, t.inicio - no.start) + t.texto + texto.slice(t.fim - no.start);
  }
  return `(${texto})`;
}

function gerarJSX(no, codigo) {
  const linha = no.loc.start.line;
  const filhos = gerarFilhos(no.children, codigo);

  if (no.type === 'JSXFragment') {
    return `__h(${linha}, __Fragment, null${filhos})`;
  }

  const abertura = no.openingElement;
  const tipo = gerarNomeDaTag(abertura.name);
  const props = gerarProps(abertura.attributes, codigo);
  return `__h(${linha}, ${tipo}, ${props}${filhos})`;
}

function nomeComPonto(nome) {
  if (nome.type === 'JSXIdentifier') return nome.name;
  return `${nomeComPonto(nome.object)}.${nome.property.name}`;
}

// minúscula é tag do HTML, maiúscula é componente
function gerarNomeDaTag(nome) {
  if (nome.type === 'JSXIdentifier') {
    return /^[a-z]/.test(nome.name) || nome.name.includes('-')
      ? JSON.stringify(nome.name)
      : nome.name;
  }
  if (nome.type === 'JSXMemberExpression') return nomeComPonto(nome);
  return JSON.stringify(`${nome.namespace.name}:${nome.name.name}`);
}

function gerarProps(atributos, codigo) {
  if (!atributos.length) return 'null';

  const partes = atributos.map((atributo) => {
    if (atributo.type === 'JSXSpreadAttribute') return `...${trecho(atributo.argument, codigo)}`;
    const nome =
      atributo.name.type === 'JSXNamespacedName'
        ? `${atributo.name.namespace.name}:${atributo.name.name.name}`
        : atributo.name.name;
    return `${JSON.stringify(nome)}: ${gerarValor(atributo.value, codigo)}`;
  });

  return `{ ${partes.join(', ')} }`;
}

function gerarValor(valor, codigo) {
  if (valor === null) return 'true'; // <button disabled> é o mesmo que disabled={true}
  if (valor.type === 'Literal') return JSON.stringify(valor.value);
  if (valor.type === 'JSXExpressionContainer') {
    return valor.expression.type === 'JSXEmptyExpression'
      ? 'undefined'
      : trecho(valor.expression, codigo);
  }
  return gerarJSX(valor, codigo);
}

function gerarFilhos(filhos, codigo) {
  const partes = [];
  for (const filho of filhos) {
    if (filho.type === 'JSXText') {
      const texto = limparTexto(filho.value);
      if (texto) partes.push(JSON.stringify(texto));
    } else if (filho.type === 'JSXExpressionContainer') {
      if (filho.expression.type !== 'JSXEmptyExpression') {
        partes.push(trecho(filho.expression, codigo));
      }
    } else if (filho.type === 'JSXSpreadChild') {
      partes.push(`...${trecho(filho.expression, codigo)}`);
    } else {
      partes.push(gerarJSX(filho, codigo));
    }
  }
  return partes.map((parte) => `, ${parte}`).join('');
}

// mesma regra de espaços do Babel
function limparTexto(texto) {
  const linhas = texto.split(/\r\n|\n|\r/);
  let ultimaComTexto = 0;
  linhas.forEach((linha, i) => {
    if (/[^ \t]/.test(linha)) ultimaComTexto = i;
  });

  let resultado = '';
  linhas.forEach((linha, i) => {
    let parte = linha.replace(/\t/g, ' ');
    if (i !== 0) parte = parte.replace(/^ +/, '');
    if (i !== linhas.length - 1) parte = parte.replace(/ +$/, '');
    if (parte) {
      if (i !== ultimaComTexto) parte += ' ';
      resultado += parte;
    }
  });
  return resultado;
}

// completa as linhas pra numeração dos erros continuar batendo
function manterLinhas(gerado, original) {
  const faltam = original.split('\n').length - gerado.split('\n').length;
  return faltam > 0 ? gerado + '\n'.repeat(faltam) : gerado;
}
