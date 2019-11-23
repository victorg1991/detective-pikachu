importScripts('/idb.js');

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
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
