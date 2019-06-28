/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

/**
 * ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
 */
export default (pronounRule, words) => {
  let result = [];
  let changed = false;
  for (let i = 0; i < pronounRule.length; i++) {
    const convertedWords = [...words];
    for (let j = 0; j < convertedWords.length; j++) {
      const w = doConvert(convertedWords[j], pronounRule[i]);
      if (w) {
        convertedWords[j] = w;
        changed = true;
      }
    }
    if (changed) {
      result.push(convertedWords);
    }
  }
  return result;
};

const doConvert = (word, pronouns) => {
  let result = null;
  const w = pronouns.get(word);
  if (w) {
    result = w;
  } else {
    const firstCode = word.charCodeAt(0);
    if (firstCode >= 65 && firstCode <= 90 && (word.endsWith("'s") || word.endsWith("s'"))) {
      result = pronouns.get("'s");
    }
  }
  return result;
};
