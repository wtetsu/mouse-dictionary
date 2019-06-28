/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "./utils";

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

// Lazy load
const spellings = new Map();

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
utils.loadJson("data/spelling.json").then(data => utils.updateMap(spellings, data));

const convertWord = word => {
  const w = spellings.get(word);
  if (w) {
    return w;
  }
  return null;
};

export default { convert };
