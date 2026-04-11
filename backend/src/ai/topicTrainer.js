const AITopicWeight = require('../models/AITopicWeight');
const { detectTopTopics } = require('./topicAnalyzer');

async function updateTopicWeights(collegeId, message, feedback) {
  const topics = detectTopTopics([{ message }]);

  const delta = feedback === 'APPROVED' ? 1 : -1;

  for (const topic of topics) {
    await AITopicWeight.findOneAndUpdate(
      { collegeId, topic },
      { $inc: { score: delta } },
      { upsert: true, new: true },
    );
  }
}

async function getTopWeightedTopics(collegeId) {
  const data = await AITopicWeight.find({
    collegeId,
  })
    .sort({ score: -1 })
    .limit(5)
    .lean();

  return data.map((x) => x.topic);
}

module.exports = {
  updateTopicWeights,
  getTopWeightedTopics,
};
