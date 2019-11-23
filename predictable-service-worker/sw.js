importScripts('/navigation-data.js');

const CACHE_ID = 'predictable-service-worker-1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
      await caches.delete(CACHE_ID);
      console.log('SW installed');
    })(),
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
  console.log('SW activated');
});

self.addEventListener('fetch', (event) => {
  const { pathname } = new URL(event.request.url);

  if (Object.values(PAGES).includes(pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_ID);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          console.log(pathname, 'from cache');
        } else {
          console.log(pathname, 'from server');
        }

        return cachedResponse || fetch(event.request);
      })(),
    );
  }
});
