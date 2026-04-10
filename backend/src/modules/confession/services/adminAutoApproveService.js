const Confession = require('../../../models/Confession');

async function autoApproveConfession(confessionNo) {
  const confession = await Confession.findOne({
    confessionNo,
    status: 'PENDING',
  });

  if (!confession) {
    return;
  }

  confession.status = 'APPROVED';
  await confession.save();
}

module.exports = {
  autoApproveConfession,
};
