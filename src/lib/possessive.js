/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "./utils";

/**
 * ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
 */
const normalize = words => {
  let result = [];

  let changed = false;

  for (let i = 0; i < pronounsList.length; i++) {
    const convertedWords = [...words];
    for (let j = 0; j < convertedWords.length; j++) {
      const w = doConvert(convertedWords[j], pronounsList[i]);
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

// Lazy load
const pronounsList = [];

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
utils.loadJson("data/possessives.json").then(data => {
  for (let i = 0; i < data.length; i++) {
    pronounsList.push(new Map(data[i]));
  }
});

export default { normalize };
