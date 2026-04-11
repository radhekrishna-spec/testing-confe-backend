function detectTopTopics(samples = []) {
  const text = samples.map((x) => x.message?.toLowerCase() || '').join(' ');

  const topics = [];

  if (/crush|love|girlfriend|boyfriend|miss/i.test(text)) {
    topics.push('love');
  }

  if (/hostel|roommate|mess/i.test(text)) {
    topics.push('hostel');
  }

  if (/canteen|chai|coffee|maggi/i.test(text)) {
    topics.push('canteen');
  }

  if (/teacher|faculty|sir|maam/i.test(text)) {
    topics.push('faculty');
  }

  if (/attendance|proxy|class|lecture/i.test(text)) {
    topics.push('attendance');
  }

  return topics.length ? topics : ['student-life'];
}

module.exports = {
  detectTopTopics,
};
