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
    const newWordsList = normalizeByRule(words, ruleData);
    result.push(...newWordsList);
  }
  return result;
};

// ["provide", "him", "with", "money"], [0, 1, 0, 1]
//   -> [["provide", "A", "with", "B"]]
//
// ["pick", "her", "up"], [0, -1, 0]
//   -> [["pick", "up]]
const normalizeByRule = (words, ruleData) => {
  const processedWords = [];
  let wordIndex = 0;
  const replaceIndices = [];
  for (let i = 0; i < ruleData.length; i++) {
    if (wordIndex >= words.length) {
      break;
    }
    const code = ruleData[i];
    if (code === 0) {
      processedWords.push(words[wordIndex]);
      wordIndex += 1;
    } else if (code === 102) {
      processedWords.push("a");
      wordIndex += 1;
    } else if (code === 103) {
      processedWords.push("a");
    } else if (code === 104 && words[wordIndex] === "/") {
      processedWords.push("and");
      wordIndex += 1;
    } else if (code === 105 && words[wordIndex] === "/") {
      processedWords.push("or");
      wordIndex += 1;
    } else if (code > 0) {
      replaceIndices.push(processedWords.length);
      processedWords.push(null);
      wordIndex += code;
    } else {
      wordIndex += -code;
    }
  }
  if (replaceIndices.length === 0) {
    return [processedWords];
  }

  return r(processedWords, replaceIndices);
};

const r = (processedWords, replaceIndices) => {
  if (replaceIndices.length === 1) {
    const processedWords2 = [...processedWords];

    processedWords[replaceIndices[0]] = "~";
    processedWords2[replaceIndices[0]] = "__";
    return [processedWords, processedWords2];
  }

  for (let i = 0; i < replaceIndices.length; i++) {
    const index = replaceIndices[i];
    const charCode = 65 + i;
    processedWords[index] = String.fromCharCode(charCode);
  }
  return [processedWords];
};
