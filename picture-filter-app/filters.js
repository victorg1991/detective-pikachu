function applyFilter(imageData, filter, percentageFn) {
  if (filter === 'grayscale') {
    filterFn = toGrayScale;
  } else if (filter === 'transparency') {
    filterFn = higherTransparency;
  } else if (filter === 'sephia') {
    filterFn = toSephia;
  }

  let percentage = 0;

  const length = imageData.width * imageData.height * 4;

  for (i = 0; i < imageData.width * imageData.height * 4; i += 4) {
    const percentageDone = parseInt((i / length) * 100, 10);

    if (percentageDone - percentage >= 5) {
      percentage = percentageDone;
      percentageFn(percentage);
    }

    const { [i]: r, [i + 1]: g, [i + 2]: b, [i + 3]: a } = imageData.data;

    const [newR, newG, newB, newA] = filterFn(r, g, b, a);

    imageData.data[i] = newR;
    imageData.data[i + 1] = newG;
    imageData.data[i + 2] = newB;
    imageData.data[i + 3] = newA;
  }
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
