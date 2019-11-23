importScripts('filters.js');

addEventListener('message', (event) => {
  const { chunk, filter } = event.data;

  applyFilter(chunk, filter);

  postMessage(chunk, [chunk.buffer]);
});
