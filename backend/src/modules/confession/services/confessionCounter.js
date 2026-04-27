const Counter = require('../../../models/Counter');
const Confession = require('../../../models/Confession');

const DEFAULT_CONFESSION_NO = 1000;

// ======================
// GET NEXT CONFESSION NO
// ======================
async function getNextConfessionNo(collegeId) {
  if (!collegeId) throw new Error('collegeId is required');

  const key = `confession_${String(collegeId)}`;

  let counter = await Counter.findOne({ key });

  if (!counter) {
    const lastConfession = await Confession.findOne({ collegeId }).sort({
      confessionNo: -1,
    });

    const startNo = lastConfession
      ? Number(lastConfession.confessionNo)
      : DEFAULT_CONFESSION_NO;

    counter = await Counter.create({
      key,
      seq: startNo,
    });
  }

  const updatedCounter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    {
      returnDocument: 'after',
    },
  );

  return updatedCounter.seq;
}

// ======================
// SET CONFESSION NO
// ======================
async function setConfessionNo(collegeId, newNo) {
  if (!collegeId) throw new Error('collegeId is required');
  if (newNo === undefined || newNo === null)
    throw new Error('newNo is required');

  const key = `confession_${String(collegeId)}`;

  const updatedCounter = await Counter.findOneAndUpdate(
    { key },
    { $set: { seq: Number(newNo) } },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  return updatedCounter.seq;
}

// ======================
// GET CURRENT CONFESSION NO
// ======================
async function getCurrentConfessionNo(collegeId) {
  if (!collegeId) throw new Error('collegeId is required');

  const key = `confession_${String(collegeId)}`;

  const counter = await Counter.findOne({ key });

  return counter?.seq ?? DEFAULT_CONFESSION_NO;
}

module.exports = {
  getNextConfessionNo,
  setConfessionNo,
  getCurrentConfessionNo,
};
