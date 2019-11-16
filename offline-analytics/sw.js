importScripts('/idb.js');

const INDEXED_DB_ID = '1';
const INDEXED_DB_VERSION = 1;

async function storeAnalyticsEvent(name, payload, date = new Date()) {
  const database = await idb.open(INDEXED_DB_ID, INDEXED_DB_VERSION, (db) => {
    db.createObjectStore('events', { autoIncrement: true });
  });

  await idb.add(database, 'events', {
    name,
    payload,
    date,
  });

  database.close();
}

async function shouldSyncAnalytics() {
  // TODO Sync after n minutes
  // TODO Sync if more than n events
  return navigator.onLine;
}

async function syncAnalytics() {
  const database = await idb.open(INDEXED_DB_ID, INDEXED_DB_VERSION);

  const events = await idb.getAll(database, 'events');
  console.log('Events sent to server', events);

  database.close();
  await idb.deleteDatabase(INDEXED_DB_ID);
}

self.addEventListener('install', (event) => {
  event.waitUntil(idb.deleteDatabase(INDEXED_DB_ID));
});

self.addEventListener('message', async (event) => {
  if (event.data) {
    await storeAnalyticsEvent(event.data.name, event.data.payload);

    if (await shouldSyncAnalytics()) {
      await syncAnalytics();
    }
  }
});

// TODO make it work
self.addEventListener('online', async () => {
  if (await shouldSyncAnalytics()) {
    await syncAnalytics();
  }
});
