const axios = require('axios');
const store = require('../store/store');
const { sendTelegramMessage } = require('../modules/social/telegramService');

const { uploadImagesToDrive } = require('./ai/google/driveService');

const College = require('../models/College');
const Confession = require('../models/Confession');

const { splitTextSmart } = require('../modules/confession/helpers/splitText');
const {
  generateSlidesImages,
} = require('../modules/confession/slides/slidesService');

// =========================
// BASE URL
// =========================
async function getTelegramBaseUrl(collegeId) {
  const college = await College.findOne({
    collegeId,
    isActive: true,
  });

  if (!college?.telegram?.botToken) {
    throw new Error(`Telegram bot token not found for ${collegeId}`);
  }

  return `https://api.telegram.org/bot${college.telegram.botToken}`;
}

// =========================
// APPROVE
// =========================
async function approveConfession(chatId, messageId, confessionNo, collegeId) {
  try {
    console.log(`🔥 APPROVE START: ${confessionNo}`);

    const result = await Confession.updateOne(
      { confessionNo: Number(confessionNo), collegeId },
      { status: 'APPROVED' },
    );

    if (result.modifiedCount === 0) {
      throw new Error('DB NOT UPDATED');
    }

    console.log(`✅ DB UPDATED`);

    await updateTelegramButtons(
      chatId,
      messageId,
      'approved',
      confessionNo,
      collegeId,
    );

    await sendTelegramMessage(
      chatId,
      `✅ Confession #${confessionNo} approved`,
      collegeId,
    );

    console.log(`✅ APPROVE COMPLETE`);
  } catch (error) {
    console.error('❌ APPROVE ERROR:', error);
  }
}

// =========================
// REJECT
// =========================
async function rejectConfession(chatId, messageId, confessionNo, collegeId) {
  try {
    console.log(`🔥 REJECT START: ${confessionNo}`);

    const result = await Confession.updateOne(
      { confessionNo: Number(confessionNo), collegeId },
      { status: 'REJECTED' },
    );

    if (result.modifiedCount === 0) {
      throw new Error('DB NOT UPDATED');
    }

    await updateTelegramButtons(
      chatId,
      messageId,
      'rejected',
      confessionNo,
      collegeId,
    );

    await sendTelegramMessage(
      chatId,
      `❌ Confession #${confessionNo} rejected`,
      collegeId,
    );

    console.log(`❌ REJECT COMPLETE`);
  } catch (error) {
    console.error('❌ REJECT ERROR:', error);
  }
}

// =========================
// EDIT MODE
// =========================
async function startEditMode(chatId, messageId, confessionNo, collegeId) {
  try {
    const oldText = store.get(`text_${collegeId}_${confessionNo}`);

    if (!oldText) {
      await sendTelegramMessage(
        chatId,
        `❌ Original text not found for #${confessionNo}`,
        collegeId,
      );
      return;
    }

    store.set(`editing_active_${collegeId}`, confessionNo);
    store.set(`editing_chat_${collegeId}`, chatId);
    store.set(`awaiting_edit_input_${collegeId}`, '1');

    await updateTelegramButtons(
      chatId,
      messageId,
      'editing',
      confessionNo,
      collegeId,
    );

    await sendTelegramMessage(
      chatId,
      `✏️ Send new edited text for #${confessionNo}`,
      collegeId,
    );

    console.log(`✏️ EDIT MODE STARTED`);
  } catch (error) {
    console.error('❌ EDIT MODE ERROR:', error);
  }
}

// =========================
// CONFIRM EDIT (FIXED)
// =========================
async function confirmEdit(chatId, confessionNo, text, collegeId) {
  try {
    console.log(`🔥 EDIT CONFIRM START`);

    const BASE_URL = await getTelegramBaseUrl(collegeId);

    await sendTelegramMessage(
      chatId,
      `🛠 Creating preview for #${confessionNo}...`,
      collegeId,
    );

    const parts = splitTextSmart(text, 665); // ❌ fixed (removed data.type)

    const imageBuffers = await generateSlidesImages(
      parts,
      confessionNo,
      collegeId,
    );

    const driveUrls = await uploadImagesToDrive(
      imageBuffers,
      confessionNo,
      collegeId,
    );

    await axios.post(`${BASE_URL}/sendPhoto`, {
      chat_id: chatId,
      photo: driveUrls[0],
      caption: `👀 Preview for #${confessionNo}`,
    });

    console.log(`✅ EDIT PREVIEW SENT`);
  } catch (error) {
    console.error('❌ CONFIRM EDIT ERROR:', error);
  }
}

// =========================
// BUTTON UPDATE
// =========================
async function updateTelegramButtons(
  chatId,
  messageId,
  status,
  confessionNo,
  collegeId,
) {
  try {
    const BASE_URL = await getTelegramBaseUrl(collegeId);

    let keyboard = {
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
        ],
      ],
    };

    if (status === 'approved') {
      keyboard = {
        inline_keyboard: [
          [
            {
              text: 'EDIT ✏️',
              callback_data: `edit_${collegeId}_${confessionNo}`,
            },
          ],
        ],
      };
    }

    await axios.post(`${BASE_URL}/editMessageReplyMarkup`, {
      chat_id: chatId,
      message_id: Number(messageId),
      reply_markup: keyboard,
    });

    console.log(`🔘 BUTTON UPDATED`);
  } catch (error) {
    console.error('❌ BUTTON UPDATE ERROR:', error.message);
  }
}

module.exports = {
  approveConfession,
  rejectConfession,
  startEditMode,
  updateTelegramButtons,
  confirmEdit,
};
