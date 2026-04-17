const { cleanText } = require('../helpers/textCleaner');
const { splitTextSmart } = require('../helpers/splitText');

const { getNextConfessionNo } = require('./confessionCounter');

const { generateSlidesImages } = require('../slides/slidesService');

const {
  uploadImagesToDrive,
} = require('../../../services/ai/google/driveService');

const store = require('../../../store/store');

function validateAndPrepareText(data) {
  let raw = data?.confession || '';
  let text = cleanText(raw);

  if (!text || !/[a-zA-Z]/.test(text)) {
    throw new Error('Invalid confession text');
  }

  return text;
}

async function processMediaFlow(
  text,
  existingConfessionNo,
  settings,
  collegeId,
  type,
) {
  if (!existingConfessionNo) {
    throw new Error('confessionNo is required in processMediaFlow');
  }

  if (!collegeId) {
    throw new Error('collegeId is required in processMediaFlow');
  }

  const confessionNo = existingConfessionNo;

  const parts = settings.autoSplitParts
    ? splitTextSmart(text, 665, type)
    : [text];

  // ✅ fixed: collegeId pass
  const imageBuffers = await generateSlidesImages(
    parts,
    confessionNo,
    collegeId,
  );

  const driveUrls = await uploadImagesToDrive(
    imageBuffers,
    confessionNo,
    collegeId,
  );

  // ✅ fixed: college-wise store keys
  store.set(`images_${collegeId}_${confessionNo}`, driveUrls);

  store.set(`text_${collegeId}_${confessionNo}`, text);

  store.set(`state_${collegeId}_${confessionNo}`, 'CREATED');

  return {
    confessionNo,
    collegeId,
    images: driveUrls,
    telegramImages: imageBuffers,
  };
}

module.exports = {
  validateAndPrepareText,
  processMediaFlow,
};
