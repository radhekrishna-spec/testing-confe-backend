const store = require('../../../store/store');

const { splitTextSmart } = require('../helpers/splitText');

const { generateSlidesImages } = require('../slides/slidesService');

const {
  uploadImagesToDrive,
} = require('../../../services/ai/google/driveService');

async function regenerateEditedConfession(confessionNo, text, collegeId) {
  if (!collegeId) {
    throw new Error('collegeId is required in regenerateEditedConfession');
  }

  const parts = splitTextSmart(text, 665);

  // ✅ fixed: pass collegeId
  const imageBuffers = await generateSlidesImages(
    parts,
    confessionNo,
    collegeId,
  );

  // ✅ fixed: pass collegeId
  const driveUrls = await uploadImagesToDrive(
    imageBuffers,
    confessionNo,
    collegeId,
  );

  // ✅ fixed: store keys
  store.set(`text_${collegeId}_${confessionNo}`, text);

  store.set(`images_${collegeId}_${confessionNo}`, driveUrls);

  // restore original state
  store.set(`state_${collegeId}_${confessionNo}`, 'APPROVED');

  return {
    success: true,
    confessionNo,
    collegeId,
    images: driveUrls,
  };
}

module.exports = {
  regenerateEditedConfession,
};
