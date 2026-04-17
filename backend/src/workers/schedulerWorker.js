const store = require('../store/store');
const Confession = require('../models/Confession');
const { moveFileToFolder } = require('../services/ai/google/driveService');
const { updateTelegramButtons } = require('../services/telegramUpdateService');
const { postToInstagram } = require('../modules/social/instagramService');
const { checkQueueAndGenerate } = require('../ai/queueWatcher');
const College = require('../models/College');
const AITrainingConfession = require('../models/AITrainingConfession');

// ======================
// TIME LOGIC
// ======================
function getPostTimes(queueCount) {
  if (queueCount <= 3) return [9, 15, 21];
  if (queueCount <= 6) return [9, 12, 14, 17, 20, 23];
  return [7, 9, 11, 13, 15, 17, 19, 21, 23];
}

function getRandomMinuteForHour(dateKey, hour) {
  const key = `RANDOM_MINUTE_${dateKey}_${hour}`;

  let minute = store.get(key);

  if (minute === undefined || minute === null) {
    minute = Math.floor(Math.random() * 10) + 1;
    store.set(key, minute);
  }

  return minute;
}

// ======================
// QUEUE COUNT
// ======================
async function getApprovedQueueCount() {
  return await Confession.countDocuments({ status: 'APPROVED' });
}

// ======================
// GET NEXT CONFESSION
// ======================
async function getNextApprovedConfession() {
  return await Confession.findOne({
    status: 'APPROVED',
  }).sort({ confessionNo: 1 });
}

// ======================
// MAIN POST FLOW
// ======================
async function processApprovedQueue() {
  const confession = await getNextApprovedConfession();

  if (!confession) {
    console.log('❌ NO APPROVED CONFESSION');
    return;
  }

  const confessionNo = confession.confessionNo;

  // 🔥 LOCK FIX
  if (store.get(`posting_${confessionNo}`)) {
    console.log('⚠️ ALREADY POSTING, SKIP');
    return;
  }

  const images = confession.images || [];
  const caption = confession.caption || '';

  console.log(`🚀 PROCESSING CONFESSION: ${confessionNo}`);

  if (!images.length) {
    await Confession.updateOne(
      { confessionNo },
      {
        status: 'FAILED',
        failureReason: 'No images found',
      },
    );
    return;
  }

  try {
    store.set(`posting_${confessionNo}`, '1');

    await Confession.updateOne({ confessionNo }, { status: 'POSTING' });

    console.log('📤 POSTING TO INSTAGRAM...');

    await postToInstagram(images, caption, confession.collegeId);

    console.log('✅ INSTAGRAM POSTED');

    const fileIds = store.get(`fileIds_${confessionNo}`) || [];

    for (const fileId of fileIds) {
      await moveFileToFolder(fileId, 'posted');
    }

    await Confession.updateOne(
      { confessionNo },
      {
        status: 'POSTED',
        postedTime: new Date(),
      },
    );

    // 🔥 TELEGRAM FIX (IMPORTANT)
    const tgMsgId = store.get(`telegram_msg_${confessionNo}`);

    const college = await College.findOne({
      collegeId: confession.collegeId,
    });

    const chatId = college?.telegram?.chatId;

    if (chatId && tgMsgId) {
      await updateTelegramButtons(
        chatId,
        tgMsgId,
        'posted',
        confessionNo,
        confession.collegeId,
      );
    } else {
      console.log('⚠️ TELEGRAM UPDATE SKIPPED');
    }

    console.log(`🚀 SUCCESS: #${confessionNo} POSTED`);
  } catch (error) {
    console.error('❌ POST FAILED:', error.message);

    await Confession.updateOne(
      { confessionNo },
      {
        status: 'FAILED',
        failureReason: error.message,
      },
    );
  } finally {
    store.delete(`posting_${confessionNo}`);
  }
}

// ======================
// AI QUEUE REFILL
// ======================
async function refillLowQueues() {
  const colleges = await College.find({ isActive: true });

  for (const college of colleges) {
    const visibleKey = `AI_VISIBLE_COUNT_${college.collegeId}`;
    let visibleCount = Number(store.get(visibleKey)) || 0;

    if (visibleCount < 3) {
      console.log(`⚠️ LOW AI QUEUE: ${college.collegeId}`);
      await checkQueueAndGenerate(college.collegeId, 'scheduler');
      store.set(visibleKey, 3);
    }
  }
}

// ======================
// WORKER START
// ======================
async function startSchedulerWorker() {
  console.log('🚀 Scheduler worker started');

  await refillLowQueues();

  setInterval(async () => {
    try {
      const next = await getNextApprovedConfession();

      if (next) {
        await processApprovedQueue();
      }
    } catch (error) {
      console.error('❌ SCHEDULER ERROR:', error.message);
    }
  }, 15000); // 🔥 SAFE INTERVAL

  setInterval(refillLowQueues, 30 * 60 * 1000);
}

module.exports = {
  startSchedulerWorker,
  processApprovedQueue,
};
