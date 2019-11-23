importScripts('/idb.js');

const DB_ID = 'offline-analytics';
const DB_VERSION = 1;
const CACHE_ID = 'offline-analytics-1';
const CACHED_ASSETS = ['/', '/bulma.min.css', '/idb.js', '/sw.js'];

function openDatabase() {
  return idb.open(DB_ID, DB_VERSION, (db) => {
    db.createObjectStore('events', { autoIncrement: true });
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete(CACHE_ID);
      const cache = await caches.open(CACHE_ID);
      await cache.addAll(CACHED_ASSETS);
      await idb.deleteDatabase(DB_ID);
      await self.skipWaiting();
      console.log('SW installed');
    })(),
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
  console.log('SW activated');
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.name) {
    const db = await openDatabase();
    await idb.add(db, 'events', event.data);
    db.close();
  }

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
