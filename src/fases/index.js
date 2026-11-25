import { fasePlaca } from './01-placa';
import { faseCrachas } from './02-crachas';
import { faseAlavanca } from './03-alavanca';
import { faseTocha } from './04-tocha';
import { fasePortoes } from './05-portoes';
import { fasePonte } from './06-ponte';
import { faseRio } from './07-rio';

export const fases = [fasePlaca, faseCrachas, faseAlavanca, faseTocha, fasePortoes, fasePonte, faseRio];

// aparecem no mapa como "em breve"
export const proximasFases = [
  { numero: 8, titulo: 'A porta que fecha sozinha', conceito: 'useEffect' },
  { numero: 9, titulo: 'O mensageiro', conceito: 'API' },
  { numero: 10, titulo: 'O guardião', conceito: 'tudo junto' },
];
