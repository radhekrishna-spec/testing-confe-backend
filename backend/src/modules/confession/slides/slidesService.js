const { google } = require('googleapis');
const { autoFitTextConfig } = require('../helpers/slideTextFit');

const {
  getGoogleAuthClient,
} = require('../../../services/ai/google/googleAuthService');

const { exportSlideAsPNG } = require('../../../services/slideExportService');

const College = require('../../../models/College');

async function getTemplateId(collegeId) {
  if (!collegeId) {
    throw new Error('collegeId is required in getTemplateId');
  }

  const college = await College.findOne({
    collegeId,
    isActive: true,
  });

  if (!college) {
    throw new Error(`College not found: ${collegeId}`);
  }

  const templateId = college?.posting?.templateId;

  console.log('🎞️ TEMPLATE FETCH:', {
    collegeId,
    templateId,
  });

  if (!templateId) {
    throw new Error(`Missing templateId for ${collegeId}`);
  }

  return templateId;
}

async function createSlidePNG(
  text,
  confessionNo,
  partNo,
  totalParts,
  collegeId,
) {
  if (!collegeId) {
    throw new Error('collegeId missing in createSlidePNG');
  }

  const auth = getGoogleAuthClient();

  const drive = google.drive({
    version: 'v3',
    auth,
  });

  const slides = google.slides({
    version: 'v1',
    auth,
  });

  const templateId = await getTemplateId(collegeId);

  const { fontSize, lineSpacing } = autoFitTextConfig(text, type);

  console.log('📄 COPYING TEMPLATE:', {
    collegeId,
    templateId,
    confessionNo,
    partNo,
  });

  const copyRes = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name: `${collegeId}_confession_${confessionNo}_part_${partNo}`,
    },
  });

  const presentationId = copyRes.data.id;

  if (!presentationId) {
    throw new Error('Failed to create copied presentation');
  }

  try {
    const pres = await slides.presentations.get({
      presentationId,
    });

    const slide = pres.data.slides?.[0];

    if (!slide) {
      throw new Error('Slide not found in presentation');
    }

    const slideId = slide.objectId;

    const confessionShape = slide.pageElements?.find(
      (el) =>
        el.shape &&
        el.shape.text &&
        el.shape.text.textElements?.some((te) =>
          te.textRun?.content?.includes('{{CONFESSION}}'),
        ),
    );

    if (!confessionShape) {
      throw new Error('CONFESSION textbox not found');
    }

    const confessionBoxId = confessionShape.objectId;

    await slides.presentations.batchUpdate({
      presentationId,
      requestBody: {
        requests: buildSlideRequests(
          text,
          confessionNo,
          partNo,
          totalParts,
          confessionBoxId,
          fontSize,
          lineSpacing,
          collegeId,
        ),
      },
    });

    return await exportSlideAsPNG(auth, presentationId, slideId);
  } finally {
    try {
      await drive.files.delete({
        fileId: presentationId,
      });
    } catch (cleanupError) {
      console.error('🧹 SLIDE CLEANUP ERROR:', cleanupError.message);
    }
  }
}

function buildSlideRequests(
  text,
  confessionNo,
  partNo,
  totalParts,
  confessionBoxId,
  fontSize,
  lineSpacing,
  collegeId,
) {
  const footerText = totalParts > 1 ? `Part ${partNo}/${totalParts}` : '';

  return [
    {
      replaceAllText: {
        containsText: {
          text: '{{CONFESSION}}',
          matchCase: true,
        },
        replaceText: text,
      },
    },
    {
      replaceAllText: {
        containsText: {
          text: '{{FOOTER}}',
          matchCase: true,
        },
        replaceText: footerText,
      },
    },
    {
      replaceAllText: {
        containsText: {
          text: '{{ID_PLACEHOLDER}}',
          matchCase: true,
        },
        replaceText: `Confession #${confessionNo}`,
      },
    },
    {
      replaceAllText: {
        containsText: {
          text: '{{watermark}}',
          matchCase: false,
        },
        replaceText: `@${collegeId}_confession`,
      },
    },
    {
      updateTextStyle: {
        objectId: confessionBoxId,
        textRange: {
          type: 'ALL',
        },
        style: {
          fontSize: {
            magnitude: fontSize,
            unit: 'PT',
          },
        },
        fields: 'fontSize',
      },
    },
    {
      updateParagraphStyle: {
        objectId: confessionBoxId,
        textRange: {
          type: 'ALL',
        },
        style: {
          lineSpacing,
        },
        fields: 'lineSpacing',
      },
    },
  ];
}

async function generateSlidesImages(parts, confessionNo, collegeId) {
  if (!collegeId) {
    throw new Error('collegeId missing in generateSlidesImages');
  }

  return Promise.all(
    parts.map((part, index) =>
      createSlidePNG(part, confessionNo, index + 1, parts.length, collegeId),
    ),
  );
}

module.exports = {
  generateSlidesImages,
};
