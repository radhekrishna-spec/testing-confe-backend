const Groq = require('groq-sdk');
const { getCollegeMemory } = require('./memoryService');
const { detectTopTopics } = require('./topicAnalyzer');
const { getTopWeightedTopics } = require('./topicTrainer');
const Confession = require('../models/Confession');
const { scoreConfessionQuality } = require('./qualityScorer');
const {
  getNextConfessionNo,
} = require('../modules/confession/services/confessionCounter');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    console.log('🤖 GROQ MODEL INIT:', {
      file: 'ai/generator.js',
      time: new Date().toISOString(),
      model: 'llama-3.3-70b-versatile',
    });

    console.log('📤 GROQ REQUEST SENT', {
      promptLength: prompt.length,
      collegeId,
    });

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
    });

    const text = result?.choices?.[0]?.message?.content?.trim() || '';

    console.log('🧠 RAW AI TEXT:', text);

    if (!text) {
      throw new Error('Empty AI response from Groq');
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

        const retryResult = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: `Generate one better Hinglish college confession for ${collegeId}`,
            },
          ],
          temperature: 1,
        });

        finalText =
          retryResult?.choices?.[0]?.message?.content?.trim() || finalText;
      }
      const confessionNo = await getNextConfessionNo();

      const confession = await Confession.create({
        confessionNo,
        collegeId,
        message: finalText,
        status: i === 0 ? status : 'PENDING',
        source: 'AI',
        isAIGenerated: true,
      });

      console.log(`✅ SAVED TO DB: ${confession._id}`);

      savedConfessions.push(confession);
    }

    console.log(`🎉 TOTAL SAVED: ${savedConfessions.length}`);

    return savedConfessions;
  } catch (error) {
    console.error('❌ GROQ AI GENERATION ERROR:', error);
    throw error;
  }
}

module.exports = {
  generateAIConfession,
};
