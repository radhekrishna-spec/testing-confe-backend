const store = require('../../../store/store');
const {
  buildCaption,
  addEmotionEmoji,
  getSmartHashtags,
} = require('../services/captionService');

const {
  generateConfessionAIAssets,
} = require('../services/confessionAIService');

async function createCaptionFlow(text, confessionNo, nickname = '') {
  let aiAssets = store.get(`ai_assets_${confessionNo}`);

  if (!aiAssets) {
    aiAssets = await generateConfessionAIAssets(text);

    store.set(`ai_assets_${confessionNo}`, aiAssets);
  }

  const aiQuestion = addEmotionEmoji(aiAssets.captionQuestion);

  const hashtags = getSmartHashtags(text);
  const nicknamePrefix = nickname?.trim() ? `👤 ${nickname}\n\n` : '';

  const caption = `${nicknamePrefix}${buildCaption(
    aiQuestion,
    confessionNo,
    hashtags,
  )}`;

  store.set(`caption_${confessionNo}`, caption);
  store.set(`song_${confessionNo}`, aiAssets.song);
  store.set(`comment_${confessionNo}`, aiAssets.adminComment);

  return {
    caption,
    song: aiAssets.song,
    adminComment: aiAssets.adminComment,
  };
}

module.exports = {
  createCaptionFlow,
};
