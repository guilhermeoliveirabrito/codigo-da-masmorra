// timers e fetch que o código do jogador usa
// na cena são de verdade; nos testes o tempo só anda quando o teste manda

export function criarRelogio() {
  let agora = 0;
  let proximoId = 1;
  let erro = null;
  const tarefas = new Map();
  const criados = { timeout: 0, intervalo: 0 };

  function agendar(funcao, ms, repetir, argumentos) {
    if (typeof funcao !== 'function') return 0;
    const id = proximoId++;
    const espera = Math.max(repetir ? 1 : 0, Number(ms) || 0);
    tarefas.set(id, { quando: agora + espera, espera, repetir, funcao: () => funcao(...argumentos) });
    return id;
  }

  const ambiente = {
    setTimeout(funcao, ms, ...argumentos) {
      criados.timeout += 1;
      return agendar(funcao, ms, false, argumentos);
    },
    setInterval(funcao, ms, ...argumentos) {
      criados.intervalo += 1;
      return agendar(funcao, ms, true, argumentos);
    },
    clearTimeout: (id) => tarefas.delete(id),
    clearInterval: (id) => tarefas.delete(id),
  };

  // roda tudo que venceria até lá, em ordem; "rodar" deixa o teste embrulhar cada chamada
  function avancar(ms, rodar = (funcao) => funcao()) {
    const fim = agora + ms;
    for (let voltas = 0; voltas < 20_000; voltas++) {
      let proxima = null;
      for (const [id, tarefa] of tarefas) {
        if (tarefa.quando <= fim && (!proxima || tarefa.quando < proxima[1].quando)) proxima = [id, tarefa];
      }
      if (!proxima) break;
      const [id, tarefa] = proxima;
      agora = tarefa.quando;
      if (tarefa.repetir) tarefa.quando += tarefa.espera;
      else tarefas.delete(id);
      try {
        rodar(tarefa.funcao);
      } catch (e) {
        erro ??= e;
      }
    }
    agora = fim;
  }

  return {
    ambiente,
    avancar,
    criados,
    pendentes: () => tarefas.size,
    get erro() {
      return erro;
    },
  };
}

function resposta(rotas, url) {
  const caminho = String(url);
  const achou = Object.hasOwn(rotas, caminho);
  const corpo = JSON.parse(JSON.stringify(achou ? rotas[caminho] : { erro: 'não encontrado' }));
  return {
    ok: achou,
    status: achou ? 200 : 404,
    url: caminho,
    json: () => Promise.resolve(corpo),
    text: () => Promise.resolve(JSON.stringify(corpo)),
  };
}

// servidor de mentira; sem atraso, a resposta espera o teste chamar entregar()
// limite: depois de tantos pedidos o corvo cansa e não volta mais
export function criarServidor(rotas, { atraso = null, limite = Infinity, aoPedir, aoResponder, agendar = setTimeout } = {}) {
  const pedidos = [];
  const esperando = [];
  let desligado = false;

  function fetch(url) {
    pedidos.push(String(url));
    aoPedir?.(String(url));
    return new Promise((resolver) => {
      if (pedidos.length > limite) return;
      const entregar = () => {
        if (desligado) return;
        const pronta = resposta(rotas, url);
        aoResponder?.(pronta);
        resolver(pronta);
      };
      if (atraso === null) esperando.push(entregar);
      else agendar(entregar, atraso);
    });
  }

  return {
    fetch,
    pedidos,
    entregar: () => esperando.splice(0).forEach((entregar) => entregar()),
    desligar: () => {
      desligado = true;
    },
  };
}

// timers de verdade, mas anotados: quando roda de novo ou sai da fase, o jogo limpa tudo
// (um intervalo esquecido pelo jogador não fica rodando pra sempre)
export function criarAmbienteDaCena({ rotas = {}, atraso = 1500 } = {}) {
  const timers = new Set();
  const ouvintes = new Set();
  const avisar = (evento) => ouvintes.forEach((ouvinte) => ouvinte(evento));

  const servidor = criarServidor(rotas, {
    atraso,
    limite: 6,
    aoPedir: (url) => avisar({ tipo: 'pedido', url }),
    aoResponder: (pronta) => avisar({ tipo: 'resposta', ok: pronta.ok, url: pronta.url }),
    agendar: (funcao, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        funcao();
      }, ms);
      timers.add(id);
    },
  });

  const ambiente = {
    setTimeout(funcao, ms, ...argumentos) {
      const id = window.setTimeout(
        (...valores) => {
          timers.delete(id);
          if (typeof funcao === 'function') funcao(...valores);
        },
        ms,
        ...argumentos
      );
      timers.add(id);
      return id;
    },
    setInterval(funcao, ms, ...argumentos) {
      const id = window.setInterval((...valores) => typeof funcao === 'function' && funcao(...valores), ms, ...argumentos);
      timers.add(id);
      return id;
    },
    clearTimeout(id) {
      window.clearTimeout(id);
      timers.delete(id);
    },
    clearInterval(id) {
      window.clearInterval(id);
      timers.delete(id);
    },
    fetch: servidor.fetch,
  };

  return {
    ambiente,
    ouvir(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    limpar() {
      servidor.desligar();
      timers.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
      timers.clear();
      ouvintes.clear();
    },
  };
}
