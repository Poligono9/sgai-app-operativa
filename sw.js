// SGAI — Service Worker de la App Operativa.
// Guarda en caché el cascarón de la app la primera vez que carga
// con internet, y lo sirve desde ahí cuando no hay conexión — así
// la app abre siempre, tenga o no señal. Los datos en sí
// (formularios, evidencia) NO se guardan aquí — eso lo hace
// IndexedDB dentro de la propia página (index.html).
const CACHE_NOMBRE = 'sgai-pwa-v1';
const URL_APP = './index.html';

self.addEventListener('install', function (evento) {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_NOMBRE).then(function (cache) {
      return cache.addAll([URL_APP, './manifest.json', './icon.png']).catch(function () {});
    })
  );
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (evento) {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    fetch(evento.request).then(function (respuesta) {
      var copia = respuesta.clone();
      caches.open(CACHE_NOMBRE).then(function (cache) { cache.put(evento.request, copia); });
      return respuesta;
    }).catch(function () {
      return caches.match(evento.request).then(function (respuestaCache) {
        return respuestaCache || caches.match(URL_APP);
      });
    })
  );
});
