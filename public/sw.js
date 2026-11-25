// Guarda o jogo no aparelho pra abrir mesmo sem internet.
// A página sempre tenta a versão nova primeiro; o resto (scripts, fontes, ícones) vem do cache.
const CACHE = 'masmorra-v1';
const ESSENCIAIS = ['./', './index.html', './manifest.webmanifest', './icones/icone-192.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ESSENCIAIS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((nome) => nome !== CACHE).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim())
  );
});

function guardar(pedido, resposta) {
  if (resposta.ok || resposta.type === 'opaque') {
    const copia = resposta.clone();
    caches.open(CACHE).then((cache) => cache.put(pedido, copia));
  }
  return resposta;
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    evento.respondWith(
      fetch(request)
        .then((resposta) => guardar(request, resposta))
        .catch(() => caches.match(request).then((salvo) => salvo || caches.match('./index.html')))
    );
    return;
  }

  const ehDoJogo = url.origin === self.location.origin;
  const ehFonte = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!ehDoJogo && !ehFonte) return;

  evento.respondWith(
    caches.match(request).then((salvo) => salvo || fetch(request).then((resposta) => guardar(request, resposta)))
  );
});
