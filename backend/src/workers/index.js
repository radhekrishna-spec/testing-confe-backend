const { startTelegramPoller } = require('./telegramPoller');

const {
  startEditQueueWorker,
} = require('../modules/confession/workers/editQueueWorker');

const { startSchedulerWorker } = require('./schedulerWorker');
const { startRecoveryWorker } = require('./recoveryWorker');

function startWorkers() {
  startTelegramPoller();
  startEditQueueWorker();
  startSchedulerWorker();
  startRecoveryWorker();
}

module.exports = {
  startWorkers,
};
