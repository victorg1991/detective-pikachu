importScripts('/idb.js');

const CACHED_ASSETS = ['/', '/bulma.min.css', '/sw.js', '/idb.js'];
const CACHE_ID = 'offline-analytics-1';
const INDEXED_DB_ID = 'offline-analytics-1';
const INDEXED_DB_VERSION = 1;
const SYNC_ENTRY_COUNT = 5;

function eventToString({ date, name, payload }) {
  return `${date.toLocaleTimeString()} ${name} ${payload}`;
}

function createSchema(db) {
  db.createObjectStore('events', { autoIncrement: true });
}

async function storeEvent(event) {
  const database = await idb.open(
    INDEXED_DB_ID,
    INDEXED_DB_VERSION,
    createSchema,
  );

  console.log('Add event to database', eventToString(event));
  await idb.add(database, 'events', event);
  database.close();
}

async function shouldSyncEvents() {
  if (navigator.onLine) {
    const database = await idb.open(
      INDEXED_DB_ID,
      INDEXED_DB_VERSION,
      createSchema,
    );

    const entryCount = (await idb.getAll(database, 'events')).length;
    database.close();
    return entryCount >= SYNC_ENTRY_COUNT;
  }

  return false;
}

async function syncEvents() {
  const database = await idb.open(
    INDEXED_DB_ID,
    INDEXED_DB_VERSION,
    createSchema,
  );

  const events = await idb.getAll(database, 'events');

  console.group('Events sent to server');
  events.forEach((event) => console.log(eventToString(event)));
  console.groupEnd();

  database.close();
  await idb.deleteDatabase(INDEXED_DB_ID);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_ID);
      await Promise.all(CACHED_ASSETS.map((asset) => cache.add(asset)));
      await idb.deleteDatabase(INDEXED_DB_ID);
      await self.skipWaiting();
      console.log('Service worker installed');
    })(),
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
  console.log('Service worker active');
});

self.addEventListener('fetch', (event) => {
  console.log(event.request.url);

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_ID);
      const cachedAsset = await cache.match(event.request);
      return cachedAsset || fetch(event.request);
    })(),
  );
});

self.addEventListener('message', async ({ data }) => {
  if (data.type === 'event') await storeEvent(data.payload);
  if (await shouldSyncEvents()) await syncEvents();
});
