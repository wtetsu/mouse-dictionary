/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const convert = words => {
  let converted = false;
  const convertedWords = [];
  for (let j = 0; j < words.length; j++) {
    const word = words[j];
    const w = SPELLING[word];
    if (w) {
      converted = true;
      convertedWords.push(w);
    } else {
      convertedWords.push(word);
    }
  }
  if (!converted) {
    return null;
  }
  return convertedWords;
};

const SPELLING = {
  centre: "center",
  colour: "color"
};

export default { convert };
