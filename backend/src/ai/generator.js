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
You are writing anonymous college confessions.

College: ${collegeId}

Trending themes in this college:
${smartTopics}

Use the tone and style from these real examples:

${sampleText}

Rules:
- sound like real students
- natural Hinglish
- highly relatable
- emotional / funny / viral
- no names
- each confession 60-80 words
- generate EXACTLY 3 unique confessions
- return ONLY 3 confessions separated by ###

Example format:
confession 1 ###
confession 2 ###
confession 3
`;

    console.log('🤖 GEMINI MODEL INIT:', {
      file: 'ai/generator.js',
      time: new Date().toISOString(),
    });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    console.log('📤 GEMINI REQUEST SENT', {
      file: 'ai/generator.js',
      promptLength: prompt.length,
      time: new Date().toISOString(),
    });

    const result = await model.generateContent(prompt);

    console.log('📥 GEMINI RESPONSE RECEIVED');

    console.log(result.response?.usageMetadata);

    let text = result.response.text().trim();

    let confessionTexts = text
      .split('###')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 3);

    // fallback if AI returns less than 3
    while (confessionTexts.length < 3) {
      confessionTexts.push(
        confessionTexts[0] ||
          'Koi mujhe canteen wali chai se zyada pasand karta hai kya? 😭',
      );
    }

    const savedConfessions = [];

    for (let i = 0; i < 3; i++) {
      let finalText = confessionTexts[i];

      let qualityScore = scoreConfessionQuality(finalText);

      if (qualityScore < 3) {
        console.log(
          `Low quality AI output for confession ${i + 1}, retrying...`,
        );

        const retryResult = await model.generateContent(
          `Generate one better Hinglish college confession for ${collegeId}`,
        );

        finalText = retryResult.response.text().trim();
      }

      const confession = await Confession.create({
        collegeId,
        message: finalText,
        status: i === 0 ? status : 'QUEUED',
        source: 'AI',
        isAIGenerated: true,
      });

      savedConfessions.push(confession);
    }

    return savedConfessions;
  } catch (error) {
    console.error('AI GENERATION ERROR:', error.message);
    throw error;
  }
}

module.exports = {
  generateAIConfession,
};
