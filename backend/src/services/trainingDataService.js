const AITrainingConfession = require('../models/AITrainingConfession');

async function getTrainingData(collegeCode) {
  const count = await AITrainingConfession.countDocuments({
    collegeCode,
    isApprovedForTraining: true,
    isRejected: false,
  });

  if (count >= 100) {
    return AITrainingConfession.find({
      collegeCode,
      isApprovedForTraining: true,
      isRejected: false,
    }).lean();
  }

  return null;
}

module.exports = { getTrainingData };
