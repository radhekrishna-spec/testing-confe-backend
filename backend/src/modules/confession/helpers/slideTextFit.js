function autoFitTextConfig(text, type = 'confession') {
  // =========================
  // 📌 SHAYARI MODE
  // =========================
  if (type === 'shayari') {
    const textLength = text.length;

    let fontSize;
    let lineSpacing = 110;

    if (textLength <= 20) lineSpacing = 75;
    else if (textLength <= 30) lineSpacing = 82;
    else if (textLength <= 40) lineSpacing = 88;
    else if (textLength <= 50) lineSpacing = 92;
    else if (textLength <= 60) lineSpacing = 96;
    else if (textLength <= 84) lineSpacing = 95;

    if (textLength <= 50) fontSize = 50;
    else if (textLength <= 60) fontSize = 48;
    else if (textLength <= 84) fontSize = 46;
    else if (textLength <= 104) fontSize = 44;
    else if (textLength <= 120) fontSize = 42;
    else if (textLength <= 144) fontSize = 40;
    else if (textLength <= 170) fontSize = 38;
    else if (textLength <= 180) fontSize = 36;
    else if (textLength <= 209) fontSize = 34;
    else if (textLength <= 220) fontSize = 32;
    else if (textLength <= 240) fontSize = 30;
    else if (textLength <= 264) fontSize = 28;
    else if (textLength <= 299) fontSize = 26;
    else if (textLength <= 336) fontSize = 24;
    else if (textLength <= 350) fontSize = 22;
    else if (textLength <= 405) fontSize = 20;
    else if (textLength <= 464) fontSize = 18;
    else if (textLength <= 510) fontSize = 16;
    else if (textLength <= 576) fontSize = 14;
    else if (textLength <= 627) fontSize = 12;
    else if (textLength <= 665) fontSize = 10;
    else fontSize = 8;

    return {
      fontSize,
      lineSpacing,
    };
  }

  // =========================
  // 📌 CONFESSION MODE (DEFAULT)
  // =========================
  const textLength = text.length;

  let fontSize;
  let lineSpacing = 110;

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
