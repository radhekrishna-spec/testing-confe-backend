const axios = require('axios');
const store = require('../store/store');

const {
  approveConfession,
  rejectConfession,
  startEditMode,
  confirmEdit,
} = require('../services/telegramUpdateService');

const College = require('../models/College');
const getTelegramConfig = require('../utils/getTelegramConfig');

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
  try {
    const { baseUrl } = await getTelegramConfig(collegeId);

    await axios.post(`${baseUrl}/answerCallbackQuery`, {
      callback_query_id: cbId,
      text,
      show_alert: false,
    });
  } catch (error) {
    console.error('❌ CALLBACK ANSWER ERROR:', error.message);
  }
}

async function pollTelegramUpdates(collegeId) {
  if (pollingState.get(collegeId)) return;

  pollingState.set(collegeId, true);

  try {
    const { baseUrl } = await getTelegramConfig(collegeId);
   
    let lastUpdateId = getLastUpdateId(collegeId);
    console.log(
      `🚀 POLLING START: ${collegeId} | lastUpdateId=${lastUpdateId}`,
    );

    const res = await axios.get(`${baseUrl}/getUpdates`, {
      params: {
        offset: lastUpdateId,
        timeout: 10,
      },
      timeout: 15000,
    });

    const updates = res.data?.result || [];

    console.log(`📥 [${collegeId}] Updates count: ${updates.length}`);

    for (const update of updates) {
      lastUpdateId = update.update_id+1;
      store.set(`last_update_id_${collegeId}`, lastUpdateId);

      // ==========================
      // TEXT INPUT (EDIT FLOW)
      // ==========================
      if (update.message?.text) {
        const text = update.message.text.trim();
        const chatId = update.message.chat.id;

        console.log(`💬 TEXT RECEIVED: ${text}`);

        const activeEditId = store.get(`editing_active_${collegeId}`);
        const awaitingEdit = store.get(`awaiting_edit_input_${collegeId}`);
        const editingChat = store.get(`editing_chat_${collegeId}`);

        if (
          awaitingEdit === '1' &&
          activeEditId &&
          String(editingChat) === String(chatId)
        ) {
          console.log(`✏️ EDIT INPUT DETECTED`);

          await confirmEdit(chatId, activeEditId, text, collegeId);
          continue;
        }
      }

      // ==========================
      // CALLBACK HANDLING
      // ==========================
      if (!update.callback_query) continue;

      const cb = update.callback_query;
      const cbId = cb.id;
      const data = cb.data;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;

      console.log(`🔥 CALLBACK RECEIVED: ${data}`);

      // duplicate callback prevent
      if (processedCallbacks.has(cbId)) {
        console.log(`⚠️ DUPLICATE CALLBACK SKIPPED`);
        continue;
      }

      processedCallbacks.set(cbId, Date.now());
      cleanupProcessedCallbacks();

      try {
        const parts = data.split('_');

        if (parts.length < 2) {
          console.error('❌ INVALID CALLBACK DATA:', data);
          continue;
        }

        const action = parts[0];
        const callbackCollegeId = parts[1];
        const id = parts[2];

        console.log(`👉 ACTION: ${action}, ID: ${id}`);

        if (action === 'approve') {
          await answerCallback(cbId, 'Processing...', callbackCollegeId);

          await approveConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );

          console.log(`✅ APPROVED SUCCESS`);
        } else if (action === 'reject') {
          await rejectConfession(
            chatId,
            messageId,
            Number(id),
            callbackCollegeId,
          );

          await answerCallback(cbId, 'Rejected ❌', callbackCollegeId);

          console.log(`❌ REJECTED`);
        } else if (action === 'edit') {
          await startEditMode(chatId, messageId, Number(id), callbackCollegeId);

          await answerCallback(cbId, 'Edit mode ✏️', callbackCollegeId);
        } else if (action === 'more') {
          await answerCallback(cbId, 'More options ⚙️', callbackCollegeId);
        }
      } catch (err) {
        console.error(`❌ CALLBACK ERROR FULL:`, err);

        await answerCallback(cbId, 'Failed ❌', parts?.[1]);
      }
    }
  } catch (error) {
    console.error(`❌ POLL ERROR [${collegeId}]:`, error.message);
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

        for (const college of colleges) {
          pollTelegramUpdates(college.collegeId);
        }
      } catch (error) {
        console.error('❌ POLL LOOP ERROR:', error.message);
      }

      // 🔥 stable delay
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  pollLoop();
}

module.exports = {
  startTelegramPoller,
};
