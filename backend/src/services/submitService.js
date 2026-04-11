const Confession = require('../models/Confession');

const {
  processFormSubmit,
} = require('../modules/confession/formSubmitService');

const {
  createCaptionFlow,
} = require('../modules/confession/helpers/captionBuilderService');

const { checkQueueAndGenerate } = require('../ai/queueWatcher');

const { getEstimatedPostTime } = require('../utils/etaHelper');

exports.createConfession = async ({
  message,
  nickname = '',
  song = null,
  collegeId,
  isPaid = false,
  paymentId = null,
  fromAdminUI = false,
  ...extraFields
}) => {
  const result = await processFormSubmit({
    confession: message,
    collegeId,
    fromAdminUI,
  });

  const confessionNo = result.confessionNo;

  // SINGLE AI CALL FOR ALL
  const aiAssets = await createCaptionFlow(message, confessionNo, nickname);

  const finalSong =
    song && typeof song === 'object' && (song.title || song.artist)
      ? song
      : aiAssets.song;

  const newConfession = await Confession.create({
    collegeId,
    message,
    nickname,
    song: finalSong,
    confessionNo,
    status: 'PENDING',
    images: result.images || [],
    caption: aiAssets.caption || result.caption || '',
    adminComment: aiAssets.adminComment || '',
    isPaid,
    paymentId,
    extraFields,
  });

  const queueAhead = await Confession.countDocuments({
    status: 'PENDING',
    confessionNo: { $lt: result.confessionNo },
    collegeId,
  });

  const eta = getEstimatedPostTime(queueAhead);
  // await checkQueueAndGenerate(collegeId, 'user');

  try {
    await checkQueueAndGenerate(collegeId, 'user');
  } catch (error) {
    console.error('AI queue generation failed:', error.message);
  }

  return {
    confessionNo,
    queueAhead,
    eta,
    data: newConfession,
  };
};
