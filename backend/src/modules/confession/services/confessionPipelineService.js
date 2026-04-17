const { cleanText } = require('../helpers/textCleaner');
const { splitTextSmart } = require('../helpers/splitText');

const { generateSlidesImages } = require('../slides/slidesService');

const {
  uploadImagesToDrive,
} = require('../../../services/ai/google/driveService');

const store = require('../../../store/store');

// ======================
// ✅ FIXED FUNCTION
// ======================
function validateAndPrepareText(data) {
  let raw = data?.confession || '';
  let type = data?.type || 'confession';

  let text = cleanText(raw, type);

  if (!text || !/[a-zA-Z]/.test(text)) {
    throw new Error('Invalid confession text');
  }

  return { text, type }; // 🔥 IMPORTANT FIX
}

// ======================
// ✅ FIXED MAIN FLOW
// ======================
async function processMediaFlow(
  data,
  existingConfessionNo,
  settings,
  collegeId,
) {
  if (!existingConfessionNo) {
    throw new Error('confessionNo is required in processMediaFlow');
  }

  if (!collegeId) {
    throw new Error('collegeId is required in processMediaFlow');
  }

  // 🔥 FIX: extract both text + type
  const { text, type } = validateAndPrepareText(data);

  const confessionNo = existingConfessionNo;

  console.log('🔥 TYPE RECEIVED:', type);
  console.log('🧾 CLEAN TEXT:', JSON.stringify(text));

  const parts = settings.autoSplitParts
    ? splitTextSmart(text, 665, type)
    : [text];

  const imageBuffers = await generateSlidesImages(
    parts,
    confessionNo,
    collegeId,
    type, // 🔥 PASS TYPE
  );

  const driveUrls = await uploadImagesToDrive(
    imageBuffers,
    confessionNo,
    collegeId,
  );

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
