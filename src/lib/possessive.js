/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

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
      result = pronouns["'s"];
    }
  }
  return result;
};

const ONES = "one's";
const SOMEONE = "someone";
const SOMEONES = "someone's";
const ONESELF = "oneself";
const pronounsList = [
  new Map([
    ["my", ONES],
    ["your", ONES],
    ["his", ONES],
    ["her", ONES],
    ["its", ONES],
    ["our", ONES],
    ["their", ONES],
    ["'s", ONES],
    ["one's", ONES],
    ["someone's", SOMEONES],
    ["myself", ONESELF],
    ["yourself", ONESELF],
    ["himself", ONESELF],
    ["herself", ONESELF],
    ["ourselves", ONESELF],
    ["themselves", ONESELF],
    ["him", SOMEONE],
    ["them", SOMEONE],
    ["us", SOMEONE]
  ]),
  new Map([
    ["my", SOMEONES],
    ["your", SOMEONES],
    ["his", SOMEONES],
    ["her", SOMEONES],
    ["its", SOMEONES],
    ["our", SOMEONES],
    ["their", SOMEONES],
    ["'s", SOMEONES],
    ["one's", ONES],
    ["someone's", SOMEONES],
    ["myself", ONESELF],
    ["yourself", ONESELF],
    ["himself", ONESELF],
    ["herself", ONESELF],
    ["ourselves", ONESELF],
    ["themselves", ONESELF],
    ["him", SOMEONE],
    ["them", SOMEONE],
    ["us", SOMEONE]
  ]),
  new Map([
    ["my", SOMEONES],
    ["your", SOMEONES],
    ["his", SOMEONES],
    ["her", SOMEONE],
    ["its", SOMEONES],
    ["our", SOMEONES],
    ["their", SOMEONES],
    ["'s", SOMEONES],
    ["one's", ONES],
    ["someone's", SOMEONES],
    ["myself", ONESELF],
    ["yourself", ONESELF],
    ["himself", ONESELF],
    ["herself", ONESELF],
    ["ourselves", ONESELF],
    ["themselves", ONESELF],
    ["him", SOMEONE],
    ["them", SOMEONE],
    ["us", SOMEONE]
  ])
];

export default { normalize };
