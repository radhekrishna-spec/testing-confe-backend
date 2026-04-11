const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getCollegeMemory } = require('./memoryService');
const { detectTopTopics } = require('./topicAnalyzer');
const { getTopWeightedTopics } = require('./topicTrainer');
const Confession = require('../models/Confession');
const { scoreConfessionQuality } = require('./qualityScorer');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAIConfession(collegeId, status = 'QUEUED') {
  try {
    const samples = await getCollegeMemory(collegeId);

    console.log(`AI memory samples for ${collegeId}:`, samples.length);

    const sampleText = samples
      .slice(0, 20)
      .map((x, i) => `${i + 1}. ${x.message}`)
      .join('\n');

    const topTopics = detectTopTopics(samples).join(', ');

    const weightedTopics = await getTopWeightedTopics(collegeId);

    const smartTopics = weightedTopics.length
      ? weightedTopics.join(', ')
      : topTopics;

    const prompt = `
You are writing an anonymous college confession.

College: ${collegeId}

Trending themes in this college:
${smartTopics}

Use the tone and style from these real examples:

${sampleText}

Rules:
- sound like a real student
- natural Hinglish
- highly relatable
- should match trending college topics
- emotional / funny / viral
- no names
- max 60-80 words

Only return confession text.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();
    let finalText = text;

    let qualityScore = scoreConfessionQuality(text);

    if (qualityScore < 3) {
      console.log('Low quality AI output, retrying...');

      const retryResult = await model.generateContent(prompt);

      finalText = retryResult.response.text().trim();
    }

    const confession = await Confession.create({
      collegeId,
      message: finalText,
      status,
      source: 'AI',
      isAIGenerated: true,
    });

    return confession;
  } catch (error) {
    console.error('AI GENERATION ERROR:', error.message);
    throw error;
  }
}

module.exports = {
  generateAIConfession,
};
