const CACHE_NAME = 'gamepal-v3';

const STATIC_ASSETS = [
  '/GAMEPAL/',
  '/GAMEPAL/index.html',
  '/GAMEPAL/app.js',
  '/GAMEPAL/manifest.json',
  '/GAMEPAL/icons/icon-192.png',
  '/GAMEPAL/icons/icon-512.png',
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
         return caches.match('/GAMEPAL/index.html');
        }
        return caches.match(event.request);
      })
  );
});
