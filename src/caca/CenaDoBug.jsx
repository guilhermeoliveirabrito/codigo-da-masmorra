import { useCallback, useEffect, useRef, useState } from 'react';
import { Cena, Tela, posicao } from '../components/Cenario';
import { criarAmbienteDaCena } from '../motor/ambiente';
import { carregarMotor } from '../motor/carregarMotor';
import { pegarComponente } from '../motor/componente';
import { BUGADO, BUGADO_BRAVO } from '../pixel/desenhos';
import { Sprite } from '../pixel/Sprite';

// o que o goblin Bugado diz em cada situação
export const FALAS = {
  oi: 'Hehe! Quebrei a masmorra toda. Duvido você consertar!',
  novo: ['Hehe, quebrei esse aqui!', 'Duvido você achar o erro.', 'Esse eu caprichei.', 'Mexi só numa coisinha...', 'Esse tá impossível.'],
  conserto: ['Nãaao! Meu bug!', 'Sorte de principiante.', 'Hmpf. Esse era fácil.', 'Como você achou?!', 'Eu ia consertar mesmo...'],
  combo: ['Para de consertar tudo!', 'Você tá rápido demais!', 'Isso não é justo!'],
  pulo: ['Desistiu? Hehehe!', 'Fugiu do bug!', 'Esse fica pra depois, né?'],
  erro: ['Errou! Hehe.', 'Quase... só que não.', 'Ainda quebrado!', 'Tenta de novo!'],
};

export const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

// o goblin fala; o "vez" muda a cada fala pra ele dar um pulinho de novo
export function useGoblin(primeira = FALAS.oi) {
  const [goblin, setGoblin] = useState({ fala: primeira, bravo: false, vez: 0 });
  const falar = useCallback((fala, bravo = false) => setGoblin((atual) => ({ fala, bravo, vez: atual.vez + 1 })), []);
  return [goblin, falar];
}

// roda o código só pra mostrar no painel como ele está (quebrado ou não)
export function useTelaDoBug(modo) {
  const [tela, setTela] = useState(null);
  const cenarioRef = useRef(null);

  useEffect(() => () => cenarioRef.current?.limpar(), []);

  const mostrar = useCallback(
    async (codigo, bug) => {
      cenarioRef.current?.limpar();
      const cenario = criarAmbienteDaCena({ rotas: bug.rotas });
      cenarioRef.current = cenario;
      try {
        const { executar } = await carregarMotor();
        const modulo = executar(codigo, modo, new Set(), { aoErroEmEvento: () => {}, ambiente: cenario.ambiente });
        const { Componente } = pegarComponente(modulo, bug.componente);
        setTela(Componente ? { Componente, vez: Date.now() } : null);
      } catch {
        setTela(null);
      }
    },
    [modo]
  );

  return [tela, mostrar];
}

// o painel onde aparece o componente que o goblin quebrou
function Painel() {
  return (
    <g>
      <rect x={7} y={7} width={102} height={56} fill="#181425" />
      <rect x={8} y={8} width={100} height={54} fill="#5a6988" />
      <rect x={8} y={8} width={100} height={1} fill="#8b9bb4" />
      <rect x={8} y={8} width={1} height={54} fill="#8b9bb4" />
      <rect x={11} y={11} width={94} height={48} fill="#181425" />
      <rect x={30} y={63} width={2} height={17} fill="#262b44" />
      <rect x={84} y={63} width={2} height={17} fill="#262b44" />
    </g>
  );
}

export function CenaDoBug({ modo, bug, tela, goblin, ganho }) {
  return (
    <Cena tochas={[134, 178]} fundo={<Painel />}>
      <Tela modo={modo} vazio="quebrado" className="painel__tela caca__tela" style={posicao(12, 12, 92, 46)}>
        {tela && <tela.Componente key={tela.vez} {...(bug?.props ?? {})} />}
      </Tela>
      <div className="bugado" style={{ ...posicao(158, 78, 16, 21), '--meio': '4.17cqw' }}>
        <Sprite
          key={`goblin-${goblin.vez}`}
          desenho={goblin.bravo ? BUGADO_BRAVO : BUGADO}
          titulo="Bugado, o goblin"
          className="bugado__sprite"
        />
        {goblin.fala && (
          <span key={`fala-${goblin.vez}`} className="balao balao--direita">
            {goblin.fala}
          </span>
        )}
        {ganho && (
          <span key={ganho.vez} className="caca__ganho" aria-hidden="true">
            {ganho.texto}
          </span>
        )}
      </div>
    </Cena>
  );
}
