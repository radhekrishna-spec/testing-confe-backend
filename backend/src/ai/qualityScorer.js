function scoreConfessionQuality(text = '') {
  let score = 0;

  const lower = text.toLowerCase();

  // ideal length
  if (text.length >= 40 && text.length <= 200) {
    score += 2;
  }

  // emotional words
  if (/crush|love|miss|hostel|canteen|attendance|friend/i.test(lower)) {
    score += 2;
  }

  // Hinglish vibe
  if (/yaar|bhai|yr|mujhe|usko|aaj|kal/i.test(lower)) {
    score += 2;
  }

  // too generic penalty
  if (/hello|hi|test|dummy/i.test(lower)) {
    score -= 3;
  }

  return score;
}

module.exports = {
  scoreConfessionQuality,
};
