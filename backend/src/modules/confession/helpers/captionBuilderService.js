const store = require('../../../store/store');
const College = require('../../../models/College');
const {
  buildCaption,
  addEmotionEmoji,
  getSmartHashtags,
  generateAIQuestion,
  generateFallbackQuestion,
} = require('../services/captionService');

const { generateAIConfession } = require('../services/confessionAIService');

async function createCaptionFlow(text, confessionNo, nickname = '', collegeId) {
  const college = await College.findOne({ collegeId });
  const pageName = college?.instagram?.pageName;
  let aiAssets = store.get(`ai_assets_${confessionNo}`);

  if (!aiAssets) {
    aiAssets = {
      song: '',
      adminComment: '',
    };

    store.set(`ai_assets_${confessionNo}`, aiAssets);
  }

  const aiQuestion = await generateAIQuestion(text);

  const question = aiQuestion || generateFallbackQuestion(text);

  const finalQuestion = addEmotionEmoji(question);

  const hashtags = getSmartHashtags(text);

  const nicknamePrefix = nickname?.trim() ? `👤 ${nickname}\n\n` : '';

  const caption = `${nicknamePrefix}${buildCaption(
    finalQuestion,
    confessionNo,
    hashtags,
    pageName,
  )}`;
  //console.log('🔥 CAPTION GENERATED:', caption);

  store.set(`caption_${confessionNo}`, caption);
  store.set(`song_${confessionNo}`, aiAssets?.song || '');
  store.set(`comment_${confessionNo}`, aiAssets?.adminComment || '');

  return {
    caption,
    song: aiAssets?.song || '',
    adminComment: aiAssets?.adminComment || '',
  };
}

module.exports = {
  createCaptionFlow,
};
