const College = require('../models/College');

async function getTelegramConfig(collegeId) {
  const college = await College.findOne({ collegeId });

  if (!college) {
    throw new Error(`College not found: ${collegeId}`);
  }

  if (!college.telegram?.botToken) {
    throw new Error(`Telegram token missing for ${collegeId}`);
  }

  return {
    collegeId: college.collegeId,
    botToken: college.telegram.botToken,
    chatId: college.telegram.chatId,
    baseUrl: `https://api.telegram.org/bot${college.telegram.botToken}`,
  };
}

module.exports = getTelegramConfig;
