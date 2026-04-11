const axios = require('axios');
const store = require('../store/store');
const { sendTelegramMessage } = require('../modules/social/telegramService');
const { moveFileToFolder } = require('./ai/google/driveService');
const College = require('../models/College');
const Confession = require('../models/Confession');
const { saveFeedback } = require('../ai/feedbackTrainer');

const { splitTextSmart } = require('../modules/confession/helpers/splitText');
const {
  generateSlidesImages,
} = require('../modules/confession/slides/slidesService');
const { uploadImagesToDrive } = require('./ai/google/driveService');
const { checkQueueAndGenerate } = require('../ai/queueWatcher');

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

async function confirmEdit(chatId, confessionNo, text, collegeId) {
  try {
    const BASE_URL = await getTelegramBaseUrl(collegeId);

    await sendTelegramMessage(
      chatId,
      `🛠 Creating preview for #${confessionNo}...`,
      collegeId,
    );

    store.set(`pending_edit_text_${collegeId}_${confessionNo}`, text);

    const parts = splitTextSmart(text, 665);
    const imageBuffers = await generateSlidesImages(parts, confessionNo);

    const driveUrls = await uploadImagesToDrive(
      imageBuffers,
      confessionNo,
      collegeId,
    );

    store.set(`preview_images_${collegeId}_${confessionNo}`, driveUrls);

    await axios.post(`${BASE_URL}/sendPhoto`, {
      chat_id: chatId,
      photo: driveUrls[0],
      caption: `👀 Preview for #${confessionNo}`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'CONFIRM ✅',
              callback_data: `confirmpreview_${collegeId}_${confessionNo}`,
            },
            {
              text: 'RE-EDIT ✏️',
              callback_data: `reedit_${collegeId}_${confessionNo}`,
            },
          ],
        ],
      },
    });

    store.delete(`awaiting_edit_input_${collegeId}`);
    store.delete(`editing_active_${collegeId}`);
    store.delete(`editing_chat_${collegeId}`);
    store.delete(`editing_time_${collegeId}`);
  } catch (error) {
    console.error('CONFIRM EDIT ERROR:', error.message);
  }
}

async function updateTelegramButtons(
  chatId,
  messageId,
  status,
  confessionNo,
  collegeId,
) {
  const BASE_URL = await getTelegramBaseUrl(collegeId);
  if (!messageId) return;

  let keyboard;

  if (status === 'approved') {
    keyboard = {
      inline_keyboard: [
        [
          {
            text: 'EDIT ✏️',
            callback_data: `edit_${collegeId}_${confessionNo}`,
          },
          {
            text: 'REJECT ❌',
            callback_data: `reject_${collegeId}_${confessionNo}`,
          },
        ],
        [
          {
            text: 'SEE MORE ⚙️',
            callback_data: `more_${collegeId}_${confessionNo}`,
          },
        ],
      ],
    };
  } else if (status === 'rejected') {
    keyboard = {
      inline_keyboard: [
        [
          {
            text: 'APPROVE ✅',
            callback_data: `approve_${collegeId}_${confessionNo}`,
          },
          {
            text: 'EDIT ✏️',
            callback_data: `edit_${collegeId}_${confessionNo}`,
          },
        ],
      ],
    };
  } else if (status === 'editing') {
    keyboard = {
      inline_keyboard: [
        [
          {
            text: 'STOP EDITING ❌',
            callback_data: `stopedit_${collegeId}_${confessionNo}`,
          },
        ],
      ],
    };
  } else {
    keyboard = {
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
    };
  }

  try {
    await axios.post(
      `${BASE_URL}/editMessageReplyMarkup`,
      {
        chat_id: chatId,
        message_id: Number(messageId),
        reply_markup: keyboard,
      },
      { timeout: 10000 },
    );
  } catch (error) {
    const err = error.response?.data;
    if (err?.description?.includes('message is not modified')) return;
    console.error('BUTTON UPDATE ERROR:', err || error.message);
  }
}

async function promoteNextQueuedAI(collegeId) {
  const nextAi = await Confession.findOne({
    collegeId,
    source: 'AI',
    status: 'QUEUED',
  }).sort({ confessionNo: 1 });

  if (!nextAi) {
    await checkQueueAndGenerate(collegeId, 'ai');
    return;
  }

  await Confession.updateOne({ _id: nextAi._id }, { status: 'PENDING' });
}

async function approveConfession(chatId, messageId, confessionNo, collegeId) {
  if (store.get(`state_${collegeId}_${confessionNo}`) === 'APPROVED') {
    await sendTelegramMessage(chatId, '⚠️ Already approved', collegeId);
    return;
  }

  store.set(`status_${collegeId}_${confessionNo}`, 'approved');
  store.set(`state_${collegeId}_${confessionNo}`, 'APPROVED');
  store.set(`approved_time_${collegeId}_${confessionNo}`, Date.now());

  await Confession.updateOne(
    {
      confessionNo: Number(confessionNo),
      collegeId,
    },
    { status: 'APPROVED' },
  );

  const confession = await Confession.findOne({
    confessionNo: Number(confessionNo),
    collegeId,
  });

  if (confession) {
    await saveFeedback({
      collegeId,
      confessionId: confession._id,
      message: confession.message,
      feedback: 'APPROVED',
    });
  }

  if (confession?.isAIGenerated) {
    await promoteNextQueuedAI(collegeId);
  }

  const fileIds = store.get(`fileIds_${collegeId}_${confessionNo}`) || [];

  for (const fileId of fileIds) {
    await moveFileToFolder(fileId, 'queue', collegeId);
  }

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
}

async function rejectConfession(chatId, messageId, confessionNo, collegeId) {
  if (store.get(`state_${collegeId}_${confessionNo}`) === 'REJECTED') {
    await sendTelegramMessage(chatId, '⚠️ Already rejected', collegeId);
    return;
  }

  store.set(`status_${collegeId}_${confessionNo}`, 'rejected');
  store.set(`state_${collegeId}_${confessionNo}`, 'REJECTED');
  store.set(`rejected_time_${collegeId}_${confessionNo}`, Date.now());

  await Confession.updateOne(
    {
      confessionNo: Number(confessionNo),
      collegeId,
    },
    { status: 'REJECTED' },
  );

  const confession = await Confession.findOne({
    confessionNo: Number(confessionNo),
    collegeId,
  });

  if (confession) {
    await saveFeedback({
      collegeId,
      confessionId: confession._id,
      message: confession.message,
      feedback: 'REJECTED',
      reason: 'Rejected by admin from Telegram',
    });
  }

  if (confession?.isAIGenerated) {
    await promoteNextQueuedAI(collegeId);
  }

  const fileIds = store.get(`fileIds_${collegeId}_${confessionNo}`) || [];

  for (const fileId of fileIds) {
    await moveFileToFolder(fileId, 'rejected', collegeId);
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
}

async function startEditMode(chatId, messageId, confessionNo, collegeId) {
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
  store.set(`editing_time_${collegeId}`, Date.now());
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
    `✏️ Editing #${confessionNo}\n\n📌 Current text:\n${oldText}\n\nSend new edited text now.`,
    collegeId,
  );
}

module.exports = {
  approveConfession,
  rejectConfession,
  startEditMode,
  updateTelegramButtons,
  confirmEdit,
};
