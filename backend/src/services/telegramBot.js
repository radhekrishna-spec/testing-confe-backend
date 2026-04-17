const TelegramBot = require('node-telegram-bot-api');
const Confession = require('../models/Confession');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

console.log('🤖 Telegram bot started...');

// 🔥 CALLBACK HANDLER (APPROVE BUTTON FIX)
bot.on('callback_query', async (query) => {
  try {
    const data = query.data;

    console.log('🔥 CALLBACK:', data);

    if (data.startsWith('approve_')) {
      const id = data.split('_')[1];

      await Confession.findByIdAndUpdate(id, {
        status: 'approved',
      });

      await bot.answerCallbackQuery(query.id, {
        text: 'Approved ✅',
      });

      console.log('✅ Approved:', id);
    }
  } catch (err) {
    console.error('❌ BOT ERROR:', err);
  }
});

module.exports = bot;
