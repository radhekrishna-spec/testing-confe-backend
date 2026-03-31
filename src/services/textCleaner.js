function cleanText(raw) {
  let text = raw
    .replace(/\r/g, '')
    .replace(/\uFE0F/g, '')
    .replace(/[—]/g, '')
    .replace(/@\w+/g, 'id ')
    .replace(/\.{3,}/g, '...')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

module.exports = { cleanText };
