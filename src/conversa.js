import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { conquistar } from './conquistas';
import { tocar } from './som';

// o que cada um responde quando alguém clica nele
const PAPO = {
  guarda: [
    'Trinta anos nessa porta e nunca tirei férias.',
    'Sem crachá, sem conversa.',
    'Tô de olho em você, hein.',
    'Essa lança? É de verdade. Quase sempre.',
    'Isso aí que você escreve é feitiço?',
    'Meu turno acaba às seis. Da manhã.',
    'Cutucar o guarda dá multa. Vou deixar passar dessa vez.',
  ],
  lia: [
    'Calma, a gente resolve.',
    'Se o erro fala da linha 3, começa pela linha 3.',
    'Acerto um alvo a cem metros. Ponto e vírgula, às vezes.',
    'O Tom já se perdeu três vezes hoje. E é ele que tem o mapa.',
    'Ei! Isso faz cócegas.',
    'Uma flecha de cada vez. Uma linha de cada vez.',
  ],
  tom: [
    'No meu tempo, a gente programava com pena e tinta.',
    'Já tentou desligar e ligar a masmorra de novo?',
    'Minha barba guarda segredos. E migalhas.',
    'Estou meditando. Ou dormindo. É difícil saber.',
    'Um mago nunca se atrasa. O código é que demora pra rodar.',
    'Perdi meu chapéu. Ah, tá na cabeça.',
    'Se der erro, culpa o ponto e vírgula. Ele não se defende.',
  ],
};

// o que dizem quando o código dá erro ou fica quase certo
const REACOES = {
  erro: {
    guarda: ['Hah! Isso aí quebrou bonito.', 'Nem precisei usar a lança.', 'Lê a mensagem vermelha. Ela não morde.'],
    lia: ['Respira. Lê a mensagem com calma.', 'Errar faz parte. A segunda flecha acerta.', 'Vamos de novo, agora devagar.'],
    tom: ['Interessante... a masmorra não gostou.', 'Erro é só o código pedindo atenção.', 'Isso já aconteceu comigo. Ontem. Quatro vezes.'],
  },
  quase: {
    guarda: ['Quase. Mas quase não abre porta.', 'Tá chegando lá, vai.'],
    lia: ['Tá quase! Falta um detalhe.', 'Tá no caminho certo.'],
    tom: ['Sinto que é por pouco.', 'Quase! Lê com calma o que deu errado.'],
  },
};

export const ContextoDaConversa = createContext(null);

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
let cutucadas = 0;

// elenco: quem está na sala; o valor vai no ContextoDaConversa, em volta da cena
export function useConversa(elenco) {
  const [fala, setFala] = useState(null);
  const ultima = useRef(null);

  useEffect(() => {
    if (!fala) return;
    const espera = setTimeout(() => setFala(null), 2200 + fala.texto.length * 30);
    return () => clearTimeout(espera);
  }, [fala]);

  const dizer = useCallback((quem, opcoes, comSom = true) => {
    const novas = opcoes.filter((texto) => texto !== ultima.current);
    const texto = sortear(novas.length ? novas : opcoes);
    ultima.current = texto;
    setFala({ quem, texto, id: Math.random() });
    if (comSom) tocar('fala');
    return { quem, texto };
  }, []);

  const cutucar = useCallback(
    (quem) => {
      dizer(quem, PAPO[quem] ?? ['...']);
      cutucadas += 1;
      if (cutucadas === 10) conquistar('tagarela');
    },
    [dizer]
  );

  const reagir = useCallback(
    (tipo) => {
      const presentes = elenco.filter((quem) => REACOES[tipo]?.[quem]);
      if (!presentes.length) return null;
      const quem = sortear(presentes);
      return dizer(quem, REACOES[tipo][quem], false);
    },
    [dizer, elenco]
  );

  const valor = useMemo(() => ({ fala, cutucar }), [fala, cutucar]);
  return { valor, reagir };
}
