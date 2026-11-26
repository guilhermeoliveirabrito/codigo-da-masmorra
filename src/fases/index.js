import { fasePlaca } from './01-placa';
import { faseCrachas } from './02-crachas';
import { faseAlavanca } from './03-alavanca';
import { faseTocha } from './04-tocha';
import { fasePortoes } from './05-portoes';
import { fasePonte } from './06-ponte';
import { faseRio } from './07-rio';
import { fasePorta } from './08-porta';
import { faseMensageiro } from './09-mensageiro';
import { faseGuardiao } from './10-guardiao';

export const fases = [
  fasePlaca,
  faseCrachas,
  faseAlavanca,
  faseTocha,
  fasePortoes,
  fasePonte,
  faseRio,
  fasePorta,
  faseMensageiro,
  faseGuardiao,
];

// aparecem no mapa como "em breve"
export const proximasFases = [];
