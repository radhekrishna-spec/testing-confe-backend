const AITrainingConfession = require('../models/AITrainingConfession');
const mongoose = require('mongoose');

async function getTrainingData(collegeCode) {
  const count = await AITrainingConfession.countDocuments({
    collegeCode,
    isApprovedForTraining: true,
    isRejected: false,
  });

  console.log(`Training count for ${collegeCode}:`, count);

  // If 100 or more clean confessions, use only new collection
  if (count >= 100) {
    return await AITrainingConfession.find({
      collegeCode,
      isApprovedForTraining: true,
      isRejected: false,
    }).lean();
  }

  // Fallback to legacy
  const db = mongoose.connection.db;

  if (collegeCode === 'miet') {
    return await db.collection('legacy_confessions_miet').find({}).toArray();
  }

  if (collegeCode === 'niet') {
    return await db.collection('legacy_confessions_niet').find({}).toArray();
  }

  // For new colleges, return empty or global data later
  return [];
}

module.exports = { getTrainingData };
