const Groq = require('groq-sdk');
const { getCollegeMemory } = require('../../../ai/memoryService');
const { detectTopTopics } = require('../../../ai/topicAnalyzer');
const { getTopWeightedTopics } = require('../../../ai/topicTrainer');
const Confession = require('../../../models/Confession');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function getNextConfessionNo(collegeId) {
  const last = await Confession.findOne({ collegeId })
    .sort({ confessionNo: -1 })
    .select('confessionNo');

  return last ? last.confessionNo + 1 : 1;
}

async function generateAIConfession(collegeId, status = 'PENDING') {
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
- highly relatable
- no names
- 60-80 words each
- generate EXACTLY 3 unique confessions
- separate each confession with ###

Return only confession text.
`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
    });

    let text = response.choices[0].message.content.trim();

    let confessionTexts = text
      .split('###')
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 3);

    while (confessionTexts.length < 3) {
      confessionTexts.push(confessionTexts[0]);
    }

    let nextConfessionNo = await getNextConfessionNo(collegeId);

    const savedConfessions = [];

    for (let i = 0; i < 3; i++) {
      const confession = await Confession.create({
        confessionNo: nextConfessionNo++,
        collegeId,
        message: confessionTexts[i],
        status: i === 0 ? status : 'PENDING',
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
