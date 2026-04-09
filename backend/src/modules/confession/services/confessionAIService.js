const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_MASTER_KEY);

async function generateConfessionAIAssets(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });

    const prompt = `
Read this anonymous confession and return ONLY valid JSON.

{
  "song": {
    "title": "",
    "artist": ""
  },
  "captionQuestion": "",
  "adminComment": ""
}

Rules:
- suggest one best matching Hindi/English song
- captionQuestion should be emotional and short
- adminComment should be moderation friendly

Confession:
${text.slice(0, 1200)}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI master service error:', error);

    return {
      song: {
        title: 'Kesariya',
        artist: 'Arijit Singh',
      },
      captionQuestion: 'Some feelings are never spoken 💜',
      adminComment: 'Normal confession',
    };
  }
}

module.exports = {
  generateConfessionAIAssets,
};
