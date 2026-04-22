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
const {
  getNextConfessionNo,
} = require('../modules/confession/services/confessionCounter');

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

  if (!collegeId) {
    throw new Error('collegeId missing');
  }

  if (typeof collegeId !== 'string') {
    throw new Error('invalid collegeId');
  }

  if (college.payment?.enabled && !isPaid) {
    throw new Error(
      `${college.name} ke liye payment required hai. Pehle payment complete karo 💳`,
    );
  }
  const finalType =
    type || (collegeId === 'shayari' ? 'shayari' : 'confession');

  const confessionNo = await getNextConfessionNo(collegeId);
  const finalConfession = confession || extraFields.message;
  const result = await processFormSubmit(
    {
      confession: finalConfession,
      collegeId,
      fromAdminUI,
      type: finalType,
    },
    confessionNo, // 🔥 pass fixed number
  );
  // const result = await processFormSubmit({
  //   confession,
  //   collegeId,
  //   fromAdminUI,
  //   type,
  // });

  // const confessionNo = result.confessionNo;

  // SINGLE AI CALL FOR ALL
  const aiAssets = await createCaptionFlow(
    finalConfession,
    confessionNo,
    nickname,
    collegeId,
  );
  console.log('🔥 SAVED CAPTION:', aiAssets.caption);
  const finalSong =
    song && typeof song === 'object' && (song.title || song.artist)
      ? song
      : null;

  // 🔥 DUPLICATE GUARD (MOST IMPORTANT)
  const existing = await Confession.findOne({
    message: finalConfession,
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
      confessionNo,
      collegeId,
    },
    {
      $setOnInsert: {
        collegeId,
        message: result.text,
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
