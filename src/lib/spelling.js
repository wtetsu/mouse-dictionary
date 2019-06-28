/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import data from "./data";

const convert = words => {
  let converted = false;
  const convertedWords = [];
  for (let j = 0; j < words.length; j++) {
    const word = words[j];
    const convertedWord = convertWord(word);
    if (convertedWord) {
      converted = true;
      convertedWords.push(convertedWord);
    } else {
      convertedWords.push(word);
    }
  }
  if (!converted) {
    return null;
  }
  return convertedWords;
};

const convertWord = word => {
  const w = data.spellings.get(word);
  if (w) {
    return w;
  }
  return null;
};

export default { convert };
