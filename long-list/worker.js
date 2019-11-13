self.importScripts('fuse.js');

self.addEventListener('message', (e) => {
  const { data, search } = e.data;

  const options = {
    keys: ['name', 'email'],
  };
  const fuse = new Fuse(data, options);
  const filteredList = fuse.search(search).slice(0, 10);

  self.postMessage({ filteredList });
});
