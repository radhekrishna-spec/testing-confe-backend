const Confession = require('../models/Confession');
const { generateAIConfession } = require('./generator');

async function checkQueueAndGenerate(collegeId, source = 'user') {
  if (source === 'ai') return;

  const pendingCount = await Confession.countDocuments({
    collegeId,
    status: 'PENDING',
  });

  console.log(`Queue for ${collegeId}: ${pendingCount}`);

  if (pendingCount < 5) {
    await generateAIConfession(collegeId);
  }
}

module.exports = {
  checkQueueAndGenerate,
};
