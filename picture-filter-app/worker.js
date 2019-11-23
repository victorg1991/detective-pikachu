importScripts('filters.js');

addEventListener('message', (event) => {
  const { imageData, filter } = event.data;

  applyFilter(imageData, filter);

  postMessage(imageData, [imageData.data.buffer]);
});
