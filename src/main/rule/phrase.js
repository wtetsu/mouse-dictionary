/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default (allRules, words) => {
  const ruleDataList = allRules[words.length];
  if (!ruleDataList) {
    return [];
  }
  const result = [];
  for (let i = 0; i < ruleDataList.length; i++) {
    const ruleData = ruleDataList[i];
    const newWords = normalizeByRule(words, ruleData);
    result.push(newWords);
  }
  return result;
};

// ["provide", "him", "with", "money"], [0, 1, 0, 1]
//   -> ["provide", "A", "with", "B"]
//
// ["pick", "her", "up"], [0, -1, 0]
//   -> ["pick", "up]
const normalizeByRule = (words, ruleData) => {
  const result = [];
  let wordIndex = 0;
  const replaceIndices = [];
  for (let i = 0; i < ruleData.length; i++) {
    const code = ruleData[i];
    if (code === 0) {
      result.push(words[wordIndex]);
      wordIndex += 1;
    } else if (code === 102) {
      result.push("a");
      wordIndex += 1;
    } else if (code === 103) {
      result.push("a");
    } else if (code === 104 && words[wordIndex] === "/") {
      result.push("and");
      wordIndex += 1;
    } else if (code === 105 && words[wordIndex] === "/") {
      result.push("or");
      wordIndex += 1;
    } else if (code > 0) {
      replaceIndices.push(result.length);
      result.push(null);
      wordIndex += code;
    } else {
      wordIndex += -code;
    }
  }
  if (replaceIndices.length === 0) {
    return result;
  }

  if (replaceIndices.length === 1) {
    result[replaceIndices[0]] = "~";
  } else {
    for (let i = 0; i < replaceIndices.length; i++) {
      const index = replaceIndices[i];
      const charCode = 65 + i;
      result[index] = String.fromCharCode(charCode);
    }
  }
  return result;
};
