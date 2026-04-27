const AIFeedback = require('../models/AIFeedback');
const { updateTopicWeights } = require('./topicTrainer');

async function saveFeedback({
  collegeId,
  confessionId,
  message,
  feedback,
  reason = '',
}) {
  // update topic learning
  await updateTopicWeights(collegeId, message, feedback);

  // save feedback history
  await AIFeedback.create({
    collegeId,
    confessionId,
    message,
    feedback,
    reason,
  });
}

async function getRejectedExamples(collegeId) {
  return await AIFeedback.find({
    collegeId,
    feedback: 'REJECTED',
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

module.exports = {
  saveFeedback,
  getRejectedExamples,
};
