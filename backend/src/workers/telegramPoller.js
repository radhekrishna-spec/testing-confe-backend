const axios = require('axios');
const store = require('../store/store');

const {
  approveConfession,
  rejectConfession,
  startEditMode,
  confirmEdit,
  updateTelegramButtons,
} = require('../services/telegramUpdateService');

const College = require('../models/College');
const getTelegramConfig = require('../utils/getTelegramConfig');

const {
  processFormSubmit,
} = require('../modules/confession/formSubmitService');

function getLastUpdateId(collegeId) {
  return Number(store.get(`last_update_id_${collegeId}`)) || 0;
}

const pollingState = new Map();
const processedCallbacks = new Map();

function cleanupProcessedCallbacks() {
  const now = Date.now();

  for (const [id, time] of processedCallbacks.entries()) {
    if (now - time > 5 * 60 * 1000) {
      processedCallbacks.delete(id);
    }
  }
}

async function answerCallback(cbId, text = 'Done ✅', collegeId) {
  const { baseUrl } = await getTelegramConfig(collegeId);

  try {
    await axios.post(
      `${baseUrl}/answerCallbackQuery`,
      {
        callback_query_id: cbId,
        text,
        show_alert: false,
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error(
      'CALLBACK ANSWER ERROR:',
      error.response?.data || error.message,
    );
  }
}

async function pollTelegramUpdates(collegeId) {
  if (pollingState.get(collegeId)) return;

  pollingState.set(collegeId, true);

  try {
    cleanupProcessedCallbacks();

    const { baseUrl } = await getTelegramConfig(collegeId);

    let lastUpdateId = getLastUpdateId(collegeId);

    const res = await axios.get(`${baseUrl}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 50,
      },
      timeout: 60000,
    });

    const updates = res.data?.result || [];

    for (const update of updates) {
      lastUpdateId = update.update_id;

      store.set(`last_update_id_${collegeId}`, lastUpdateId);

      // ==========================
      // HANDLE TEXT EDIT INPUT
      // ==========================
      if (update.message?.text) {
        const text = update.message.text.trim();
        const chatId = update.message.chat.id;

        const activeEditId = store.get(`editing_active_${collegeId}`);

        const awaitingEdit = store.get(`awaiting_edit_input_${collegeId}`);

        const editingChat = store.get(`editing_chat_${collegeId}`);

        if (
          awaitingEdit === '1' &&
          activeEditId &&
          String(editingChat) === String(chatId)
        ) {
          await confirmEdit(chatId, activeEditId, text, collegeId);

          continue;
        }
      }

      if (!update.callback_query) continue;

      const cb = update.callback_query;
      const cbId = cb.id;

      if (processedCallbacks.has(cbId)) {
        continue;
      }

      processedCallbacks.set(cbId, Date.now());

      const data = cb.data;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;

      try {
        if (data.startsWith('approve_')) {
          const [, callbackCollegeId, id] = data.split('_');

          await approveConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );

          await answerCallback(cbId, 'Approved ✅', callbackCollegeId);
        } else if (data.startsWith('reject_')) {
          const [, callbackCollegeId, id] = data.split('_');

          await rejectConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );
          const Confession = require('../models/Confession');
          const AIRejectionLog = require('../models/AIRejectionLog');

          const confession = await Confession.findOne({
            collegeId: callbackCollegeId,
            confessionNo: Number(id),
          });

          await AIRejectionLog.create({
            collegeCode: callbackCollegeId,
            confessionNo: Number(id),
            source: confession?.isAIGenerated ? 'ai' : 'user',
            reason: 'manual_reject',
          });

          await answerCallback(cbId, 'Rejected ❌', callbackCollegeId);
        } else if (data.startsWith('edit_')) {
          const [, callbackCollegeId, id] = data.split('_');

          await startEditMode(chatId, messageId, Number(id), callbackCollegeId);

          await answerCallback(cbId, 'Edit mode ✏️', callbackCollegeId);
        } else if (data.startsWith('stopedit_')) {
          const [, callbackCollegeId, id] = data.split('_');

          store.delete(`awaiting_edit_input_${callbackCollegeId}`);
          store.delete(`editing_active_${callbackCollegeId}`);
          store.delete(`editing_chat_${callbackCollegeId}`);
          store.delete(`editing_time_${callbackCollegeId}`);

          const tgMsgId = store.get(`telegram_msg_${callbackCollegeId}_${id}`);

          await updateTelegramButtons(
            chatId,
            tgMsgId,
            'default',
            id,
            callbackCollegeId,
          );

          await answerCallback(cbId, 'Editing stopped ❌', callbackCollegeId);
        } else if (data.startsWith('reedit_')) {
          const [, callbackCollegeId, id] = data.split('_');

          store.set(`editing_active_${callbackCollegeId}`, id);

          store.set(`editing_chat_${callbackCollegeId}`, chatId);

          store.set(`awaiting_edit_input_${callbackCollegeId}`, '1');

          await answerCallback(cbId, 'Edit again ✏️', callbackCollegeId);
        } else if (data.startsWith('confirmpreview_')) {
          const [, callbackCollegeId, id] = data.split('_');

          const text = store.get(
            `pending_edit_text_${callbackCollegeId}_${id}`,
          );

          await processFormSubmit(
            {
              confession: text,
              collegeId: callbackCollegeId,
            },
            Number(id),
          );

          const tgMsgId = store.get(`telegram_msg_${callbackCollegeId}_${id}`);

          await updateTelegramButtons(
            chatId,
            tgMsgId,
            'default',
            id,
            callbackCollegeId,
          );

          await answerCallback(cbId, 'Confirmed ✅', callbackCollegeId);
        } else if (data.startsWith('addai_')) {
          const [, callbackCollegeId, id] = data.split('_');

          const Confession = require('../models/Confession');
          const AITrainingConfession = require('../models/AITrainingConfession');

          const confession = await Confession.findOne({
            collegeId: callbackCollegeId,
            confessionNo: Number(id),
          });

          if (confession) {
            const alreadyExists = await AITrainingConfession.findOne({
              collegeCode: callbackCollegeId,
              text: confession.message,
            });

            if (alreadyExists) {
              await answerCallback(
                cbId,
                'Already in AI training ⚠️',
                callbackCollegeId,
              );
              continue;
            }

            await AITrainingConfession.create({
              collegeCode: callbackCollegeId,
              text: confession.message,
              source: confession.isAIGenerated ? 'ai' : 'user',
              isApprovedForTraining: true,
              isRejected: false,
            });

            await answerCallback(
              cbId,
              'Saved to AI training ✅',
              callbackCollegeId,
            );
          } else {
            await answerCallback(
              cbId,
              'Confession not found ❌',
              callbackCollegeId,
            );
          }
        } else if (data.startsWith('more_')) {
          const [, callbackCollegeId] = data.split('_');

          await answerCallback(cbId, 'More options ⚙️', callbackCollegeId);
        }
      } catch (callbackError) {
        console.error('CALLBACK PROCESS ERROR:', callbackError.message);

        await answerCallback(cbId, 'Failed ❌', collegeId);
      }
    }
  } catch (error) {
    const err = error.response?.data || error.message;

    console.error('POLL ERROR:', err);

    if (error.response?.data?.error_code === 409) {
      console.log('⚠️ 409 conflict, waiting...');
      return;
    }
  } finally {
    pollingState.set(collegeId, false);
  }
}

let pollerStarted = false;

function startTelegramPoller() {
  if (pollerStarted) return;

  pollerStarted = true;

  async function pollLoop() {
    while (true) {
      try {
        const colleges = await College.find({
          isActive: true,
        });

        for (const college of colleges) {
          await pollTelegramUpdates(college.collegeId);
        }
      } catch (error) {
        console.error('POLL LOOP ERROR:', error.message);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  pollLoop();
}

module.exports = {
  startTelegramPoller,
};
