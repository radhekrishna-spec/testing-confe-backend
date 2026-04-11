const Confession = require('../models/Confession');
const mongoose = require('mongoose');

async function getLegacyCollection(collegeId) {
  if (collegeId === 'miet') {
    return mongoose.connection.collection(
      'legacy_confessions_miet'
    );
  }

  if (collegeId === 'niet') {
    return mongoose.connection.collection(
      'legacy_confessions_niet'
    );
  }

  return null;
}

async function getFallbackMemory() {
  const mietLegacy =
    await mongoose.connection
      .collection('legacy_confessions_miet')
      .find({
        'Type your confession here 👇': {
          $exists: true,
        },
      })
      .limit(20)
      .toArray();

  const nietLegacy =
    await mongoose.connection
      .collection('legacy_confessions_niet')
      .find({
        'Type your confession here 👇': {
          $exists: true,
        },
      })
      .limit(20)
      .toArray();

  return [
    ...mietLegacy,
    ...nietLegacy,
  ].map((item) => ({
    message:
      item['Type your confession here 👇'],
  }));
}

async function getCollegeMemory(collegeId) {
  // 1) Live approved + posted data
  const liveData = await Confession.find({
    collegeId,
    status: {
      $in: ['APPROVED', 'POSTED'],
    },
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  // 2) Legacy data for supported colleges
  const legacyCollection =
    await getLegacyCollection(collegeId);

  let mappedLegacy = [];

  if (legacyCollection) {
    const legacyData =
      await legacyCollection
        .find({
          'Type your confession here 👇': {
            $exists: true,
          },
        })
        .limit(30)
        .toArray();

    mappedLegacy = legacyData.map(
      (item) => ({
        message:
          item[
            'Type your confession here 👇'
          ],
      })
    );
  }

  // 3) Merge live + legacy
  let finalMemory = [
    ...liveData,
    ...mappedLegacy,
  ];

  // 4) Cold-start fallback for new colleges
  if (finalMemory.length < 5) {
    const fallback =
      await getFallbackMemory();

    finalMemory = [
      ...finalMemory,
      ...fallback,
    ];
  }

  // 5) Final limit
  return finalMemory.slice(0, 50);
}

module.exports = {
  getCollegeMemory,
};