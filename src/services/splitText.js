function splitTextSmart(text, limit) {
  const parts = [];

  while (text.length > limit) {
    let splitIndex = text.lastIndexOf(' ', limit);

    if (splitIndex === -1) splitIndex = limit;

    parts.push(text.slice(0, splitIndex));

    text = text.slice(splitIndex).trim();
  }

  parts.push(text);

  return parts;
}

module.exports = { splitTextSmart };
