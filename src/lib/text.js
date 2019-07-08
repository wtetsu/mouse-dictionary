/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import consts from "./consts";
import rule from "../main/rule";

const text = {};

const RE_NON_BREAKING_HYPHEN = /‑/g;

// aaa-bbb -> aaa-bbb
// aaa-\nbbb -> aaabbb
// aaa-%&*bbb -> aaabbb
text.dealWithHyphens = sourceStr => {
  const str = sourceStr.replace(RE_NON_BREAKING_HYPHEN, "-");
  let result = "";
  let currentIndex = 0;

  for (;;) {
    if (currentIndex >= str.length) {
      result += str.substring(currentIndex);
      break;
    }
    const hyphenIndex = str.indexOf("-", currentIndex);
    if (hyphenIndex === -1 || hyphenIndex === str.length - 1) {
      result += str.substring(currentIndex);
      break;
    }

    let found = false;
    result += str.substring(currentIndex, hyphenIndex);
    for (let i = hyphenIndex + 1; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (consts.targetCharacters[code]) {
        if (i === hyphenIndex + 1) {
          // right after the hyphen
          result += "-";
        }
        currentIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      currentIndex = str.length;
    }
  }
  return result;
};

/**
 * "American English" -> ["American", "English"]
 * "American.English" -> ["American", "English"]
 * "American,English" -> ["American", "English"]
 * "American-English" -> ["American-English"]
 * "American_English" -> ["American_English"]
 */
text.splitIntoWords = str => {
  const words = [];
  let startIndex = null;
  let i = 0;
  for (;;) {
    const code = str.charCodeAt(i);
    const isEnglishCharacter = consts.targetCharacters[code];
    if (isEnglishCharacter) {
      if (startIndex === null) {
        startIndex = i;
      }
    } else {
      if (startIndex !== null) {
        const newWord = str.substring(startIndex, i);
        words.push(newWord);
        startIndex = null;
      }
    }
    i += 1;

    if (i >= str.length) {
      if (startIndex !== null) {
        const newWord = str.substring(startIndex);
        words.push(newWord);
      }
      break;
    }
  }
  return words;
};

/**
 * "camelCase" -> ["camel", "case"]
 */
text.splitString = str => {
  const arr = [];
  let startIndex = 0;
  let i = 0;
  let isLastCapital = true;
  for (;;) {
    if (i >= str.length) {
      break;
    }
    const chCode = str.charCodeAt(i);
    const isCapital = chCode >= 65 && chCode <= 90;
    let wordToAdd = null;
    // #, -, ., _
    if (chCode === 35 || chCode === 45 || chCode === 46 || chCode === 95) {
      wordToAdd = str.substring(startIndex, i);
      startIndex = i + 1;
    } else if (isCapital && !isLastCapital) {
      wordToAdd = str.substring(startIndex, i);
      startIndex = i;
    } else {
      isLastCapital = isCapital;
    }
    if (wordToAdd) {
      arr.push(wordToAdd);
      const lWordToAdd = wordToAdd.toLowerCase();
      if (lWordToAdd !== wordToAdd) {
        arr.push(lWordToAdd);
      }
    }
    i += 1;
  }
  if (startIndex > 0) {
    const lastWord = str.substring(startIndex);
    arr.push(lastWord);
    const lLastWord = lastWord.toLowerCase();
    if (lLastWord !== lastWord) {
      arr.push(lLastWord);
    }
  }
  return arr;
};

text.replaceTrailingCharacters = (str, searchValue, newValue) => {
  let result = null;
  if (str.endsWith(searchValue)) {
    result = str.substring(str, str.length - searchValue.length) + newValue;
  }
  return result;
};

text.tryToReplaceTrailingStrings = (str, trailingRule, minLength = 3) => {
  let words = [];

  for (let i = 0; i < trailingRule.length; i++) {
    const tlist = trailingRule[i];
    for (let j = 0; j < tlist.length; j++) {
      const t = tlist[j];
      let w = text.replaceTrailingCharacters(str, t.search, t.new);
      if (w && w.length >= minLength) {
        words.push(w);
        break;
      }
    }
  }
  return words;
};

/**
 * ["American", "English"
 * -> ["American English", "American", "american english", "american"]);
 *
 * ["dealt", "with"]
 * -> ["dealt with", "dealt", "deal with", "deal"]
 *
 * ["running", "away"]
 * -> ["running away", "running", "run away", "run"]
 */
text.linkWords = (words, minWordNum = 1) => {
  let linkedWords = [];
  if (words.length === 0) {
    return linkedWords;
  }

  const firstWord = words[0];
  const firstWordList = [firstWord].concat(rule.doBase(firstWord));

  const appendedList = [];
  for (let i = 0; i < firstWordList.length; i++) {
    const wordList = [].concat(words);
    wordList[0] = firstWordList[i];

    const currentWords = [];
    const newLinkedWord = [];
    for (let j = 0; j < wordList.length; j++) {
      let word = wordList[j];
      currentWords.push(word);
      if (j >= minWordNum - 1) {
        newLinkedWord.push(currentWords.join(" "));
        appendedList.push([].concat(currentWords));
      }
    }
    linkedWords.push(...newLinkedWord.reverse());
  }

  // Add string like ""word0 ~ word2
  for (let i = 0; i < appendedList.length; i++) {
    const normalizedPhrases = rule.doPhrase(appendedList[i]).map(a => a.join(" "));
    linkedWords.push(...normalizedPhrases);
  }

  return linkedWords;
};

export default text;
