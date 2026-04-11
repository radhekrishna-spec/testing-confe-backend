const axios = require('axios');
const store = require('../../store/store');
const FormData = require('form-data');
const College = require('../models/College');

// reusable safe delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// EXACT SAME AS APPSCRIPT + UPGRADED
async function sendTelegram(
  images,
  caption,
  confessionNo,
  collegeId,
  isEdit = false,
) {
  const college = await College.findOne({ collegeId });

  const BOT_TOKEN = college.telegram.botToken;
  const CHAT_ID = college.telegram.chatId;
  const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
  if (store.get(`telegram_sending_${collegeId}_${confessionNo}`)) return;

  store.set(`telegram_sending_${collegeId}_${confessionNo}`, '1');

  try {
    const chunkSize = 10;
    const sentMessageIds = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const imageBuffer = images[i];
        //console.log('📦 TELEGRAM BUFFER SIZE:', imageBuffer.length);
        //console.log('🧪 PNG SIGNATURE:', imageBuffer.slice(0, 8));

        //console.log(`📤 Sending image buffer ${i + 1} for Telegram`);

        const form = new FormData();

        form.append('chat_id', CHAT_ID);
        form.append('photo', imageBuffer, {
          filename: `confession_${confessionNo}_${i + 1}.png`,
          contentType: 'image/png',
        });

        if (i === 0) {
          form.append('caption', caption);
        }

        const mediaRes = await axios.post(`${BASE_URL}/sendPhoto`, form, {
          headers: form.getHeaders(),
          timeout: 20000,
        });

        const msgId = mediaRes.data?.result?.message_id;

        if (msgId) {
          sentMessageIds.push(msgId);
        }

        await sleep(1200);
      }
    } catch (error) {
      console.error('TG MEDIA FAIL:', error.response?.data || error.message);

      // fallback text message if image fails
      await axios.post(
        `${BASE_URL}/sendMessage`,
        {
          chat_id: CHAT_ID,
          text: `${caption}\n\nConfession #${confessionNo}`,
        },
        {
          timeout: 10000,
        },
      );

      //console.log('📨 Fallback text message sent');
    }

    // approval buttons always send
    const res = await axios.post(
      `${BASE_URL}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: `Confession #${confessionNo} Approval`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'APPROVE ✅',
                callback_data: `approve_${collegeId}_${confessionNo}`,
              },
              {
                text: 'REJECT ❌',
                callback_data: `reject_${collegeId}_${confessionNo}`,
              },
              {
                text: 'SEE MORE ⚙️',
                callback_data: `more_${collegeId}_${confessionNo}`,
              },
            ],
          ],
        },
      },
      {
        timeout: 15000,
      },
    );

    const messageId = res.data?.result?.message_id;

    const Confession = require('../../models/Confession');

    await Confession.updateOne(
      {
        confessionNo,
        collegeId,
      },
      {
        telegramMessageId: messageId,
      },
    );
    store.set(
      `telegram_media_msgs_${collegeId}_${confessionNo}`,
      sentMessageIds,
    );
    store.set(`telegram_sent_${collegeId}_${confessionNo}`, 'yes');

    //console.log(`✅ Telegram sent for #${confessionNo}`);
  } finally {
    store.delete(`telegram_sending_${collegeId}_${confessionNo}`);
  }
}

// SAME SIMPLE TEXT MESSAGE
async function sendTelegramMessage(chatId, text, collegeId) {
  const college = await College.findOne({ collegeId });
  if (!college?.telegram?.botToken) {
    throw new Error(`Telegram config missing for ${collegeId}`);
  }

  const BOT_TOKEN = college.telegram.botToken;
  const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
  try {
    return await axios.post(
      `${BASE_URL}/sendMessage`,
      {
        chat_id: chatId,
        text,
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error('TG TEXT SEND FAIL:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendTelegram,
  sendTelegramMessage,
};
