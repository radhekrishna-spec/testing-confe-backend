const Confession = require('../models/Confession');
const { generateAIConfession } = require('./generator');

const TARGET_QUEUE = 3;
const DAILY_AI_LIMIT = 3;

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

async function checkQueueAndGenerate(collegeId, source = 'user') {
  // agar AI se hi aaya hai to recursion avoid
  if (source === 'user') {
    // user submit pe sirf check
  }

  // total pending + queued AI confessions
  const queueCount = await Confession.countDocuments({
    collegeId,
    source: 'AI',
    status: { $in: ['PENDING', 'QUEUED'] },
  });

  console.log(`📦 Queue for ${collegeId}: ${queueCount}`);

  // aaj kitne AI confessions generate hue
  const todayAiCount = await Confession.countDocuments({
    collegeId,
    source: 'AI',
    createdAt: { $gte: getStartOfToday() },
  });

  console.log(`🤖 Today's AI count for ${collegeId}: ${todayAiCount}`);

  // daily max 3
  if (todayAiCount >= DAILY_AI_LIMIT) {
    console.log(`⛔ Daily AI limit reached for ${collegeId}`);
    return;
  }

  // queue ko 3 tak fill karo
  const needed = TARGET_QUEUE - queueCount;

  if (needed <= 0) {
    console.log(`✅ Queue already healthy for ${collegeId}`);
    return;
  }

  console.log(`🚀 Generating ${needed} AI confessions for ${collegeId}`);

  for (let i = 0; i < needed; i++) {
    const status = i === 0 ? 'PENDING' : 'QUEUED';
    try {
      await generateAIConfession(collegeId, status);
    } catch (error) {
      console.error(`❌ AI generation failed for ${collegeId}:`, error.message);
      break;
    }
  }
}

module.exports = {
  checkQueueAndGenerate,
};
