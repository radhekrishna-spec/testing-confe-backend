function buildCollegePrompt(collegeId, samples, rejectedExamples = []) {
  const sampleText = samples.length
    ? samples.map((x) => x.message).join('\n')
    : '';

  const rejectedText = rejectedExamples.length
    ? rejectedExamples.map((x) => x.message).join('\n')
    : '';

  return `
Generate ONE realistic anonymous confession
for ${collegeId} students.

GOOD examples:
${sampleText}

AVOID writing similar to:
${rejectedText}

Rules:
- student style
- realistic
- short
- emotional
- no names
`;
}

module.exports = {
  buildCollegePrompt,
};
