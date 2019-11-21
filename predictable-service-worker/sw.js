importScripts('/navigation-data.js');

const CACHE_ID = 'predictable-service-worker-1';

/**
 * @param {string} href
 * @return {boolean} True if the given url is one of the pages
 *  we should be predicting/taking into account.
 */
function isPage(href) {
  const url = new URL(href);

  return (
    url.origin === location.origin &&
    Object.values(PAGES).includes(url.pathname)
  );
}

/**
 * Caches the given URL (if not already cached) and removes
 * not needed pages from memory.
 * @param {string} url
 */
async function cachePage(url) {
  const cache = await caches.open(CACHE_ID);
  const request = new Request(url);

  // TODO keep n last pages
  await Promise.all((await cache.keys()).map((key) => cache.delete(key)));

  if (!(await cache.match(request))) {
    console.log(`Adding to cache ${request.url}`);
    await cache.add(request);
  }
}

/**
 * Tries to match the given request from a cache store
 * or fetchs the request if this is not possible.
 * @param {Request} request
 * @return {Promise<Response>}
 */
async function getPage(request) {
  const cache = await caches.open(CACHE_ID);
  const cachedPage = await cache.match(request);

  if (cachedPage) {
    console.log(`Getting from cache ${request.url}`);
    return cachedPage;
  }

  console.log(`Fetching ${request.url}`);
  return fetch(request);
}

/**
 * Removes/upgrades existing cache objects and
 * create new ones if necessary.
 * @param {InstallEvent} event
 * @return {Promise<void>}
 */
async function initializeCache(event) {
  const deleteCachePromise = caches.delete(CACHE_ID);
  event.waitUntil(deleteCachePromise);
  await deleteCachePromise;
}

/**
 * Tries to predit the next page being visited
 * starting from the given FetchEvent page and
 * updates existing cache stores.
 *
 * A message with the stored page is sent to the
 * event client to tell them that this page has
 * been cached.
 * @param {FetchEvent} event
 * @return {Promise<void>}
 */
async function predictNextPage(event) {
  const { pathname } = new URL(event.request.url);
  const nextPage = NEXT_PAGE_MAP[pathname];

  if (nextPage) {
    await cachePage(nextPage);

    const client = await clients.get(event.clientId);
    client.postMessage(nextPage);
  }
}

/**
 * Responds to the given Request with a cached page
 * or with a real response if not possible.
 * @return {Promise<Response>}
 */
async function respondWithCache(event) {
  // TODO keep current page
  return getPage(event.request);
}

// -
// - Main
// -

self.addEventListener('fetch', async (event) => {
  // We only want to do our things if the fetch
  // is a real page from our domain
  if (isPage(event.request.url)) {
    await respondWithCache(event);
    await predictNextPage(event);
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await initializeCache(event);
      await self.skipWaiting();
      console.log('Service worker installed');
    })(),
  );
});

self.addEventListener('activate', () => {
  self.clients.claim();
  console.log('Service worker active');
});
