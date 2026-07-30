// Predictor - service-worker.js
const cacheName = 'SHARPI predictor pro';
const assets = [
  '.', // The index.html file
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Install Event - Cache the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(assets);
      })
      .then(() => {
        console.log('[Service Worker] Cache is ready.');
        // Skip the waiting phase to immediately activate the new service worker
        return self.skipWaiting();
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== cacheName) {
              console.log('[Service Worker] Removing old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients for', cacheName);
        return self.clients.claim();
      })
  );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a cached response for this request, return it.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, try to fetch from the network.
        return fetch(event.request)
          .then(networkResponse => {
            // Optional: Cache the fetched response for next time.
            // We'll be simple for now.
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, show a simple offline page.
            // We can return a simple fallback response here if needed.
            console.warn('[Service Worker] Network request failed, and no cache available.');
            // Return a basic offline message, or a custom offline.html.
            return new Response('You are offline. Please check your internet connection.', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
