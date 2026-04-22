const {
  validateAndPrepareText,
  processMediaFlow,
} = require('./services/confessionPipelineService');

const { getNextConfessionNo } = require('./services/confessionCounter');

const { checkDuplicate } = require('./services/duplicateService');

const { createCaptionFlow } = require('./helpers/captionBuilderService');

const { getSettings } = require('../../services/settingsService');

async function processFormSubmit(data, existingConfessionNo = null) {
  const { fromAdminUI = false } = data;
  const startTime = Date.now();

  try {
    const settings = normalizeSettings(getSettings());

    const { text, type } = validateAndPrepareText(data);

    if (!existingConfessionNo && settings.duplicateCheck) {
      checkDuplicate(text);
    }

    // optional: make college-wise if needed later
    const confessionNo =
      existingConfessionNo || (await getNextConfessionNo(data.collegeId));

    let mediaResult = {
      confessionNo,
      images: [],
      telegramImages: [],
    };

    if (!fromAdminUI || true) {
      mediaResult = await processMediaFlow(
        data,
        confessionNo,
        settings,
        data.collegeId,
      );
    }

    console.log('⚙️ SETTINGS:', settings);

    console.log('📨 TELEGRAM PREVIEW:', settings.telegramPreview);

    if (settings.telegramPreview) {
      const { sendTelegram } = require('../social/telegramService');

      try {
        console.log('📸 TELEGRAM IMAGES:', mediaResult.telegramImages);

        console.log('🔢 CONFESSION NO:', mediaResult.confessionNo);

        console.log('🏫 COLLEGE ID:', data.collegeId);

        const delay = fromAdminUI ? 2000 : 8000;

        await new Promise((resolve) => setTimeout(resolve, delay));

        console.log(
          fromAdminUI
            ? '⚡ ADMIN AUTO FLOW → TELEGRAM in 2s'
            : '🚀 NORMAL FLOW → TELEGRAM in 8s',
        );

        const tgResult = await sendTelegram(
          mediaResult.telegramImages,
          '',
          mediaResult.confessionNo,
          data.collegeId,
          !!existingConfessionNo,
        );

        console.log('✅ TELEGRAM SENT SUCCESS:', tgResult);

        if (fromAdminUI) {
          setTimeout(async () => {
            try {
              const {
                autoApproveConfession,
              } = require('./services/adminAutoApproveService');

              await autoApproveConfession(
                mediaResult.confessionNo,
                data.collegeId,
              );

              console.log(
                `⚡ AUTO APPROVED FROM ADMIN UI: #${mediaResult.confessionNo} (${data.collegeId})`,
              );
            } catch (error) {
              console.error('❌ AUTO APPROVE FAILED:', error.message);
            }
          }, 3000);
        }
      } catch (error) {
        console.error(
          '❌ Telegram send failed but confession saved:',
          error.response?.data || error.message,
        );
      }
    }

    return {
      success: true,
      confessionNo: mediaResult.confessionNo,
      collegeId: data.collegeId,
      text,
      images: mediaResult.images,
    };
  } catch (error) {
    console.error('FORM SUBMIT ERROR:', error.message);
    throw error;
  } finally {
    console.log(`DONE IN ${Date.now() - startTime}ms`);
  }
}

function normalizeSettings(rawSettings) {
  return {
    duplicateCheck:
      rawSettings.duplicateCheck ?? rawSettings.isDuplicate ?? true,

    autoSplitParts: rawSettings.autoSplitParts ?? rawSettings.split ?? true,

    telegramPreview:
      rawSettings.telegramPreview ?? rawSettings.telegram ?? true,
  };
}

module.exports = {
  processFormSubmit,
};
