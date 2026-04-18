function autoFitTextConfig(text, type = 'confession') {
  const textLength = text.length;

  // =========================
  // 📌 SHAYARI MODE (SMART UPDATED)
  // =========================
  if (type === 'shayari') {
    const minFont = 8;
    const maxFont = 50;
    const maxLength = 700;

    // 🔹 Smooth font scaling
    let fontSize = maxFont - (textLength / maxLength) * (maxFont - minFont);

    fontSize = Math.max(minFont, Math.min(maxFont, Math.round(fontSize)));

    // 🔹 Smart line spacing
    let lineSpacing;

    if (textLength < 30) lineSpacing = 75;
    else if (textLength < 60) lineSpacing = 85;
    else if (textLength < 120) lineSpacing = 92;
    else if (textLength < 250) lineSpacing = 100;
    else if (textLength < 400) lineSpacing = 105;
    else lineSpacing = 110;

    // 🔹 Multiline shayari detection
    const lineCount = text.split('\n').length;
    if (lineCount > 8) {
      lineSpacing -= 5;
      fontSize -= 2;
    }

    return {
      fontSize,
      lineSpacing,
    };
  }

  // =========================
  // 📌 CONFESSION MODE (UNCHANGED)
  // =========================
  let fontSize;
  let lineSpacing = 100;

  if (textLength <= 20) lineSpacing = 75;
  else if (textLength <= 30) lineSpacing = 82;
  else if (textLength <= 40) lineSpacing = 88;
  else if (textLength <= 50) lineSpacing = 92;
  else if (textLength <= 60) lineSpacing = 96;
  else if (textLength <= 84) lineSpacing = 95;

  if (textLength <= 50) fontSize = 115;
  else if (textLength <= 60) fontSize = 100;
  else if (textLength <= 84) fontSize = 96;
  else if (textLength <= 104) fontSize = 85;
  else if (textLength <= 120) fontSize = 77;
  else if (textLength <= 144) fontSize = 72;
  else if (textLength <= 170) fontSize = 66;
  else if (textLength <= 180) fontSize = 63;
  else if (textLength <= 209) fontSize = 60;
  else if (textLength <= 220) fontSize = 58;
  else if (textLength <= 240) fontSize = 56;
  else if (textLength <= 264) fontSize = 54;
  else if (textLength <= 299) fontSize = 52;
  else if (textLength <= 336) fontSize = 50;
  else if (textLength <= 350) fontSize = 48;
  else if (textLength <= 405) fontSize = 46;
  else if (textLength <= 464) fontSize = 44;
  else if (textLength <= 510) fontSize = 42;
  else if (textLength <= 576) fontSize = 40;
  else if (textLength <= 627) fontSize = 38;
  else if (textLength <= 665) fontSize = 36;
  else fontSize = 34;

  return {
    fontSize,
    lineSpacing,
  };
}

module.exports = {
  autoFitTextConfig,
};
