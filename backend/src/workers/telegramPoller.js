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
    await axios.post(`${baseUrl}/answerCallbackQuery`, {
      callback_query_id: cbId,
      text,
      show_alert: false,
    });
  } catch (error) {
    //console.error('❌ CALLBACK ANSWER ERROR:', error.message);
  }
}

async function pollTelegramUpdates(collegeId) {
  if (pollingState.get(collegeId)) return;

  pollingState.set(collegeId, true);

  try {
    const { baseUrl } = await getTelegramConfig(collegeId);
    let lastUpdateId = getLastUpdateId(collegeId);

    // //console.log(
    //   `🚀 POLLING START: ${collegeId} | lastUpdateId=${lastUpdateId}`,
    // );

    const res = await axios.get(`${baseUrl}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 10, // 🔥 reduced timeout
      },
      timeout: 15000,
    });

    const updates = res.data?.result || [];

    //console.log(`📥 [${collegeId}] Updates count: ${updates.length}`);

    for (const update of updates) {
      lastUpdateId = update.update_id;
      store.set(`last_update_id_${collegeId}`, lastUpdateId);

      //console.log(`🧾 [${collegeId}] UPDATE ID: ${update.update_id}`);

      // ==========================
      // TEXT INPUT (EDIT FLOW)
      // ==========================
      if (update.message?.text) {
        //console.log(`💬 [${collegeId}] MESSAGE RECEIVED`);

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
          //console.log(`✏️ [${collegeId}] EDIT INPUT DETECTED`);

          await confirmEdit(chatId, activeEditId, text, collegeId);
          continue;
        }
      }

      // ==========================
      // CALLBACK
      // ==========================
      if (!update.callback_query) continue;

      const cb = update.callback_query;
      const cbId = cb.id;

      //console.log(`🔥 [${collegeId}] CALLBACK RECEIVED: ${cbId}`);

      // ❌ TEMP FIX: disable skip (important)
      // if (processedCallbacks.has(cbId)) {
      //   //console.log(`⚠️ SKIPPED CALLBACK: ${cbId}`);
      //   continue;
      // }

      processedCallbacks.set(cbId, Date.now());

      const data = cb.data;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;

      //console.log(`📦 [${collegeId}] DATA: ${data}`);

      try {
        if (data.startsWith('approve_')) {
          //console.log(`✅ APPROVE HIT: ${data}`);

          const [, callbackCollegeId, id] = data.split('_');

          await answerCallback(cbId, 'Processing...', callbackCollegeId);

          await approveConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );
        } else if (data.startsWith('reject_')) {
          //console.log(`❌ REJECT HIT: ${data}`);

          const [, callbackCollegeId, id] = data.split('_');

          await rejectConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );

          await answerCallback(cbId, 'Rejected ❌', callbackCollegeId);
        } else if (data.startsWith('edit_')) {
          //console.log(`✏️ EDIT HIT: ${data}`);

          const [, callbackCollegeId, id] = data.split('_');

          await startEditMode(chatId, messageId, Number(id), callbackCollegeId);

          await answerCallback(cbId, 'Edit mode ✏️', callbackCollegeId);
        } else if (data.startsWith('more_')) {
          //console.log(`⚙️ MORE CLICKED`);

          const [, callbackCollegeId] = data.split('_');

          await answerCallback(cbId, 'More options ⚙️', callbackCollegeId);
        }
      } catch (err) {
        //console.error(`❌ CALLBACK ERROR:`, err.message);
        await answerCallback(cbId, 'Failed ❌', collegeId);
      }
    }
  } catch (error) {
    //console.error(`❌ POLL ERROR [${collegeId}]:`, error.message);
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
        const colleges = await College.find({ isActive: true });

        // 🔥 PARALLEL POLLING FIX
        for (const college of colleges) {
          pollTelegramUpdates(college.collegeId); // ❌ no await
        }
      } catch (error) {
        //console.error('❌ POLL LOOP ERROR:', error.message);
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  pollLoop();
}

module.exports = {
  startTelegramPoller,
};
