const { startTelegramPoller } = require('./telegramPoller');
const { testPostAt220 } = require('./schedulerWorker');
const {
  startEditQueueWorker,
} = require('../modules/confession/workers/editQueueWorker');

const { startSchedulerWorker } = require('./schedulerWorker');
const { startRecoveryWorker } = require('./recoveryWorker');

const store = require('../store/store');

let pollerStarted = false;

async function startWorkers() {
  // 🔥 GLOBAL LOCK (DB/STORE BASED)
  const LOCK_KEY = 'GLOBAL_WORKER_LOCK';

  if (store.get(LOCK_KEY)) {
    console.log('⚠️ Workers already running (LOCK FOUND)');
    return;
  }

  store.set(LOCK_KEY, '1');

  if (pollerStarted) {
    return;
  }

  pollerStarted = true;

  console.log('🚀 STARTING ALL WORKERS...');

  startTelegramPoller();
  startEditQueueWorker();
  startSchedulerWorker();
  testPostAt220();
  startRecoveryWorker();

  console.log('✅ WORKERS STARTED (SINGLE INSTANCE)');
}

module.exports = {
  startWorkers,
};
