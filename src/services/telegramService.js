const axios = require('axios');

async function sendTelegram(images, caption, confessionNo) {
  await axios.post(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    {
      chat_id: process.env.CHAT_ID,
      text: caption,
    },
  );
}

module.exports = { sendTelegram };
