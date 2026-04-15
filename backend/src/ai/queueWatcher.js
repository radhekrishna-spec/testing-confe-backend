const Confession = require('../models/Confession');
const { generateAIConfession } = require('./generator');
const AITrainingConfession = require('../models/AITrainingConfession');

const TARGET_QUEUE = 3;
const DAILY_AI_LIMIT = 3;

function getStartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

async function checkQueueAndGenerate(collegeId, source = 'user') {
  const trainingCount = await AITrainingConfession.countDocuments({
    collegeCode: collegeId,
    isApprovedForTraining: true,
    isRejected: false,
  });

  console.log(`📚 Training count for ${collegeId}: ${trainingCount}`);

  if (trainingCount < 100) {
    console.log(`⏳ AI blocked for ${collegeId}: ${trainingCount}/100`);
    return;
  }
  // total pending + queued AI confessions
  const queueCount = await Confession.countDocuments({
    collegeId,
    source: 'AI',
    status: {
      $in: ['PENDING', 'QUEUED'],
    },
  });

  console.log(`📦 Queue for ${collegeId}: ${queueCount}`);

  // aaj kitne AI confessions generate hue
  const todayAiCount = await Confession.countDocuments({
    collegeId,
    source: 'AI',
    createdAt: {
      $gte: getStartOfToday(),
    },
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

  console.log(`🚀 Generating batch of 3 AI confessions for ${collegeId}`);

  try {
    // ✅ one API request -> 3 confessions
    await generateAIConfession(collegeId, 'PENDING');

    console.log(`✅ AI batch generated successfully for ${collegeId}`);
  } catch (error) {
    console.error(`❌ AI generation failed for ${collegeId}:`, error.message);

    // quota safe log
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log(`⛔ Gemini quota exceeded for ${collegeId}`);
    }
  }
}

module.exports = {
  checkQueueAndGenerate,
};
