const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAISongRecommendation(confessionText) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
You are a music recommendation engine.

Read this anonymous confession carefully and suggest ONLY ONE most suitable Hindi/English song.

Return ONLY valid JSON:
{
  "title": "song title",
  "artist": "artist name"
}

Confession:
${confessionText}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const parsed = JSON.parse(response);

    return parsed;
  } catch (error) {
    console.error('Gemini song recommendation error:', error);

    return {
      title: 'Kesariya',
      artist: 'Arijit Singh',
    };
  }
}

module.exports = getAISongRecommendation;
