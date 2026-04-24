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

// ======================
// GET NEXT CONFESSION
// ======================
async function getNextApprovedConfession(collegeId) {
  return await Confession.findOne({
    status: 'APPROVED',
    retryCount: { $lt: 3 },
    collegeId: collegeId, // 🔥 ADD THIS
  })
    .sort({ confessionNo: 1 })
    .lean();
}

// ======================
// MAIN POST FLOW
// ======================
// ======================
// MAIN POST FLOW
// ======================
async function processApprovedQueue(collegeId) {
  const confession = await getNextApprovedConfession(collegeId);

  if (!confession) {
    console.log('❌ NO APPROVED CONFESSION');
    return;
  }

  const confessionNo = confession.confessionNo;

  // 🔥 NEW: GLOBAL LOCK (MULTI INSTANCE FIX)
  const GLOBAL_LOCK = `GLOBAL_POST_LOCK_${confession.collegeId}_${confessionNo}`;
  if (store.get(GLOBAL_LOCK)) {
    console.log('⚠️ GLOBAL LOCK ACTIVE, SKIP');
    return;
  }
  store.set(GLOBAL_LOCK, '1');

  // 🔥 EXISTING LOCK (UNCHANGED)
  const POST_LOCK = `posting_${confession.collegeId}_${confessionNo}`;

  if (store.get(POST_LOCK)) {
    console.log('⚠️ ALREADY POSTING, SKIP');
    store.delete(GLOBAL_LOCK);
    return;
  }

  store.set(POST_LOCK, '1');

  const images = confession.images || [];
  const caption = confession.caption || '';

  console.log(`🚀 PROCESSING CONFESSION: ${confessionNo}`);

  if (!images.length) {
    await Confession.updateOne(
      { confessionNo, collegeId: confession.collegeId },
      {
        status: 'FAILED',
        failureReason: 'No images found',
        $inc: { retryCount: 1 },
      },
    );
    store.delete(GLOBAL_LOCK); // 🔥 unlock
    return;
  }

  try {
    const lock = await Confession.findOneAndUpdate(
      { confessionNo, collegeId: confession.collegeId, status: 'APPROVED' },
      { status: 'POSTING' },
      { returnDocument: 'after' },
    );

    if (!lock) {
      console.log('⚠️ ALREADY PICKED BY OTHER WORKER');
      return;
    }

    console.log('📤 POSTING TO INSTAGRAM...');

    await postToInstagram(images, caption, confession.collegeId);

    console.log('✅ INSTAGRAM POSTED');

    const fileIds = store.get(`fileIds_${confessionNo}`) || [];

    for (const fileId of fileIds) {
      await moveFileToFolder(fileId, 'posted', confession.collegeId);
    }

    await Confession.updateOne(
      { confessionNo, collegeId: confession.collegeId },
      {
        status: 'POSTED',
        isPosted: true,
        postedTime: new Date(),
      },
    );

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
      { confessionNo, collegeId: confession.collegeId },
      {
        status: 'FAILED',
        failureReason: error.message,
      },
    );
  } finally {
    store.delete(POST_LOCK);
    store.delete(GLOBAL_LOCK); // 🔥 NEW (MOST IMPORTANT)
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
      //console.log(`⚠️ LOW AI QUEUE: ${college.collegeId}`);
      await checkQueueAndGenerate(college.collegeId, 'scheduler');
      store.set(visibleKey, 3);
    }
  }
}

// ======================
// WORKER START
// ======================
async function startSchedulerWorker() {
  const WORKER_RUNNING_KEY = 'SCHEDULER_RUNNING';

  if (store.get(WORKER_RUNNING_KEY)) {
    console.log('⚠️ Scheduler already running, skipping...');
    return;
  }

  store.set(WORKER_RUNNING_KEY, '1');
  console.log('🚀 Scheduler worker started');

  await refillLowQueues();

  let isRunning = false;

  setInterval(async () => {
    if (isRunning) return;

    isRunning = true;

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const colleges = await College.find({ isActive: true });

      for (const college of colleges) {
        const collegeId = college.collegeId;
        console.log(`\n🏫 COLLEGE: ${collegeId}`);

        const queueCount = await Confession.countDocuments({
          status: 'APPROVED',
          collegeId,
        });
        console.log(`📦 Queue: ${queueCount}`);

        const next = await getNextApprovedConfession(collegeId);

        if (next) {
          console.log(`⏭️ Next Post: ${collegeId} → #${next.confessionNo}`);
        } else {
          console.log(`❌ ${collegeId} → No approved confession`);
        }

        const postHours = getPostTimes(queueCount);
        console.log(`🕒 Post Hours: ${postHours}`);

        if (!postHours.includes(currentHour)) continue;

        const todayKey = now.toISOString().split('T')[0] + '_' + collegeId;

        const targetMinute = getRandomMinuteForHour(todayKey, currentHour);
        console.log(
          `⏱️ Now: ${currentHour}:${currentMinute} | Target: ${currentHour}:${targetMinute}`,
        );

        if (currentMinute !== targetMinute) continue;
        console.log(`🚀 MATCHED TIME → WILL POST NOW`);

        await processApprovedQueue(collegeId);
      }
    } catch (error) {
      console.error('❌ SCHEDULER ERROR:', error.message);
    } finally {
      isRunning = false;
    }
  }, 15000); // 🔥 SAFE INTERVAL

  setInterval(refillLowQueues, 30 * 60 * 1000);
}
// 🔥 TEST FUNCTION (2:20 PM MIET ONLY)
function testPostAt220() {
  const TARGET_HOUR = 14;
  const TARGET_MINUTE = 22;
  const collegeId = 'miet';

  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    console.log(`🧪 TEST CHECK: ${hour}:${minute}`);

    if (hour === TARGET_HOUR && minute === TARGET_MINUTE) {
      console.log(`🚀 TEST TRIGGERED → ${collegeId}`);

      const confession = await getNextApprovedConfession(collegeId);

      if (!confession) {
        console.log(`❌ No approved confession`);
        return;
      }

      console.log(`🔥 TEST FOUND: #${confession.confessionNo}`);

      await processApprovedQueue(collegeId);

      console.log(`✅ TEST DONE`);
    }
  }, 10000);
}

module.exports = {
  startSchedulerWorker,
  processApprovedQueue,
  testPostAt220,
};
