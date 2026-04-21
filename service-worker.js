const CACHE_NAME = 'perros-isla-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
];

// Instalación: cachea los archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activación: limpia caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first para HTML/CSS/JS (así los usuarios reciben cambios rápido),
// cache-first para recursos externos como Leaflet
self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Solo GET
  if (event.request.method !== 'GET') return;

  // Network-first para archivos propios de la app
  if (url.includes('index.html') || url.endsWith('/') || url.includes('styles.css') || url.includes('app.js') || url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si va bien, actualiza el cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first para el resto (CDN, tiles del mapa, imágenes de Supabase)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // No cacheamos tiles de mapa (son muchos y cambian por zoom)
        if (url.includes('tile.openstreetmap') || url.includes('tile.opentopomap') || url.includes('basemaps.cartocdn') || url.includes('arcgisonline')) {
          return fetchResponse;
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
