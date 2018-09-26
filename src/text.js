/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import consts from "./consts";
import verbs from "./verbs";
import UniqArray from "./uniqarray";

const text = {};

text.createLookupWords = (sourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;
  const strList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];

  const lookupWords = new UniqArray();

  if (mustIncludeOriginalText) {
    lookupWords.push(sourceStr);
  }
  for (let i = 0; i < strList.length; i++) {
    const words = text.splitIntoWords(strList[i]);
    const linkedWords = createLinkedWordList(words, !isAllLower);
    lookupWords.merge(linkedWords);

    // ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
    const convertedWordsList = doOtherConversions(words);
    for (let j = 0; j < convertedWordsList.length; j++) {
      const convertedWords = convertedWordsList[j];
      if (convertedWords) {
        const linkedConvertedWords = createLinkedWordList(convertedWords, !isAllLower);
        lookupWords.merge(linkedConvertedWords);
      }
    }
  }

  if (withCapitalized) {
    lookupWords.merge(lookupWords.toArray().map(s => s.toUpperCase()));
  }

  return lookupWords.toArray();
};

const createLinkedWordList = (arr, ignoreLowerCase) => {
  const linkedWords = text.linkWords(arr);
  const wlist = text.parseString(arr[0], ignoreLowerCase);
  for (let i = 0; i < wlist.length; i++) {
    linkedWords.push(wlist[i]);
  }
  return linkedWords;
};

/**
 * ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
 */
const doOtherConversions = words => {
  let result = [];

  let changed = false;

  for (let i = 0; i < otherConversions.length; i++) {
    const convertedWords = Object.assign([], words);
    for (let j = 0; j < convertedWords.length; j++) {
      const w = doConvert(convertedWords[j], otherConversions[i]);
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

const doConvert = (word, conversionRule) => {
  let result = null;
  const w = conversionRule[word];
  if (w) {
    result = w;
  } else {
    if (word.endsWith("'s") || word.endsWith("s'")) {
      result = conversionRule["'s"];
    }
  }
  return result;
};

const otherConversions = [
  {
    my: "one's",
    your: "one's",
    his: "one's",
    her: "one's",
    its: "one's",
    our: "one's",
    their: "one's",
    "'s": "one's",
    "one's": "one's",
    "someone's": "someone's",
    myself: "oneself",
    yourself: "oneself",
    himself: "oneself",
    herself: "oneself",
    ourselves: "oneself",
    themselves: "oneself"
  },
  {
    my: "someone's",
    your: "someone's",
    his: "someone's",
    her: "someone's",
    its: "someone's",
    our: "someone's",
    their: "someone's",
    "'s": "someone's",
    "one's": "one's",
    "someone's": "someone's",
    myself: "oneself",
    yourself: "oneself",
    himself: "oneself",
    herself: "oneself",
    ourselves: "oneself",
    themselves: "oneself"
  }
];

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
  if (!sourceStr) {
    return [];
  }
  const wordList = new UniqArray();

  const lowerStr = sourceStr.toLowerCase();
  const strList = ignoreLowerCase || lowerStr === sourceStr ? [sourceStr] : [sourceStr, lowerStr];

  for (let i = 0; i < strList.length; i++) {
    const str = strList[i];
    if (i >= 1) {
      wordList.push(str);
    }
    wordList.merge(text.tryToReplaceTrailingStrings(str, trailingRules));

    const arr = text.splitString(str);
    for (let j = 0; j < arr.length; j++) {
      const w = arr[j];
      wordList.push(w);
    }
  }
  return wordList.toArray();
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
