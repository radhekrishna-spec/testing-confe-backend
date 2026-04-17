const Confession = require('../../../models/Confession');

async function autoApproveConfession(confessionNo, collegeId) {
  const confession = await Confession.findOne({
    confessionNo: Number(confessionNo),
    collegeId,
    status: 'PENDING',
  });

  if (!confession) {
    console.log(
      `⚠️ No pending confession found for #${confessionNo} (${collegeId})`,
    );
    return null;
  }

  confession.status = 'APPROVED';
  await confession.save();

  //console.log(`✅ Auto approved confession #${confessionNo} (${collegeId})`);

  return confession;
}

module.exports = {
  autoApproveConfession,
};
