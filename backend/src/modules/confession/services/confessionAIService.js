const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔑 GEMINI KEY:', !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateConfessionAIAssets(text) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
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
    console.log('📤 GEMINI REQUEST SENT', {
      file: 'confessionAIService.js',
      promptLength: prompt.length,
      time: new Date().toISOString(),
    });
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
