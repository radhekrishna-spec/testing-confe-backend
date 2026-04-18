const Confession = require('../models/Confession');

const {
  processFormSubmit,
} = require('../modules/confession/formSubmitService');
const College = require('../models/College');
const {
  createCaptionFlow,
} = require('../modules/confession/helpers/captionBuilderService');

const { checkQueueAndGenerate } = require('../ai/queueWatcher');

const { getEstimatedPostTime } = require('../utils/etaHelper');

exports.createConfession = async ({
  confession,
  type,
  nickname = '',
  song = null,
  collegeId,
  isPaid = false,
  paymentId = null,
  fromAdminUI = false,
  ...extraFields
}) => {
  const college = await College.findOne({ collegeId });

  if (!college) {
    throw new Error('College not found');
  }

  if (college.payment?.enabled && !isPaid) {
    throw new Error(
      `${college.name} ke liye payment required hai. Pehle payment complete karo 💳`,
    );
  }
  const finalType =
    type || (collegeId === 'shayari' ? 'shayari' : 'confession');

  const result = await processFormSubmit({
    confession,
    collegeId,
    fromAdminUI,
    type: finalType,
  });
  // const result = await processFormSubmit({
  //   confession,
  //   collegeId,
  //   fromAdminUI,
  //   type,
  // });

  const confessionNo = result.confessionNo;

  // SINGLE AI CALL FOR ALL
  const aiAssets = await createCaptionFlow(confession, confessionNo, nickname);

  const finalSong =
    song && typeof song === 'object' && (song.title || song.artist)
      ? song
      : aiAssets.song;

  // 🔥 DUPLICATE GUARD (MOST IMPORTANT)
  const existing = await Confession.findOne({
    message: confession,
    collegeId,
    createdAt: { $gt: new Date(Date.now() - 10000) },
  });

  if (existing) {
    console.log('⚠️ DUPLICATE BLOCKED');
    return {
      confessionNo: existing.confessionNo,
      queueAhead: 0,
      eta: null,
      data: existing,
    };
  }

  // 🔥 SAFE UPSERT (NO DUPLICATE EVER)
  const newConfession = await Confession.findOneAndUpdate(
    {
      message: confession,
      collegeId,
    },
    {
      $setOnInsert: {
        collegeId,
        message: confession,
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
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  const queueAhead = await Confession.countDocuments({
    status: 'PENDING',
    confessionNo: { $lt: result.confessionNo },
    collegeId,
  });

  const eta = getEstimatedPostTime(queueAhead);
  // await checkQueueAndGenerate(collegeId, 'user');

  if (false) {
    await checkQueueAndGenerate(collegeId, 'user');
  }

  return {
    confessionNo,
    queueAhead,
    eta,
    data: newConfession,
  };
};
