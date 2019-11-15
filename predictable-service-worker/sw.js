const CACHE_ID = '1';

const PAGES = {
  aardvark: '/pages/page-aardvark.html',
  ant: '/pages/page-ant.html',
  bear: '/pages/page-bear.html',
  bee: '/pages/page-bee.html',
  bird: '/pages/page-bird.html',
  butterfly: '/pages/page-butterfly.html',
  carp: '/pages/page-carp.html',
  cat: '/pages/page-cat.html',
  chicken: '/pages/page-chicken.html',
  dog: '/pages/page-dog.html',
  dolphin: '/pages/page-dolphin.html',
  donkey: '/pages/page-donkey.html',
  eagle: '/pages/page-eagle.html',
  elephant: '/pages/page-elephant.html',
  fish: '/pages/page-fish.html',
  frog: '/pages/page-frog.html',
  giraffe: '/pages/page-giraffe.html',
  goat: '/pages/page-goat.html',
  hamster: '/pages/page-hamster.html',
  hen: '/pages/page-hen.html',
  human: '/pages/page-human.html',
  insect: '/pages/page-insect.html',
  lion: '/pages/page-lion.html',
  lizard: '/pages/page-lizard.html',
  lynx: '/pages/page-lynx.html',
  mammal: '/pages/page-mammal.html',
  monkey: '/pages/page-monkey.html',
  narwhal: '/pages/page-narwhal.html',
  octopus: '/pages/page-octopus.html',
  otter: '/pages/page-otter.html',
  owl: '/pages/page-owl.html',
  ox: '/pages/page-ox.html',
  panda: '/pages/page-panda.html',
  penguin: '/pages/page-penguin.html',
  pig: '/pages/page-pig.html',
  rabbit: '/pages/page-rabbit.html',
  rinho: '/pages/page-rinho.html',
  shark: '/pages/page-shark.html',
  snail: '/pages/page-snail.html',
  snake: '/pages/page-snake.html',
  spider: '/pages/page-spider.html',
  tiger: '/pages/page-tiger.html',
  unicorn: '/pages/page-unicorn.html',
  vulture: '/pages/page-vulture.html',
  worm: '/pages/page-worm.html',
  zebra: '/pages/page-zebra.html',
};

const NEXT_PAGE_MAP = {
  [PAGES.cat]: PAGES.dog,
  [PAGES.dog]: PAGES.unicorn,
};

function isPage(page) {
  const url = new URL(page);

  return (
    url.origin === location.origin &&
    Object.values(PAGES).includes(url.pathname)
  );
}

async function cachePage(url) {
  const cache = await caches.open(CACHE_ID);
  const request = new Request(url);

  await Promise.all((await cache.keys()).map((key) => cache.delete(key)));

  if (!(await cache.match(request))) {
    await cache.add(request);
  }
}

async function getPage(request) {
  const cache = await caches.open(CACHE_ID);
  const cachedPage = await cache.match(request);

  if (cachedPage) {
    return cachedPage;
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return fetch(request);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      history = [];
      await caches.delete(CACHE_ID);
    })(),
  );
});

self.addEventListener('fetch', async (event) => {
  if (isPage(event.request.url)) {
    const page = getPage(event.request);
    event.respondWith(page);
    await page;

    const { pathname } = new URL(event.request.url);
    const nextPage = NEXT_PAGE_MAP[pathname];

    if (nextPage) {
      await cachePage(nextPage);

      const client = await clients.get(event.clientId);
      client.postMessage(nextPage);
    }
  }
});
