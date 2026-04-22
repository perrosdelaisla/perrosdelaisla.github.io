// Service Worker — Perros de la Isla
// Estrategia: network-first para archivos propios (HTML/CSS/JS), cache-first para externos

const CACHE_VERSION = 'pdi-v6';
const CACHE_NAME = CACHE_VERSION;

// Archivos propios: siempre intentar red primero, caché como respaldo
const OWN_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  // Forzar activación inmediata del nuevo SW
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OWN_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', event => {
  // Tomar control de las pestañas abiertas y limpiar caches antiguas
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
    ])
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // Archivos propios: network-first (siempre intenta bajar la versión nueva)
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
    // Recursos externos (CDN Leaflet, imgBB, Supabase): cache-first para velocidad
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
