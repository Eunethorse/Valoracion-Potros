/* Valoración de potros · CENRE – Yeguada Cartuja · EUnetHorse
   Service worker: permite usar la app sin conexión tras abrirla una vez. */
const CACHE = 'valoracion-potros-v2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;               // los envíos a la hoja (POST) no pasan por la caché
  const url = new URL(req.url);
  const put = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; };
  if (url.origin === self.location.origin) {
    // la propia app: primero red (para recibir actualizaciones), si no hay, caché
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
  } else if (/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com/.test(url.host)) {
    // fuentes y librería de Excel: caché primero
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(put)));
  }
});
