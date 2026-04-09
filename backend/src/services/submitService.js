const Confession = require('../models/Confession');
const getAISongRecommendation = require('../services/aiSongRecommendation');

const {
  processFormSubmit,
} = require('../modules/confession/formSubmitService');

const { getEstimatedPostTime } = require('../utils/etaHelper');

exports.createConfession = async ({
  message,
  nickname = '',
  song = '',
  collegeId,
  isPaid = false,
  paymentId = null,
  ...extraFields
}) => {
  const result = await processFormSubmit({
    confession: message,
    collegeId,
  });

  console.log('🧪 SUBMIT RESULT:', result);
  console.log('🖼️ IMAGES:', result.images);
  console.log('📏 COUNT:', result.images?.length);

  const confessionNo = result.confessionNo;

  const newConfession = await Confession.create({
    collegeId,
    message,
    nickname,
    song,
    confessionNo,
    status: 'PENDING',
    images: result.images || [],
    caption: result.caption || '',
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

  return {
    confessionNo,
    queueAhead,
    eta,
    data: newConfession,
  };
};
