importScripts('filters.js');

addEventListener('message', (event) => {
  const { imageData, filter } = event.data;

  applyFilter(imageData, filter, (percentage) => {
    postMessage({ percentage });
  });

  postMessage(imageData, [imageData.data.buffer]);
});
