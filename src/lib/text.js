/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import deinja from "deinja";
import consts from "./consts";
import transform from "./transform";
import phrase from "./phrase";
import possessive from "./possessive";
import spelling from "./spelling";

const text = {};

text.createLookupWords = (rawSourceStr, withCapitalized = false, mustIncludeOriginalText = false, isEnglish = true) => {
  let r;
  if (isEnglish) {
    r = createLookupWordsEn(rawSourceStr, withCapitalized, mustIncludeOriginalText);
  } else {
    r = createLookupWordsJa(rawSourceStr, withCapitalized, mustIncludeOriginalText);
  }
  return r;
};

const createLookupWordsEn = (rawSourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const sourceStr = text.dealWithHyphens(rawSourceStr);
  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;
  const strList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];

  const lookupWords = new UniqList();

  if (mustIncludeOriginalText) {
    lookupWords.merge(sourceStr);
  }

  const wordListList = createWordsList(strList);
  for (let i = 0; i < wordListList.length; i++) {
    lookupWords.merge(createLinkedWords(wordListList[i], isAllLower));
  }

  const theFirstWord = wordListList[0] && wordListList[0][0];
  if (theFirstWord) {
    lookupWords.merge(dealWithFirstWordHyphen(theFirstWord));
  }

  if (withCapitalized) {
    lookupWords.merge(lookupWords.toArray().map(s => s.toUpperCase()));
  }
  return lookupWords.toArray().filter(s => s.length >= 2 || s === theFirstWord);
};

const createWordsList = stringList => {
  const wordListList = [];
  for (let i = 0; i < stringList.length; i++) {
    const str = stringList[i];
    const words = text.splitIntoWords(str);
    wordListList.push(words);
    const unifiedSpellingWords = spelling.convert(words);
    if (unifiedSpellingWords) {
      wordListList.push(unifiedSpellingWords);
    }
  }
  return wordListList;
};

const createLinkedWords = (words, isAllLower) => {
  const lookupWords = [];

  const linkedWords = createLinkedWordList(words, !isAllLower, 1);
  lookupWords.push(...linkedWords);

  // ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
  const convertedWordsList = words.length >= 2 ? possessive.normalize(words) : [];
  for (let j = 0; j < convertedWordsList.length; j++) {
    const convertedWords = convertedWordsList[j];
    if (convertedWords) {
      const linkedConvertedWords = createLinkedWordList(convertedWords, !isAllLower, 2);
      lookupWords.push(...linkedConvertedWords);
    }
  }
  return lookupWords;
};

const createLookupWordsJa = sourceStr => {
  const str = sourceStr.substring(0, 40).replace(/[A-Za-z0-9]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xfee0));

  const result = new UniqList();

  for (let i = str.length; i >= 1; i--) {
    const part = str.substring(0, i);
    result.push(part);

    if (i >= 2) {
      const deinedWords = deinja.convert(part);
      result.merge(deinedWords);
    }
  }
  return result.toArray();
};

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
 *  ['cut', 'back'] -> [ 'cut back', 'cut' ]
 *  [ 'ran', 'with' ]  -> [ 'ran with', 'ran', 'run with', 'run' ]
 */
const createLinkedWordList = (arr, ignoreLowerCase, minWordNum = 1) => {
  const linkedWords = text.linkWords(arr, minWordNum);
  if (minWordNum <= 1) {
    const wlist = text.parseFirstWord(arr[0], ignoreLowerCase);
    linkedWords.push(...wlist);
  }
  const newPhrases = [];
  for (let i = 0; i < linkedWords.length; i++) {
    const arr = text.tryToReplaceTrailingStrings(linkedWords[i], trailingRules);
    newPhrases.push(...arr);
  }
  linkedWords.push(...newPhrases);
  return linkedWords;
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
  [{ search: "'s", new: "" }, { search: "s", new: "" }],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }]
];

/**
 * "wordone-wordtwo-wordthree" -> ["wordone", "wordtwo", "wordthree", "-wordthree"]
 * "Announcements" -> ["Announcement", "announcements", "announcement]
 * "third-party" -> ["third party", "third", "party", "-party"]
 */
text.parseFirstWord = (sourceStr, ignoreLowerCase, minLength = 3) => {
  if (!sourceStr) {
    return [];
  }
  const wordList = new UniqList();
  wordList.filer = a => a.length >= minLength;

  const lowerStr = sourceStr.toLowerCase();
  const strList = ignoreLowerCase || lowerStr === sourceStr ? [sourceStr] : [sourceStr, lowerStr];

  for (let i = 0; i < strList.length; i++) {
    const str = strList[i];
    if (i >= 1) {
      wordList.push(str);
    }
    wordList.merge(text.tryToReplaceTrailingStrings(str, trailingRules));

    const arr = text.splitString(str);
    if (arr.length >= 2) {
      wordList.push(arr.join(" "));
    }
    wordList.merge(arr);
    const arrayArray = arr.map(transform);
    for (let i = 0; i < arrayArray.length; i++) {
      wordList.merge(arrayArray[i]);
    }
    if (arr.length >= 2) {
      const last = arr[arr.length - 1];
      const code = sourceStr.charCodeAt(sourceStr.length - last.length - 1);
      if (code === 45 || code === 8209) {
        wordList.push("-" + last);
      }
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
  const firstWordList = [firstWord].concat(transform(firstWord));

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
    const normalizedPhrases = phrase.normalize(appendedList[i]).map(a => a.join(" "));
    linkedWords.push(...normalizedPhrases);
  }

  return linkedWords;
};

const JOINER_LIST = ["-", "", " "];

// "ladies-in-waiting" -> ["ladies-in-waiting", "lady-in-waiting", ...]
const dealWithFirstWordHyphen = theFirstWord => {
  const wordList = theFirstWord.split("-");
  if (wordList.length <= 1) {
    return [];
  }

  const result = new UniqList();
  const splittedFirstWord = wordList[0];

  const phraseWithoutHyphen = wordList.join("");
  result.push(phraseWithoutHyphen);
  result.push(phraseWithoutHyphen.toLowerCase());

  const transformedList = transform(splittedFirstWord);

  for (let i = 0; i < transformedList.length; i++) {
    wordList[0] = transformedList[i];

    for (let j = 0; j < JOINER_LIST.length; j++) {
      const joiner = JOINER_LIST[j];
      const joinedWithHyphen = wordList.join(joiner);
      result.push(joinedWithHyphen);
      result.push(joinedWithHyphen.toLowerCase());
    }
  }
  return result.toArray();
};

text.isEnglishText = str => {
  let result = true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const isEnglishLike = 0x20 <= code && code <= 0x7e;
    if (!isEnglishLike) {
      result = false;
      break;
    }
  }
  return result;
};

text.isHiraKana = str => {
  if (!str) {
    return false;
  }
  let result = true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const isHiragana = code >= 0x3040 && code <= 0x309f;
    const isKatakana = code >= 0x30a0 && code <= 0x30ff;
    if (!isHiragana || !isKatakana) {
      result = false;
      break;
    }
  }
  return result;
};

export default text;
