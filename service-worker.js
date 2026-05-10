// Service Worker — Paseos Seguros (iniciativa de Perros de la Isla)
// Estrategia: network-first para archivos propios (HTML/CSS/JS), cache-first para externos
const CACHE_VERSION = 'pdi-v43';
const CACHE_NAME = CACHE_VERSION;
const OWN_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/logo-paseos-seguros.png',
  './assets/logo-paseos-seguros-icon.png'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OWN_ASSETS).catch(() => {}))
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
    ])
  );
});
// Paths que pertenecen a Paseos Seguros. Cualquier path
// fuera de esta lista se delega al navegador (return sin
// event.respondWith) para no interferir con otras apps
// del mismo dominio (/clases/, /hola/, etc.).
function esRutaDePaseos(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  const PATHS_OTRAS_APPS = ['/clases/', '/hola/', '/admin/'];
  if (PATHS_OTRAS_APPS.some(p => path.startsWith(p))) {
    return false;
  }
  return true;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // ⚠️ FILTRO CRÍTICO: si la URL es del mismo origen pero pertenece
  // a otra app del dominio (Clases, Victoria, admin), no respondemos
  // y dejamos que el navegador la maneje como si el SW no existiera.
  if (!esRutaDePaseos(url) && url.origin === self.location.origin) {
    return;
  }
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin) {
    event.respondWith(
      fetch(req)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
  } else {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(response => {
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
          }
          return response;
        }).catch(() => cached);
      })
    );
  }
});
