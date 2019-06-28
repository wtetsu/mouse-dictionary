/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default (allRules, words) => {
  const rules = allRules[words.length];
  if (!rules) {
    return [];
  }
  const result = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const newWords = normalizeByRule(words, rule);
    result.push(newWords);
  }
  return result;
};

// ["provide", "him", "with", "money"], [0, 1, 0, 1]
//   -> ["provide", "A", "with", "B"]
//
// ["pick", "her", "up"], [0, -1, 0]
//   -> ["pick", "up]
const normalizeByRule = (words, rule) => {
  const result = [];
  let wordIndex = 0;
  const replaceIndices = [];
  for (let i = 0; i < rule.length; i++) {
    const p = rule[i];
    if (p === 0) {
      result.push(words[wordIndex]);
      wordIndex += 1;
    } else if (p > 0) {
      replaceIndices.push(result.length);
      result.push(null);
      wordIndex += p;
    } else {
      wordIndex += -p;
    }
  }
  if (replaceIndices.length === 1) {
    result[replaceIndices[0]] = "~";
  } else {
    let charCode = 65;
    for (let i = 0; i < replaceIndices.length; i++) {
      const index = replaceIndices[i];
      result[index] = String.fromCharCode(charCode);
      charCode += 1;
    }
  }
  return result;
};
