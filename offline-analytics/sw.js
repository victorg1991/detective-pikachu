importScripts('/idb.js');

const CACHE_ID = 'offline-analytics-1';
const CACHED_ASSETS = ['/', '/bulma.min.css', '/idb.js', '/sw.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete(CACHE_ID);
      const cache = await caches.open(CACHE_ID);
      await cache.addAll(CACHED_ASSETS);
      await self.skipWaiting();
      console.log('SW installed');
    })(),
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
  console.log('SW activated');
});

self.addEventListener('message', (event) => {
  console.log(event.data);
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_ID);
      const cachedResponse = await cache.match(event.request);
      return cachedResponse || fetch(event.request);
    })(),
  );
});
