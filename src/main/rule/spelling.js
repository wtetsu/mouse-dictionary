/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default (spellingRule, words) => {
  let converted = false;
  const convertedWords = [];
  for (let j = 0; j < words.length; j++) {
    const word = words[j];
    const convertedWord = spellingRule.get(word);
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
