/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Rule codes for each phrase, grouped by the number of words
export type PhraseRule = number[][][];

export default (allRules: PhraseRule, words: string[]): string[][] => {
  const ruleDataList = allRules[words.length];
  if (!ruleDataList) {
    return [];
  }
  const result: string[][] = [];
  for (let i = 0; i < ruleDataList.length; i++) {
    const ruleData = ruleDataList[i];
    const newWordsList = normalizeByRule(words, ruleData);
    result.push(...newWordsList);
  }
  return result;
};

const VOWELS: ReadonlySet<string | undefined> = new Set(["a", "e", "i", "o", "u", "A", "E", "I", "O", "U"]);

// ["provide", "him", "with", "money"], [0, 1, 0, 1]
//   -> [["provide", "A", "with", "B"]]
//
// ["pick", "her", "up"], [0, -1, 0]
//   -> [["pick", "up]]
const normalizeByRule = (words: string[], ruleData: number[]): string[][] => {
  const processedWords: string[] = [];
  let wordIndex = 0;
  const replaceIndices: number[] = [];
  let lastIsA = false;
  for (let i = 0; i < ruleData.length; i++) {
    if (wordIndex >= words.length) {
      break;
    }
    const ruleCode = ruleData[i];
    const { newWord, indexPlus } = processRuleCode(ruleCode, words[wordIndex]);

    wordIndex += indexPlus;
    if (ruleCode > 0 && ruleCode < 100) {
      replaceIndices.push(processedWords.length);
    }
    if (newWord !== undefined) {
      if (lastIsA && VOWELS.has(newWord?.[0])) {
        processedWords[processedWords.length - 1] = "an";
      }
      processedWords.push(newWord as string);
      lastIsA = newWord === "a";
    }
  }
  if (replaceIndices.length === 0) {
    return [processedWords];
  }

  return completePhraseProcess(processedWords, replaceIndices);
};

// newWord: null means a placeholder that will be replaced later, undefined means no word
const processRuleCode = (ruleCode: number, word: string): { newWord?: string | null; indexPlus: number } => {
  if (ruleCode === 0) {
    return { newWord: word, indexPlus: 1 };
  }
  if (ruleCode === 102) {
    return { newWord: "a", indexPlus: 1 };
  }
  if (ruleCode === 103) {
    return { newWord: "a", indexPlus: 0 };
  }
  if (ruleCode === 104 && word === "/") {
    return { newWord: "and", indexPlus: 1 };
  }
  if (ruleCode === 105 && word === "/") {
    return { newWord: "or", indexPlus: 1 };
  }
  if (ruleCode > 0 && ruleCode < 100) {
    return { newWord: null, indexPlus: ruleCode };
  }
  if (ruleCode < 0) {
    return { indexPlus: -ruleCode };
  }
  return { indexPlus: 0 };
};

const completePhraseProcess = (processedWords: string[], replaceIndices: number[]): string[][] => {
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
