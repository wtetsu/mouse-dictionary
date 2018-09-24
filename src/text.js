/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import consts from "./consts";
import verbs from "./verbs";

const text = {};

text.createLookupWords = (sourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;
  const strList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];

  const result = [];
  if (mustIncludeOriginalText) {
    result.push(sourceStr);
  }
  for (let i = 0; i < strList.length; i++) {
    const words = text.splitIntoWords(strList[i]);
    const linkedWords = createLinkedWordList(words, !isAllLower);
    mergeArray(result, linkedWords);

    const convertedWords = doOtherConversions(words);
    if (convertedWords) {
      const linkedConvertedWords = createLinkedWordList(convertedWords, !isAllLower);
      mergeArray(result, linkedConvertedWords);
    }
  }

  if (withCapitalized) {
    mergeArray(result, result.map(s => s.toUpperCase()));
  }

  return result;
};

const createLinkedWordList = (arr, ignoreLowerCase) => {
  const linkedWords = text.linkWords(arr);
  const wlist = text.parseString(arr[0], ignoreLowerCase);
  for (let i = 0; i < wlist.length; i++) {
    linkedWords.push(wlist[i]);
  }
  return linkedWords;
};

const doOtherConversions = words => {
  let result = null;

  let changed = false;
  const convertedWords = Object.assign([], words);
  for (let i = 0; i < convertedWords.length; i++) {
    const w = doConvert(convertedWords[i]);
    if (w) {
      convertedWords[i] = w;
      changed = true;
    }
  }
  if (changed) {
    result = convertedWords;
  }

  return result;
};

const doConvert = word => {
  let result = null;
  const w = otherConversions[word];
  if (w) {
    result = w;
  } else {
    if (word.endsWith("'s")) {
      result = "one's";
    }
  }
  return result;
};

const otherConversions = {
  my: "one's",
  your: "one's",
  his: "one's",
  her: "one's",
  its: "one's",
  our: "one's",
  their: "one's",
  myself: "oneself",
  yourself: "oneself",
  himself: "oneself",
  herself: "oneself",
  ourselves: "oneself",
  themselves: "oneself"
};

const mergeArray = (destArray, srcArray) => {
  for (let i = 0; i < srcArray.length; i++) {
    const a = srcArray[i];
    if (!destArray.includes(a)) {
      destArray.push(a);
    }
  }
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

const trailingRules = [
  [{ search: "s", new: "" }],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }],
  [{ search: "'s", new: "" }]
];

/**
 * "wordone-wordtwo-wordthree" -> ["wordone", "wordtwo", "wordthree"]
 * "Announcements" -> ["Announcement", "announcements", "announcement]
 */
text.parseString = (sourceStr, ignoreLowerCase) => {
  let result = [];
  if (!sourceStr) {
    return result;
  }

  const lowerStr = sourceStr.toLowerCase();
  const strList = ignoreLowerCase || lowerStr === sourceStr ? [sourceStr] : [sourceStr, lowerStr];

  for (let i = 0; i < strList.length; i++) {
    const str = strList[i];
    if (i >= 1) {
      result.push(str);
    }
    result = result.concat(text.tryToReplaceTrailingStrings(str, trailingRules));
    const arr = text.splitString(str);
    for (let j = 0; j < arr.length; j++) {
      const w = arr[j];
      if (!result.includes(w)) {
        result.push(w);
      }
    }
  }

  return result;
};

text.replaceTrailingCharacters = (str, searchValue, newValue) => {
  let result = null;
  if (str.endsWith(searchValue)) {
    result = str.substring(str, str.length - searchValue.length) + newValue;
  }
  return result;
};

text.tryToReplaceTrailingStrings = (str, trailingRule) => {
  let words = [];

  for (let i = 0; i < trailingRule.length; i++) {
    const tlist = trailingRule[i];

    for (let j = 0; j < tlist.length; j++) {
      const t = tlist[j];
      let w = text.replaceTrailingCharacters(str, t.search, t.new);
      if (w) {
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
text.linkWords = words => {
  let linkedWords = [];
  if (words.length === 0) {
    return linkedWords;
  }

  const firstWord = words[0];
  const firstWordList = [firstWord].concat(verbs(firstWord));

  for (let i = 0; i < firstWordList.length; i++) {
    const wordList = [].concat(words);
    wordList[0] = firstWordList[i];

    let currentString;
    const newLinkedWord = new Array(wordList.length);
    for (let j = 0; j < wordList.length; j++) {
      let word = wordList[j];
      if (j === 0) {
        currentString = word;
      } else {
        currentString += " " + word;
      }
      newLinkedWord[wordList.length - j - 1] = currentString;
    }
    linkedWords.push(...newLinkedWord);
  }

  return linkedWords;
};

export default text;
