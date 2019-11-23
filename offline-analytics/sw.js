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
  const db = await openDatabase();

  if (event.data && event.data.payload) {
    await idb.add(db, 'events', event.data.payload);
  }

  console.log(event.data);

  const events = await idb.getAll(db, 'events');

  if (navigator.onLine && events.length >= 5) {
    console.group('Sending events to backend');
    events.forEach((event) =>
      console.log(event.date.toLocaleTimeString(), event.name, event.payload),
    );
    console.groupEnd();

    db.close();
    await idb.deleteDatabase(DB_ID);
  } else {
    db.close();
  }
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
