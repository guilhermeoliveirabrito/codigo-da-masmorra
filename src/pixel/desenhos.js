// Cada letra é uma cor de paleta.js e ponto é transparente.
// "quadros" são as versões de um desenho animado.

function palpebras(largura, altura, linha, colunas, cor = 's') {
  return Array.from({ length: altura }, (_, y) =>
    Array.from({ length: largura }, (_, x) => (y === linha && colunas.includes(x) ? cor : '.')).join('')
  );
}

export const GUARDA = {
  camadas: [
    [
      '................',
      '.......krk......',
      '......krRrk.....',
      '.....kkkkkk.....',
      '....kwwWwmmk....',
      '...kwwwwwwmnk...',
      '...knnnnnnnnk...',
      '...kmssssssmk...',
      '...kmskssksmk...',
      '...kmssSSssmk...',
      '....kmSSSSmk....',
      '..kkwwkkkkwwkk..',
      '.kwwmmkrrkmmwwk.',
      '.kmmnkrrrrknmmk.',
      '.kskkrrrrrrkksk.',
      '.kskrrryyrrrksk.',
      '..kkrrryyrrrkk..',
      '...kRrrrrrrRk...',
      '...kBBBBBBBBk...',
      '...kRrrrrrrRk...',
      '...knnkkkknnk...',
      '...kmnk..kmnk...',
      '...kmnk..kmnk...',
      '...kBBk..kBBk...',
      '..kBBBk..kBBBk..',
      '..kkkkk..kkkkk..',
    ],
    [
      '..............w.',
      '.............mwm',
      '.............kwk',
      '..............n.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............b.',
      '..............B.',
    ],
  ],
  rosto: [2, 1, 11, 11],
  piscada: palpebras(16, 26, 8, [6, 9]),
};

export const LIA = {
  camadas: [
    [
      '......kkkk......',
      '.....kglggk.....',
      '....kgllgggk....',
      '...kggyyyyggk...',
      '...kgyyyyyygk...',
      '...kgyssssygk...',
      '..ksgskssksgsk..',
      '...kgsssSssgk...',
      '....kGssssGk....',
      '...kGgkkkkgGk...',
      '..kGggbBBbggGk..',
      '.kGgggbbbbgggGk.',
      '.kGggkbbbbkggGk.',
      '.ksGgkbbbbkgGsk.',
      '.kskGkByyBkGksk.',
      '..kkGgbbbbgGkk..',
      '...kGgbbbbgGk...',
      '...kGggggggGk...',
      '...kGGggggGGk...',
      '....kBBkkBBk....',
      '....kBBkkBBk....',
      '....kbBkkbBk....',
      '...kbbBkkbbBk...',
      '...kkkkkkkkkk...',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '..............B.',
      '..............tB',
      '..............tB',
      '..............tB',
      '..............tB',
      '..............tB',
      '..............tB',
      '..............tB',
      '..............B.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  ],
  rosto: [2, 0, 12, 12],
  piscada: palpebras(16, 24, 6, [6, 9]),
};

export const TOM = {
  camadas: [
    [
      '........kk......',
      '.......kpqk.....',
      '......kppqk.....',
      '......kpYpPk....',
      '.....kpppppPk...',
      '....kppppppPPk..',
      '..kPPPPPPPPPPPk.',
      '...kssssssssk...',
      '...kssksskssk...',
      '...kWwsSSswWk...',
      '...kWwwwwwwWk...',
      '..kpkWwwwwWkpk..',
      '.kppkWwwwwWkppk.',
      '.kpppkWwwWkpppk.',
      '.kspppkWWkpppsk.',
      '..kpppyyyypppk..',
      '..kPppppppppPk..',
      '..kPpqppppppPk..',
      '.kPPppqpppppPPk.',
      '.kPPPppppppPPPk.',
      '.kkPPPPPPPPPPkk.',
      '...kkBBkkBBkk...',
      '....kkk..kkk....',
      '................',
    ],
    [
      '................',
      '................',
      '.c..............',
      'cCc.............',
      '.c..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.b..............',
      '.B..............',
      '................',
    ],
  ],
  rosto: [2, 2, 12, 12],
  piscada: palpebras(16, 24, 8, [6, 9]),
};

const SUPORTE_DA_TOCHA = [
  '.kBBBBk.',
  '.kbbbbk.',
  '..kbbk..',
  '..kbbk..',
  'nnkbbknn',
  '..kbbk..',
  '...kk...',
];

export const TOCHA = {
  quadros: [
    [
      [
        '...y....',
        '..yYy...',
        '..yYYy..',
        '.oyWYyo.',
        '.oyWWyo.',
        '.ooyyoo.',
        '..oooo..',
        ...SUPORTE_DA_TOCHA,
      ],
    ],
    [
      [
        '....y...',
        '...yYy..',
        '..yYYy..',
        '.oyYWyo.',
        '.oyWWyo.',
        '.ooyyoo.',
        '..oooo..',
        ...SUPORTE_DA_TOCHA,
      ],
    ],
  ],
};

export const TOCHA_APAGADA = {
  camadas: [
    [
      '........',
      '....n...',
      '...n....',
      '....n...',
      '..kOOk..',
      '.kOBOOk.',
      '..kkkk..',
      ...SUPORTE_DA_TOCHA,
    ],
  ],
};

export const CHAVE = {
  camadas: [
    [
      '.kkk.........',
      'kyYyk........',
      'kY.ykkkkkkkkk',
      'kyyyyyyyyyyyk',
      '.kkkkkkykkyk.',
      '.......kk.kk.',
    ],
  ],
};

export const PEDRA = {
  camadas: [
    [
      '.....kkkkkk.....',
      '...kkwwwmmmkk...',
      '..kwwmmmmmmnnk..',
      '.kmmmmmmmmnnnnk.',
      '.kNmmmmmnnnnNNk.',
      '..kNNnnnnnNNNk..',
      '...kkkkkkkkkk...',
      '..CCccCCCCccCC..',
    ],
  ],
};

export const BAU_FECHADO = {
  camadas: [
    [
      '................',
      '................',
      '..kkkkkkkkkkkk..',
      '.kBbbbbbbbbbbBk.',
      '.kbBBBBBBBBBBbk.',
      'kkkkkkkkkkkkkkkk',
      'kbnnnnnyynnnnnbk',
      'kbBBbBBkkBBbBBbk',
      'kbBBbBByyBBbBBbk',
      'kbBBbBBBBBBbBBbk',
      'kbBBbBBBBBBbBBbk',
      'kkkkkkkkkkkkkkkk',
    ],
  ],
};

export const ALAVANCA_CIMA = {
  camadas: [
    [
      '..kk....',
      '.krrk...',
      '.krRk...',
      '..kmk...',
      '...kmk..',
      '.kknnkk.',
      'kmnNNnmk',
      '.kknnkk.',
      '........',
      '........',
      '........',
      '........',
      '........',
    ],
  ],
};

export const ALAVANCA_BAIXO = {
  camadas: [
    [
      '........',
      '........',
      '........',
      '........',
      '........',
      '.kknnkk.',
      'kmnNNnmk',
      '.kknnkk.',
      '...kmk..',
      '..kmk...',
      '.krrk...',
      '.krRk...',
      '..kk....',
    ],
  ],
};

export const BAU = {
  camadas: [
    [
      '..kkkkkkkkkkkk..',
      '.kBbbbbbbbbbbBk.',
      '.kBnnnnnnnnnnBk.',
      '.kkkkkkkkkkkkkk.',
      '.kyYyYyyYyYyYyk.',
      'kyYyyWyyyyWyyYyk',
      'kkkkkkkkkkkkkkkk',
      'kbBBbBBkkBBbBBbk',
      'kbnnnnnyynnnnnbk',
      'kbBBbBBkkBBbBBbk',
      'kbBBbBBBBBBbBBbk',
      'kkkkkkkkkkkkkkkk',
    ],
  ],
};

export const ICONES = {
  rodar: ['x......', 'xxx....', 'xxxxx..', 'xxxxxxx', 'xxxxx..', 'xxx....', 'x......'],
  cadeado: ['..xxx..', '.x...x.', '.x...x.', 'xxxxxxx', 'xxx.xxx', 'xxx.xxx', 'xxxxxxx'],
  feito: ['.......x', '......xx', '.....xx.', 'x...xx..', 'xx.xx...', '.xxx....', '..x.....'],
  livro: ['.xxx.xxx.', 'x...x...x', 'x...x...x', 'x...x...x', 'x...x...x', 'xxxxxxxxx'],
  web: ['xxxxxxxxx', 'x.......x', 'x.......x', 'x.......x', 'xxxxxxxxx', '....x....', '..xxxxx..'],
  mobile: ['xxxxx', 'x...x', 'x...x', 'x...x', 'x...x', 'xxxxx', 'xx.xx', 'xxxxx'],
  menu: ['xxxxxxx', '.......', 'xxxxxxx', '.......', 'xxxxxxx'],
  voltar: ['...x...', '..xx...', '.xxxxxx', 'xxxxxxx', '.xxxxxx', '..xx...', '...x...'],
  estrela: ['...x...', '...x...', '..xxx..', 'xxxxxxx', '.xxxxx.', '..xxx..', '.xx.xx.', 'x.....x'],
  som: ['...x....', '..xx..x.', 'xxxx...x', 'xxxx.x.x', 'xxxx...x', '..xx..x.', '...x....'],
  mudo: ['...x....', '..xx....', 'xxxx.x.x', 'xxxx..x.', 'xxxx.x.x', '..xx....', '...x....'],
  trofeu: ['xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...', '..xxx..', '.xxxxx.'],
  coracao: ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'],
  cursor: ['x.....', 'xx....', 'xxx...', 'xxxx..', 'xxxxx.', 'xxxx..', 'xxx...', 'xx....', 'x.....'],
  engrenagem: ['...x.x...', '.x.xxx.x.', '..xxxxx..', 'xxxx.xxxx', '.xx...xx.', 'xxxx.xxxx', '..xxxxx..', '.x.xxx.x.', '...x.x...'],
  pergunta: ['.xxxx.', 'xx..xx', '....xx', '...xx.', '..xx..', '..xx..', '......', '..xx..'],
};

// andando de lado, virados pra direita (pra esquerda o css espelha)
// nos quadros de passo o corpo desce 1 pixel
function andando(largura, partes) {
  const vazia = '.'.repeat(largura);
  return partes.map(({ cima, baixo, passo }) => [[...(passo ? [vazia] : []), ...cima, ...baixo]]);
}

const CABECA_DA_LIA = [
  '......kkkk......',
  '.....kgllgk.....',
  '....kgglllgk....',
  '...kGggggyyyk...',
  '...kGgggyyyyyk..',
  '...kGggyysssk...',
  '...kGggysskssk..',
  '...kGGgsssssk...',
  '....kGGksSSk....',
];

const CORPO_DA_LIA = {
  bracoNaFrente: [
    '...kGGgkkkkk....',
    '..kGgggbBgk.....',
    '..kGggbbbggk....',
    '.kGgggbbbkgsk...',
    '.kGggkbbbbkssk..',
    '.kGggkByyBBkk...',
    '..kGgkbbbbk.....',
    '..kGggbbbbk.....',
    '..kGgggggggk....',
    '...kGGgggGGk....',
  ],
  bracoNoMeio: [
    '...kGGgkkkkk....',
    '..kGgggbBBbk....',
    '..kGggbbgggk....',
    '.kGgggbbgggk....',
    '.kGggkbbgggk....',
    '.kGggkByksskk...',
    '..kGgkbbkssk....',
    '..kGggbbbkk.....',
    '..kGgggggggk....',
    '...kGGgggGGk....',
  ],
  bracoAtras: [
    '...kGGgkkkkk....',
    '..kGgggbBBbk....',
    '.kgkggbbbbbk....',
    'kgggkgbbbbbk....',
    'ksskGkbbbbbk....',
    'kssGgkByyBBk....',
    '.kkGgkbbbbk.....',
    '..kGggbbbbk.....',
    '..kGgggggggk....',
    '...kGGgggGGk....',
  ],
};

const PERNAS_DA_LIA = {
  passo: [
    '....kBBkBBk.....',
    '...kBBk.kBBk....',
    '..kbbBk..kbbBk..',
    '..kkkkk..kkkkk..',
  ],
  juntas: [
    '....kBBBBk......',
    '....kBkBBk......',
    '...kOk.kBk......',
    '..kOOk.kbbBk....',
    '..kkk..kkkkk....',
  ],
};

export const LIA_ANDANDO = {
  quadros: andando(16, [
    { cima: [...CABECA_DA_LIA, ...CORPO_DA_LIA.bracoNaFrente], baixo: PERNAS_DA_LIA.passo, passo: true },
    { cima: [...CABECA_DA_LIA, ...CORPO_DA_LIA.bracoNoMeio], baixo: PERNAS_DA_LIA.juntas },
    { cima: [...CABECA_DA_LIA, ...CORPO_DA_LIA.bracoAtras], baixo: PERNAS_DA_LIA.passo, passo: true },
    { cima: [...CABECA_DA_LIA, ...CORPO_DA_LIA.bracoNoMeio], baixo: PERNAS_DA_LIA.juntas },
  ]),
};

const TOM_DE_LADO = [
  '..............c.',
  '..kk.........cCc',
  '.kpqk.........c.',
  '..kpqkk.......B.',
  '...kppqpk.....b.',
  '...kppYppkk...b.',
  '.kPPPPPPPPPPPkb.',
  '....kssssssk..b.',
  '....kssssksk..b.',
  '....kWwsssssk.b.',
  '....kWwwwwwk..b.',
  '...kpWwwwwwwk.b.',
  '..kppkWwwwwk..b.',
  '..kpppkWwwwkksbk',
  '..kpppkkWwkppssk',
];

// o roupão esconde as pernas: só os pés aparecem embaixo
const ROUPAO_DO_TOM = {
  passo: [
    '..kpppyyyyyk..b.',
    '..kPpppppppk..b.',
    '..kPppqppppk..b.',
    '.kPPPppqpppPk.b.',
    '.kPPPPPPPPPPk.B.',
    '.kkBBkkkkBBkk.B.',
    '..kkk....kkk..k.',
    '................',
  ],
  juntas: [
    '..kpppyyyyyk..b.',
    '..kPpppppppk..b.',
    '..kPppqppppk..b.',
    '..kPPppqpppk..b.',
    '...kPPppppPk..b.',
    '...kPPPPPPPk..B.',
    '....kkBBBkk...B.',
    '.....kkkkk....k.',
    '................',
  ],
};

export const TOM_ANDANDO = {
  quadros: andando(16, [
    { cima: TOM_DE_LADO, baixo: ROUPAO_DO_TOM.passo, passo: true },
    { cima: TOM_DE_LADO, baixo: ROUPAO_DO_TOM.juntas },
    { cima: TOM_DE_LADO, baixo: ROUPAO_DO_TOM.passo, passo: true },
    { cima: TOM_DE_LADO, baixo: ROUPAO_DO_TOM.juntas },
  ]),
};

const GUARDA_DE_LADO = [
  '..............w.',
  '.............mwm',
  '.......krk...kwk',
  '......krRrk...n.',
  '.....kkkkkkk..b.',
  '....kwwwWwmmk.b.',
  '...kwwwwwwwmnkb.',
  '...knnnnnnnnnkb.',
  '...knmmsssssk.b.',
  '...knmmssskskkb.',
  '...knmmsssssskb.',
  '....kmmSSSSSk.b.',
  '...kwwmkkkkk..b.',
  '..kwwmmkrrrk..b.',
  '..kmmnkrrrrrk.b.',
  '..kmmnkrrrrrkksk',
  '..kkkkrryyrrkssk',
  '...kkrrryyrrk.b.',
  '...kRrrrrrrRk.b.',
  '...kBBBBBBBBk.b.',
  '...kRrrrrrrRk.b.',
];

const PERNAS_DO_GUARDA = {
  passo: [
    '...knnkkkknk..b.',
    '..kmnk..kmnk..b.',
    '.kBBBk..kBBBk.B.',
    '.kkkkk..kkkkk.B.',
  ],
  juntas: [
    '...knnkkkknk..b.',
    '....kmnkmnk...b.',
    '....kNnkmnk...b.',
    '...kBBkkBBBk..b.',
    '...kkkkkkkkk..B.',
  ],
};

export const GUARDA_ANDANDO = {
  quadros: andando(16, [
    { cima: GUARDA_DE_LADO, baixo: PERNAS_DO_GUARDA.passo, passo: true },
    { cima: GUARDA_DE_LADO, baixo: PERNAS_DO_GUARDA.juntas },
    { cima: GUARDA_DE_LADO, baixo: PERNAS_DO_GUARDA.passo, passo: true },
    { cima: GUARDA_DE_LADO, baixo: PERNAS_DO_GUARDA.juntas },
  ]),
};

// Enfeites das salas, desenhados dentro do fundo da cena
export const ESTANDARTE = {
  camadas: [
    [
      'kmmmmmmmmmmk',
      'kwwwwwwwwwwk',
      '.kRrrrrrrRk.',
      '.kRrrrrrrRk.',
      '.kRrrYYrrRk.',
      '.kRryYYyrRk.',
      '.kRrrYYrrRk.',
      '.kRrrYYrrRk.',
      '.kRryyyyrRk.',
      '.kRrrYYrrRk.',
      '.kRrrrrrrRk.',
      '.kRrrrrrrRk.',
      '.kRrrrrrrRk.',
      '.kRrrRRrrRk.',
      '.kRrRkkRrRk.',
      '.kRRk..kRRk.',
      '.kRk....kRk.',
      '.kk......kk.',
    ],
  ],
};

export const BARRIL = {
  camadas: [
    [
      '..kkkkkkkk..',
      '.kOBBBBBBOk.',
      'kBbbbbbbbbBk',
      'knmmmmmmmmnk',
      'kBbbTbbbbbBk',
      'kBbbTbbbbbBk',
      'kBbbbbbbbbBk',
      'kBbbbbbbbbBk',
      'knmmmmmmmmnk',
      'kBbbbbbbbbBk',
      '.kBbbbbbbBk.',
      '..kkkkkkkk..',
    ],
  ],
};

export const CAIXOTE = {
  camadas: [
    [
      'kkkkkkkkkkkk',
      'kTbbbbbbbbTk',
      'kbkbbbbbbkbk',
      'kbbkbbbbkbbk',
      'kbbbkbbkbbbk',
      'kbbbbkkbbbbk',
      'kbbbkbbkbbbk',
      'kbbkbbbbkbbk',
      'kbkbbbbbbkbk',
      'kTbbbbbbbbTk',
      'kkkkkkkkkkkk',
    ],
  ],
};

export const CORRENTE = {
  camadas: [
    ['.n.', 'n.n', '.n.', '.m.', 'm.m', '.m.', '.n.', 'n.n', '.n.', '.m.', 'm.m', '.m.', '.n.', 'nkn', 'k.k', 'nkn'],
  ],
};

// o gato que passeia pelas salas de vez em quando
export const GATO = {
  quadros: [
    [[
      '.H........k...k',
      'HH........kokok',
      'HH........koook',
      '.HH.......kokok',
      '..kkkkkkkkkooqk',
      '..kooHooHooottk',
      '..kooHooHookkkk',
      '..kottttttok...',
      '..OkkkkkkOkk...',
      '..kk.....kk....',
    ]],
    [[
      '..........k...k',
      '.H........kokok',
      'HH........koook',
      'HH........kokok',
      '.Hkkkkkkkkkooqk',
      '..kooHooHooottk',
      '..kooHooHookkkk',
      '..kottttttok...',
      '..kkOkkkOkkk...',
      '....kk..kk.....',
    ]],
    [[
      '.H........k...k',
      'HH........kokok',
      'HH........koook',
      '.HH.......kokok',
      '..kkkkkkkkkooqk',
      '..kooHooHooottk',
      '..kooHooHookkkk',
      '..kottttttok...',
      '..kOkkkkkkOk...',
      '...kk.....kk...',
    ]],
    [[
      '..........k...k',
      '.H........kokok',
      'HH........koook',
      'HH........kokok',
      '.Hkkkkkkkkkooqk',
      '..kooHooHooottk',
      '..kooHooHookkkk',
      '..kottttttok...',
      '..kkOkkkOkkk...',
      '....kk..kk.....',
    ]],
  ],
};

// fase 8: a gosma que persegue a turma e a ampulheta da grade
export const GOSMA = {
  quadros: [
    [
      [
        '................',
        '................',
        '.....kkkkkk.....',
        '...kkllllllkk...',
        '..klWWlllllllk..',
        '.klWllllllllllk.',
        '.klllkllllklllk.',
        '.klllkllllklllk.',
        '.klllllGGlllllk.',
        'kggggggggggggggk',
        'kGGGGGGGGGGGGGGk',
        '.kkkkkkkkkkkkkk.',
      ],
    ],
    [
      [
        '................',
        '................',
        '................',
        '....kkkkkkkk....',
        '..kkllllllllkk..',
        '.klWWlllllllllk.',
        'klWllkllllkllllk',
        'kllllkllllkllllk',
        'klllllGGlllllllk',
        'kggggggggggggggk',
        'kGGGGGGGGGGGGGGk',
        '.kkkkkkkkkkkkkk.',
      ],
    ],
  ],
};

export const AMPULHETA = {
  quadros: [
    [
      [
        'BbbbbbbbB',
        '.kWyyyyk.',
        '..kyyyk..',
        '...kyk...',
        '...kyk...',
        '..k...k..',
        '.k..y..k.',
        '.kyyyyyk.',
        'BbbbbbbbB',
      ],
    ],
    [
      [
        'BbbbbbbbB',
        '.kWyyyyk.',
        '..kyyyk..',
        '...kyk...',
        '...k.k...',
        '..k.y.k..',
        '.k.....k.',
        '.kyyyyyk.',
        'BbbbbbbbB',
      ],
    ],
  ],
};

// fase 9: o corvo mensageiro, pousado e voando
export const CORVO = {
  camadas: [
    [
      '...kkk......',
      '..kdddk.....',
      'yykdWdk.....',
      '..kdddkk....',
      '..kdndddk...',
      '.kddnnddk...',
      '.kdddnndkk..',
      '..kddddddkk.',
      '...kkdddddkk',
      '....kkkkk.kk',
      '.....y.y....',
    ],
  ],
};

export const CORVO_VOANDO = {
  quadros: [
    [
      [
        '.......kk.......',
        '......kddk......',
        '....kkdnnk......',
        '...kddnnk.......',
        'yykdddkk..kkk...',
        '..kdWddkkkddddk.',
        '...kdddddddddkk.',
        '....kkdddddkk...',
        '......kkkkk.....',
        '................',
      ],
    ],
    [
      [
        '................',
        '................',
        '................',
        '....kkk.........',
        'yykddddkkkkkkk..',
        '..kdWddddddddkk.',
        '...kddnnddddk...',
        '....kdnnnkkk....',
        '.....kdnk.......',
        '......kk........',
      ],
    ],
  ],
};

// fase 10: o Guardião, saindo da caverna
export const DRAGAO = {
  camadas: [
    [
      '..........................................kwkk..............',
      '.........................................kwwmwk.............',
      '........................................kwwmwwk......k......',
      '.......................................kwwmwwk......kwk.....',
      '.......................................kwmwwwk.....kwwwk....',
      '......................................kwmwwwwk...kkwwwwmk...',
      '.....................................kwmwwwwk...kmwwwwmwk...',
      '.................................kkkkkmwwwwmk..kmwwwwmwBBk..',
      '..........................kkkkkkkoooomwwwwmwk.kmwwwBBwkBBk..',
      '....................kkkkkkooooooooooooowwmwkkkmBBwwBBkkBBk..',
      '.................kkkooooooooooooooooooooowwkwmwBBwmBBkBBBBk.',
      '.............kkkkoooooooooooooooooooooooooowmwwBBmBBBBkkkk..',
      '..........kkkooooooooBBooooooooooooooooooooowwBBBBkkkkkrrrk.',
      '........kkrrRrrrrrRrrBBBBBrrrrRrrrrrRrrrrrRrwwwmwrrrrrRrrrk.',
      '.......krrrrrrrrrrrrrrrBBBBBBrrrrrrrrrrrrrrrwwmwrrrrrrrrrrk.',
      '......krrrrrrrrrrrrrrrrrrrBBBBBrrrrrrrrrrrrrrmwrrrrrrrrrrrk.',
      '.....krrrrrrrrrrrrrrrrrrYYkWYBBrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '....krrrrrRrrrrrRrrrrrRyYYkYYrrrrrRrrrrrRrrrrrRrrrrrRrrrrrk.',
      '...krrkkrrrrrrrrrrrrrrryYYkYYrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '..krrrrkrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRRBBBBBk.',
      '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRBBBBBk.',
      '.kRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrRRRRBRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '...kRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRBBBBBBk',
      '...kRROOOOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '....kRRRRRWRRROWOOOOOOOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '.....kRRRRRRRRRRRRRRWRRRRWROOOWOOOORRRRRRRRRRRRRRRRRRBBBBBBk',
      '......kRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBBBBBBBk',
      '.......kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRTTRRRRRRRRRRRRRBBBBBBk',
      '........kkkRRRRRRRRRRRRRRRRRRRRRRTTTTTTTRRRRRRRRRRRRRBBBBBBk',
      '...........kkkkkRRRRRRRRRRRRRRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '................kkkkkRRRRRBRRRSSSSSSSSSSSRRRBRRRRRBRRBBBBBBk',
      '.....................kkkkkkkkRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '............................kRTTTTTTTTTTTTRRRRRRRRRRRBBBBBBk',
      '............................kRRSSSSSSSSSSSRRRRRRRRRRRBBBBBBk',
      '............................kRBTTTTTTTTTTTBRRRRRBRRRRBBBBBBk',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRSSSSSSSSSSSSRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTTRRBRRRRRBBBBBBBB',
      '...........................kRRRSSSSSSSSSSSSSRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTTRRRRRRRRBBBBBBB',
      '...........................kRRRRSSSSSSSSSSSSSRRRRRBRRBBBBBBB',
    ],
  ],
};

export const DRAGAO_DORMINDO = {
  camadas: [
    [
      '..........................................kwkk..............',
      '.........................................kwwmwk.............',
      '........................................kwwmwwk......k......',
      '.......................................kwwmwwk......kwk.....',
      '.......................................kwmwwwk.....kwwwk....',
      '......................................kwmwwwwk...kkwwwwmk...',
      '.....................................kwmwwwwk...kmwwwwmwk...',
      '.................................kkkkkmwwwwmk..kmwwwwmwBBk..',
      '..........................kkkkkkkoooomwwwwmwk.kmwwwBBwkBBk..',
      '....................kkkkkkooooooooooooowwmwkkkmBBwwBBkkBBk..',
      '.................kkkooooooooooooooooooooowwkwmwBBwmBBkBBBBk.',
      '.............kkkkoooooooooooooooooooooooooowmwwBBmBBBBkkkk..',
      '..........kkkooooooooBBooooooooooooooooooooowwBBBBkkkkkrrrk.',
      '........kkrrRrrrrrRrrBBBBBrrrrRrrrrrRrrrrrRrwwwmwrrrrrRrrrk.',
      '.......krrrrrrrrrrrrrrrBBBBBBrrrrrrrrrrrrrrrwwmwrrrrrrrrrrk.',
      '......krrrrrrrrrrrrrrrrrrrBBBBBrrrrrrrrrrrrrrmwrrrrrrrrrrrk.',
      '.....krrrrrrrrrrrrrrrrrrrrrrrBBrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '....krrrrrRrrrrrRrrrrrBBBBBBBBrrrrRrrrrrRrrrrrRrrrrrRrrrrrk.',
      '...krrkkrrrrrrrrrrrrrrBrrrrrrBrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '..krrrrkrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRRBBBBBk.',
      '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRBBBBBk.',
      '.kRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrRRRRBRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '...kRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRBBBBBBk',
      '...kRROOOOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '....kRRRRRWRRROWOOOOOOOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '.....kRRRRRRRRRRRRRRWRRRRWROOOWOOOORRRRRRRRRRRRRRRRRRBBBBBBk',
      '......kRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBBBBBBBk',
      '.......kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRTTRRRRRRRRRRRRRBBBBBBk',
      '........kkkRRRRRRRRRRRRRRRRRRRRRRTTTTTTTRRRRRRRRRRRRRBBBBBBk',
      '...........kkkkkRRRRRRRRRRRRRRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '................kkkkkRRRRRBRRRSSSSSSSSSSSRRRBRRRRRBRRBBBBBBk',
      '.....................kkkkkkkkRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '............................kRTTTTTTTTTTTTRRRRRRRRRRRBBBBBBk',
      '............................kRRSSSSSSSSSSSRRRRRRRRRRRBBBBBBk',
      '............................kRBTTTTTTTTTTTBRRRRRBRRRRBBBBBBk',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRSSSSSSSSSSSSRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTTRRBRRRRRBBBBBBBB',
      '...........................kRRRSSSSSSSSSSSSSRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTTRRRRRRRRBBBBBBB',
      '...........................kRRRRSSSSSSSSSSSSSRRRRRBRRBBBBBBB',
    ],
  ],
};

export const DRAGAO_BRAVO = {
  camadas: [
    [
      '..........................................kwkk..............',
      '.........................................kwwmwk.............',
      '........................................kwwmwwk......k......',
      '.......................................kwwmwwk......kwk.....',
      '.......................................kwmwwwk.....kwwwk....',
      '......................................kwmwwwwk...kkwwwwmk...',
      '.....................................kwmwwwwk...kmwwwwmwk...',
      '.................................kkkkkmwwwwmk..kmwwwwmwBBk..',
      '..........................kkkkkkkoooomwwwwmwk.kmwwwBBwkBBk..',
      '....................kkkkkkooooooooooooowwmwkkkmBBwwBBkkBBk..',
      '.................kkkooooooooooooooooooooowwkwmwBBwmBBkBBBBk.',
      '.............kkkkoooooooooooooooooooooooooowmwwBBmBBBBkkkk..',
      '..........kkkooooooooBBooooooooooooooooooooowwBBBBkkkkkrrrk.',
      '........kkrrRrrrrrRrrBBBBBrrrrRrrrrrRrrrrrRrwwwmwrrrrrRrrrk.',
      '.......krrrrrrrrrrrrrrrBBBBBBrrrrrrrrrrrrrrrwwmwrrrrrrrrrrk.',
      '......krrrrrrrrrrrrrrrrrrrBBBBBrrrrrrrrrrrrrrmwrrrrrrrrrrrk.',
      '.....krrrrrrrrrrrrrrrrrrYYkWYBBrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '....krrrrrRrrrrrRrrrrrRyYYkYYrrrrrRrrrrrRrrrrrRrrrrrRrrrrrk.',
      '...krrkkrrrrrrrrrrrrrrryYYkYYrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
      '..krrrrkrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRRBBBBBk.',
      '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrRRRRRRRBBBBBk.',
      '.kRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrrrrrRrRRRRBRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '..kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '...kRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRRBRRRRBBBBBBk',
      '....kOOOOOOOOOOOOOOOkkkkRRRRRRRRRRRRRRRRRRRRRRRRRRRRRBBBBBBk',
      '....kOOOOOWOOOOWOOOOWOOOOWOOOOWOOOORRRRRRRRRRRRRRRRRRBBBBBBk',
      '....kOOOOOWOOOOWOOOOWOOOOWOOOOWOOOORRRRRRRRRRRRRRRRRRBBBBBBk',
      '....kOOOOOqqWqqqqWqqqqWqqqOWOOOOWOORRRRRBRRRRRBRRRRRBBBBBBBk',
      '....kOOOOOOqqqqqqqqqqqqqqRRRRRRRRRRRRRTTRRRRRRRRRRRRRBBBBBBk',
      '....kRRRRRRRRRRRRRRRRRRRRRRRRRRRRTTTTTTTRRRRRRRRRRRRRBBBBBBk',
      '.....kRRRRRRRRRRRRRRRRRRRRRRRRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '......kRBRRRRRBRRRRRBRRRRRBRRRSSSSSSSSSSSRRRBRRRRRBRRBBBBBBk',
      '.......kRRRRRRRRRRRRRRRRRRRRRRTTTTTTTTTTTRRRRRRRRRRRRBBBBBBk',
      '........kkkkRRRRRRRRRRRRRRRRRRTTTTTTTTTTTTRRRRRRRRRRRBBBBBBk',
      '............kkkkkkkkRRRRRRRRkRRSSSSSSSSSSSRRRRRRRRRRRBBBBBBk',
      '....................kkkkkkkkkRBTTTTTTTTTTTBRRRRRBRRRRBBBBBBk',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRSSSSSSSSSSSSRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTRRRRRRRRRRBBBBBBB',
      '............................kRRTTTTTTTTTTTTTRRBRRRRRBBBBBBBB',
      '...........................kRRRSSSSSSSSSSSSSRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTRRRRRRRRRBBBBBBB',
      '...........................kRRRRTTTTTTTTTTTTTRRRRRRRRBBBBBBB',
      '...........................kRRRRSSSSSSSSSSSSSRRRRRBRRBBBBBBB',
    ],
  ],
};
