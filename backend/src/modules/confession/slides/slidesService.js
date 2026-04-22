const { google } = require('googleapis');
const { autoFitTextConfig } = require('../helpers/slideTextFit');

const {
  getGoogleAuthClient,
} = require('../../../services/ai/google/googleAuthService');

const { exportSlideAsPNG } = require('../../../services/slideExportService');

const College = require('../../../models/College');

// ======================
// 🎯 TEMPLATE FETCH
// ======================
async function getTemplateId(collegeId) {
  if (!collegeId) {
    throw new Error('collegeId is required in getTemplateId');
  }

  const college = await College.findOne({
    collegeId,
    isActive: true,
  });
  console.log('🏫 COLLEGE FROM DB:', {
    collegeIdFromDB: college?.collegeId,
    pageNameFromDB: college?.pageName,
  });

  if (!college) {
    throw new Error(`College not found: ${collegeId}`);
  }
  const pageName = college?.pageName || `${collegeId}_confession`;
  console.log('🎯 FINAL PAGENAME USED:', pageName);
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

// ======================
// 🎯 CREATE SLIDE
// ======================
async function createSlidePNG(
  text,
  confessionNo,
  partNo,
  totalParts,
  collegeId,
  type,
) {
  if (!collegeId) {
    throw new Error('collegeId missing in createSlidePNG');
  }

  console.log('🧾 RAW TEXT:', JSON.stringify(text)); // 🔥 DEBUG
  console.log('🔥 COLLEGE ID RECEIVED:', collegeId);
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

  const college = await College.findOne({ collegeId, isActive: true });
  console.log('🏫 COLLEGE FROM DB:', {
    collegeIdFromDB: college?.collegeId,
    pageNameFromDB: college?.pageName,
  });
  const pageName = college?.pageName || `${collegeId}_confession`;
  console.log('🎯 FINAL PAGENAME USED:', pageName);

  const { fontSize, lineSpacing } = autoFitTextConfig(text, type);

  console.log('🎨 STYLE CONFIG:', {
    fontSize,
    lineSpacing,
    type,
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

    console.log('📦 TEXTBOX ID:', confessionBoxId);

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
          pageName,
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

// ======================
// 🎯 BUILD REQUESTS (🔥 FIXED)
// ======================
function buildSlideRequests(
  text,
  confessionNo,
  partNo,
  totalParts,
  confessionBoxId,
  fontSize,
  lineSpacing,
  pageName,
) {
  const footerText = totalParts > 1 ? `Part ${partNo}/${totalParts}` : '';

  console.log('🧠 FINAL TEXT TO INSERT:', JSON.stringify(text)); // 🔥 DEBUG

  return [
    // ❌ REMOVE OLD TEXT
    {
      deleteText: {
        objectId: confessionBoxId,
        textRange: {
          type: 'ALL',
        },
      },
    },

    // ✅ INSERT TEXT (NEWLINE SAFE)
    {
      insertText: {
        objectId: confessionBoxId,
        insertionIndex: 0,
        text: text,
      },
    },

    // FOOTER
    {
      replaceAllText: {
        containsText: {
          text: '{{FOOTER}}',
          matchCase: true,
        },
        replaceText: footerText,
      },
    },

    // CONFESSION ID
    {
      replaceAllText: {
        containsText: {
          text: '{{ID_PLACEHOLDER}}',
          matchCase: true,
        },
        replaceText: `Confession #${confessionNo}`,
      },
    },

    // WATERMARK
    {
      replaceAllText: {
        containsText: {
          text: '{{watermark}}',
          matchCase: false,
        },
        replaceText: `@${pageName}`,
      },
    },

    // FONT SIZE
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

    // 🔥 FINAL FIX: PARAGRAPH STYLE FORCE
    {
      updateParagraphStyle: {
        objectId: confessionBoxId,
        textRange: {
          type: 'ALL',
        },
        style: {
          lineSpacing,
          spaceAbove: { magnitude: 0, unit: 'PT' },
          spaceBelow: { magnitude: 0, unit: 'PT' },
        },
        fields: 'lineSpacing,spaceAbove,spaceBelow',
      },
    },
  ];
}

// ======================
// 🎯 MAIN
// ======================
async function generateSlidesImages(parts, confessionNo, collegeId, type) {
  if (!collegeId) {
    throw new Error('collegeId missing in generateSlidesImages');
  }

  return Promise.all(
    parts.map((part, index) =>
      createSlidePNG(
        part,
        confessionNo,
        index + 1,
        parts.length,
        collegeId,
        type,
      ),
    ),
  );
}

module.exports = {
  generateSlidesImages,
};
