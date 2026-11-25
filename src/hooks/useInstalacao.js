import { useEffect, useState } from 'react';

function estaInstalado() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

// Botão de instalar no celular (Android/Chrome) e a dica de como fazer no iPhone
export function useInstalacao() {
  const [pedido, setPedido] = useState(null);
  const [instalado, setInstalado] = useState(estaInstalado);

  useEffect(() => {
    function aoOferecer(evento) {
      evento.preventDefault();
      setPedido(evento);
    }
    function aoInstalar() {
      setInstalado(true);
      setPedido(null);
    }
    window.addEventListener('beforeinstallprompt', aoOferecer);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoOferecer);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!pedido) return;
    pedido.prompt();
    await pedido.userChoice;
    setPedido(null);
  }

  // dentro de um iframe (por exemplo, numa página incorporada) não dá pra instalar
  const naJanelaPrincipal = window.top === window.self;
  const ehIphone = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  return {
    podeInstalar: Boolean(pedido),
    mostrarDicaDoIphone: ehIphone && naJanelaPrincipal && !instalado,
    instalado,
    instalar,
  };
}
