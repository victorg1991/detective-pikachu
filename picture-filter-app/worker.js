self.addEventListener('message', (event) => {
  const { imageData, filter } = event.data;

  let filterFn;

  if (filter === 'grayscale') {
    filterFn = toGrayScale;
  } else if (filter === 'transparency') {
    filterFn = higherTransparency;
  } else if (filter === 'sephia') {
    filterFn = toSephia;
  }

  applyFilter(imageData, filterFn);
});

function applyFilter(imageData, filter) {
  const pixelLength = imageData.width * imageData.height * 4;
  let percentage = 0;

  for (i = 0; i < pixelLength; i += 4) {
    const { [i]: r, [i + 1]: g, [i + 2]: b, [i + 3]: a } = imageData.data;

    const percentageDone = parseInt((i / pixelLength) * 100, 10);

    if (percentageDone - percentage >= 5) {
      percentage = percentageDone;

      self.postMessage({ percentage: percentageDone });
    }

    const [newR, newG, newB, newA] = filter(r, g, b, a);

    imageData.data[i] = newR;
    imageData.data[i + 1] = newG;
    imageData.data[i + 2] = newB;
    imageData.data[i + 3] = newA;
  }

  self.postMessage(imageData, [imageData.data.buffer]);
}

function toGrayScale(r, g, b, a) {
  const avg = (r + g + b) / 3;

  return [avg, avg, avg, a];
}

function higherTransparency(r, g, b, a) {
  const newA = a / 2;

  return [r, g, b, newA];
}

function toSephia(r, g, b, a) {
  const newR = r * 0.393 + g * 0.769 + b * 0.189;
  const newG = r * 0.349 + g * 0.686 + b * 0.168;
  const newB = r * 0.272 + g * 0.534 + b * 0.131;

  return [newR, newG, newB, a];
}
