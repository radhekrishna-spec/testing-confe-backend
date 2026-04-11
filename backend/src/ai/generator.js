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

Trending themes:
${smartTopics}

Examples:
${sampleText}

Rules:
- natural Hinglish
- emotional / funny / viral
- relatable
- no names
- generate EXACTLY 3 unique confessions
- separate by ###

Example:
confession 1 ###
confession 2 ###
confession 3
`;

    console.log('🤖 GEMINI MODEL INIT:', {
      file: 'ai/generator.js',
      time: new Date().toISOString(),
    });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
    });

    console.log('📤 GEMINI REQUEST SENT', {
      promptLength: prompt.length,
      collegeId,
    });

    const result = await model.generateContent(prompt);

    console.log('📥 GEMINI RESPONSE RECEIVED');
    console.log('📊 USAGE:', result.response?.usageMetadata);

    const text = result.response.text()?.trim() || '';

    console.log('🧠 RAW AI TEXT:', text);

    if (!text) {
      throw new Error('Empty AI response');
    }

    let confessionTexts = text
      .split('###')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 3);

    console.log('✂️ SPLIT CONFESSIONS:', confessionTexts);

    while (confessionTexts.length < 3) {
      confessionTexts.push(
        confessionTexts[0] ||
          'Koi mujhe canteen wali chai se zyada pasand karta hai kya? 😭',
      );
    }

    const savedConfessions = [];

    for (let i = 0; i < 3; i++) {
      let finalText = confessionTexts[i];

      console.log(`📝 SAVING CONFESSION ${i + 1}:`, finalText);

      const qualityScore = scoreConfessionQuality(finalText);

      if (qualityScore < 3) {
        console.log(`⚠️ Low quality confession ${i + 1}, retrying...`);

        const retryResult = await model.generateContent(
          `Generate one better Hinglish college confession for ${collegeId}`,
        );

        finalText = retryResult.response.text()?.trim() || finalText;
      }

      const confession = await Confession.create({
        collegeId,
        message: finalText,
        status: i === 0 ? status : 'QUEUED',
        source: 'AI',
        isAIGenerated: true,
      });

      console.log(`✅ SAVED TO DB: ${confession._id}`);

      savedConfessions.push(confession);
    }

    console.log(`🎉 TOTAL SAVED: ${savedConfessions.length}`);

    return savedConfessions;
  } catch (error) {
    console.error('❌ AI GENERATION ERROR FULL:', error);
    throw error;
  }
}

module.exports = {
  generateAIConfession,
};
