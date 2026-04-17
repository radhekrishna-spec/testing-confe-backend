const store = require('../store/store');
const Confession = require('../models/Confession');
const { moveFileToFolder } = require('../services/ai/google/driveService');
const { updateTelegramButtons } = require('../services/telegramUpdateService');
const { postToInstagram } = require('../modules/social/instagramService');
const { checkQueueAndGenerate } = require('../ai/queueWatcher');
const College = require('../models/College');
const AITrainingConfession = require('../models/AITrainingConfession');

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    minute = Math.floor(Math.random() * 10) + 1; // 1–10
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
// SHOULD POST NOW
// ======================
async function shouldPostNow() {
  const now = new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    }),
  );

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const queueCount = await getApprovedQueueCount();

  console.log('🧠 SHOULD POST CHECK');
  console.log('⏰ TIME:', currentHour, currentMinute);
  console.log('📦 QUEUE COUNT:', queueCount);

  if (!queueCount) return false;

  const postHours = getPostTimes(queueCount);

  console.log('📅 POST HOURS:', postHours);

  if (!postHours.includes(currentHour)) return false;

  const todayKey = now.toDateString();
  const randomMinute = getRandomMinuteForHour(todayKey, currentHour);

  console.log('🎯 RANDOM MINUTE:', randomMinute);

  // 🔥 3 min window (stable)
  if (currentMinute < randomMinute || currentMinute > randomMinute + 3) {
    return false;
  }

  const slotKey = `LAST_POST_SLOT_${todayKey}_${currentHour}`;

  if (store.get(slotKey)) return false;

  store.set(slotKey, '1');

  console.log('✅ SLOT MATCHED → POST ALLOWED');

  return true;
}

// ======================
// GET NEXT CONFESSION
// ======================
async function getNextApprovedConfession() {
  const confession = await Confession.findOne({
    status: 'APPROVED',
  }).sort({ confessionNo: 1 });

  if (confession) {
    console.log(`📦 NEXT CONFESSION: ${confession.confessionNo}`);
  }

  return confession;
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

    console.log(`❌ FAILED: No images`);
    return;
  }

  try {
    store.set(`posting_${confessionNo}`, '1');

    await Confession.updateOne({ confessionNo }, { status: 'POSTING' });

    console.log('📤 POSTING TO INSTAGRAM...');

    await postToInstagram(images, caption);

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

    const tgMsgId = store.get(`telegram_msg_${confessionNo}`);

    // 🔥 FIXED (collegeId added)
    await updateTelegramButtons(
      CHAT_ID,
      tgMsgId,
      'posted',
      confessionNo,
      confession.collegeId,
    );

    console.log(`🚀 SUCCESS: #${confessionNo} POSTED`);
  } catch (error) {
    console.error('❌ POST FAILED FULL:', error);

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

  // initial warmup
  await refillLowQueues();

  // main loop
  setInterval(async () => {
    try {
      const next = await getNextApprovedConfession();

      if (next && (await shouldPostNow())) {
        await processApprovedQueue();
      }
    } catch (error) {
      console.error('❌ SCHEDULER ERROR:', error);
    }
  }, 60000);

  // queue refill
  setInterval(refillLowQueues, 30 * 60 * 1000);
}

module.exports = {
  startSchedulerWorker,
  processApprovedQueue,
  shouldPostNow,
};
