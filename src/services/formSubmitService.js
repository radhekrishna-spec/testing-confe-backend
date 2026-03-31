const { cleanText } = require('../utils/textCleaner');
const { splitTextSmart } = require('../utils/splitText');
const { generateSlidesImages } = require('./slidesService');
const { uploadImagesToDrive } = require('./driveService');
const { sendTelegram } = require('./telegramService');
const { buildCaption } = require('./captionService');
const { getNextConfessionNo } = require('../utils/confessionCounter');

async function processFormSubmit(data) {
  let raw = data.confession || '';

  let text = cleanText(raw);

  if (!/[a-zA-Z]/.test(text)) {
    throw new Error('Invalid confession text');
  }

  const confessionNo = await getNextConfessionNo();

  const parts = splitTextSmart(text, 300);

  const imageBuffers = await generateSlidesImages(parts, confessionNo);

  const driveUrls = await uploadImagesToDrive(imageBuffers, confessionNo);

  const caption = buildCaption(text, confessionNo);

  await sendTelegram(driveUrls, caption, confessionNo);

  return {
    confessionNo,
    images: driveUrls,
  };
}

module.exports = { processFormSubmit };
