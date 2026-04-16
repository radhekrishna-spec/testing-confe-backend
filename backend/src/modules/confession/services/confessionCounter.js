const Counter = require('../../../models/Counter');
const Confession = require('../../../models/Confession');

const DEFAULT_CONFESSION_NO = 1000;

async function getNextConfessionNo(collegeId) {
  const key = `confession_${collegeId}`;

  let counter = await Counter.findOne({ key });

  if (!counter) {
    const lastConfession = await Confession.findOne({ collegeId }).sort({
      confessionNo: -1,
    });

    const startNo = lastConfession
      ? lastConfession.confessionNo
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

async function setConfessionNo(collegeId, newNo) {
  const key = `confession_${collegeId}`;

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

async function getCurrentConfessionNo(collegeId) {
  const key = `confession_${collegeId}`;

  const counter = await Counter.findOne({ key });

  return counter?.seq || DEFAULT_CONFESSION_NO;
}

module.exports = {
  getNextConfessionNo,
  setConfessionNo,
  getCurrentConfessionNo,
};
