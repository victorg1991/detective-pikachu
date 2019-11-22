self.addEventListener('message', (event) => {
  const { chunk, filter, index } = event.data;

  let filterFn;

  if (filter === 'grayscale') {
    filterFn = toGrayScale;
  } else if (filter === 'transparency') {
    filterFn = higherTransparency;
  } else if (filter === 'sephia') {
    filterFn = toSephia;
  }

  applyFilter(chunk, filterFn, index);
});

function applyFilter(chunk, filter, index) {
  for (i = 0; i < chunk.length; i += 4) {
    const { [i]: r, [i + 1]: g, [i + 2]: b, [i + 3]: a } = chunk;

    // const percentageDone = parseInt((i / pixelLength) * 100, 10);

    // if (percentageDone - percentage >= 5) {
    //   percentage = percentageDone;

    //   self.postMessage({ percentage: percentageDone });
    // }

    const [newR, newG, newB, newA] = filter(r, g, b, a);

    chunk[i] = newR;
    chunk[i + 1] = newG;
    chunk[i + 2] = newB;
    chunk[i + 3] = newA;
  }

  self.postMessage({ chunk, index });
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
