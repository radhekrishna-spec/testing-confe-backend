async function generateSlidesImages(parts, confessionNo) {
  const images = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    const imageBuffer = await createSlidePNG(part, confessionNo, i + 1);

    images.push(imageBuffer);
  }

  return images;
}

module.exports = { generateSlidesImages };
