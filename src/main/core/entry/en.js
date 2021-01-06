/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import rule from "../rule";
import text from "../../lib/text";

const RE_UNNECESSARY_CHARACTERS = new RegExp(String.fromCharCode(0x200c), "g");
const RE_SLASH = new RegExp("/", "g");

const createLookupWordsEn = (rawSourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const replacedSourceStr = rawSourceStr.replace(RE_UNNECESSARY_CHARACTERS, "").replace(RE_SLASH, " / ");
  const sourceStr = text.dealWithHyphens(replacedSourceStr, rule.doLetters);

  const { firstWords, linkedWords } = processSourceString(sourceStr);

  const lookupWords = new UniqList();
  if (mustIncludeOriginalText) {
    lookupWords.push(rawSourceStr);
  }
  lookupWords.filer = (s) => s.length >= 2 || s === firstWord;
  lookupWords.merge(linkedWords);

  const firstWord = firstWords?.[0];
  if (firstWord) {
    lookupWords.merge(processFirstWord(firstWord));
  }

  const slashWords = createSlashWord(firstWords);
  if (slashWords) {
    lookupWords.merge(slashWords);
  }
  if (withCapitalized) {
    lookupWords.merge(lookupWords.toArray().map((s) => s.toUpperCase()));
  }

  const titledExpressions = generateTitledExpressions(firstWords);
  lookupWords.merge(titledExpressions);

  return lookupWords.toArray();
};

// ["united", "kingdom"] -> ["United", "United Kingdom"]
const generateTitledExpressions = (words) => {
  if (!(words?.length >= 1)) {
    return [];
  }
  const result = [];

  let str = toTitle(words[0]);
  if (str.length >= 2) {
    result.push(str);
  }

  for (let i = 1; ; i++) {
    if (i >= words.length || i >= 6) {
      break;
    }
    const w = words[i];
    str += " " + toTitle(w);
    result.push(str);
  }

  return result;
};

const processSourceString = (sourceStr) => {
  const linkedWords = [];

  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;

  let firstWords;
  if (isAllLower) {
    const words1 = createWordsList(sourceStr);
    for (let i = 0; i < words1.length; i++) {
      linkedWords.push(...createLinkedWords(words1[i], true));
    }
    firstWords = words1[0];
  } else {
    const words1 = createWordsList(sourceStr);
    for (let i = 0; i < words1.length; i++) {
      linkedWords.push(...createLinkedWords(words1[i], false));
    }
    const words2 = createWordsList(lowerStr);
    for (let i = 0; i < words2.length; i++) {
      linkedWords.push(...createLinkedWords(words2[i], true));
    }
    firstWords = words2[0];
  }

  const quotedStrings = fetchQuotedStrings(sourceStr);
  for (let i = 0; i < quotedStrings.length; i++) {
    const word3 = createWordsList(quotedStrings[i]);
    for (let j = 0; j < word3.length; j++) {
      linkedWords.push(...createLinkedWords(word3[j], true));
    }
  }
  return { firstWords, linkedWords };
};
const processFirstWord = (firstWord) => [...dealWithFirstWordHyphen(firstWord), ...divideIntoTwoWords(firstWord)];

const createSlashWord = (wordList) => {
  if (!wordList) {
    return null;
  }
  if (wordList[1] === "/" && wordList.length >= 3) {
    const slashWord = wordList[0] + "/" + wordList[2];
    return [slashWord, slashWord.toLowerCase()];
  }
  return null;
};

const JOINER_LIST = ["-", "", " "];

// "ladies-in-waiting" -> ["ladies-in-waiting", "lady-in-waiting", ...]
const dealWithFirstWordHyphen = (theFirstWord) => {
  const wordList = theFirstWord.split("-");
  if (wordList.length <= 1) {
    return [];
  }

  const result = new UniqList();
  const splittedFirstWord = wordList[0];

  const phraseWithoutHyphen = wordList.join("");
  result.push(phraseWithoutHyphen);
  result.push(phraseWithoutHyphen.toLowerCase());

  const baseWords = rule.doBase(splittedFirstWord);

  for (const baseWord of baseWords) {
    wordList[0] = baseWord;
    for (const joiner of JOINER_LIST) {
      const joinedWithHyphen = wordList.join(joiner);
      result.push(joinedWithHyphen);
      result.push(joinedWithHyphen.toLowerCase());
    }
  }
  return result.toArray();
};

const divideIntoTwoWords = (str) => {
  const result = [];
  for (let i = 2; i <= str.length - 2; i++) {
    const former = str.slice(0, i);
    const latter = str.slice(i);
    result.push(former + " " + latter);
    result.push(former + "-" + latter);
  }
  return result;
};

const isValidCharacter = (ch) => rule.doLetters(ch);

const createWordsList = (str) => {
  if (!str) {
    return [];
  }
  const wordsList = [];

  const breakIndex = findBreak(str);
  if (breakIndex >= 2) {
    wordsList.push(text.splitIntoWords(str.substring(0, breakIndex), isValidCharacter));
  }

  const words = text.splitIntoWords(str, isValidCharacter);
  wordsList.push(words);
  const unifiedSpellingWords = rule.doSpelling(words);
  if (unifiedSpellingWords) {
    wordsList.push(unifiedSpellingWords);
  }
  return wordsList;
};

const findBreak = (str) => {
  let r = -1;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 44 || code === 46) {
      r = i;
      break;
    }
  }
  return r;
};

const createLinkedWords = (words, isAllLower) => {
  const lookupWords = [];

  const linkedWords = createLinkedWordList(words, isAllLower, 1);
  lookupWords.push(...linkedWords);

  // ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
  const convertedWordsList = words.length >= 2 ? rule.doPronoun(words) : [];
  for (const convertedWords of convertedWordsList) {
    if (convertedWords) {
      const linkedConvertedWords = createLinkedWordList(convertedWords, isAllLower, 2);
      lookupWords.push(...linkedConvertedWords);
    }
  }

  if (words.length >= 2) {
    // "self taught" -> "selftaught"
    lookupWords.push(words[0] + words[1]);
  }
  return lookupWords;
};

const TRAILING_RULES = [
  [
    { search: "'s", new: "" },
    { search: "s", new: "" },
  ],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }],
];

/**
 *  ['cut', 'back'] -> [ 'cut back', 'cut' ]
 *  [ 'ran', 'with' ]  -> [ 'ran with', 'ran', 'run with', 'run' ]
 */
const createLinkedWordList = (arr, allLowercase, minWordNum = 1) => {
  const enablePhrasing = allLowercase;
  const ignoreLowerCase = allLowercase;

  const linkedWords = text.linkWords(arr, minWordNum, enablePhrasing);
  if (minWordNum <= 1) {
    const wlist = parseFirstWord(arr[0], ignoreLowerCase);
    linkedWords.push(...wlist);
  }
  const newPhrases = [];
  for (let i = 0; i < linkedWords.length; i++) {
    const arr = text.tryToReplaceTrailingStrings(linkedWords[i], TRAILING_RULES);
    newPhrases.push(...arr);
  }
  linkedWords.push(...newPhrases);
  return linkedWords;
};

/**
 * "wordone-wordtwo-wordthree" -> ["wordone", "wordtwo", "wordthree", "-wordthree"]
 * "Announcements" -> ["Announcement", "announcements", "announcement]
 * "third-party" -> ["third party", "third", "party", "-party"]
 */
const parseFirstWord = (sourceStr, ignoreLowerCase, minLength = 3) => {
  if (!sourceStr) {
    return [];
  }
  const wordList = new UniqList();
  wordList.filer = (a) => a.length >= minLength;

  let strList;
  if (ignoreLowerCase) {
    strList = [sourceStr];
  } else {
    const lowerStr = sourceStr.toLowerCase();
    strList = lowerStr === sourceStr ? [sourceStr] : [sourceStr, lowerStr];
  }

  for (let i = 0; i < strList.length; i++) {
    const str = strList[i];
    if (i >= 1) {
      wordList.push(str);
    }
    wordList.merge(text.tryToReplaceTrailingStrings(str, TRAILING_RULES));

    const arr = text.splitString(str);
    if (arr.length >= 2) {
      wordList.push(arr.join(" "));
    }
    wordList.merge(arr);
    const arrayArray = arr.map(rule.doBase);
    for (let j = 0; j < arrayArray.length; j++) {
      wordList.merge(arrayArray[j]);
    }

    if (arr.length >= 2) {
      // Add a prefix
      const first = arr[0];
      if (isHyphenLikeCharacter(sourceStr, first.length)) {
        wordList.push(first + "-");
      }
      // Add a postfix
      const last = arr[arr.length - 1];
      if (isHyphenLikeCharacter(sourceStr, sourceStr.length - last.length - 1)) {
        wordList.push("-" + last);
      }
    }
  }
  return wordList.toArray();
};

const isHyphenLikeCharacter = (sourceStr, position) => {
  const code = sourceStr.charCodeAt(position);
  // Note: This kind of naive comparison is fast enough(Much faster than using Set)
  return code === 45 || code === 8209;
};

const QUOTE_CHARS = ['"', "'"];

const fetchQuotedStrings = (str) => {
  const result = [];
  for (const q of QUOTE_CHARS) {
    const nextQuoteIndex = str.indexOf(q, 1);
    if (nextQuoteIndex >= 3) {
      const startIndex = str.startsWith(q) ? 1 : 0;
      const quotedString = str.substring(startIndex, nextQuoteIndex);
      result.push(quotedString);

      const loweredQuotedString = quotedString.toLowerCase();
      if (loweredQuotedString !== quotedString) {
        result.push(loweredQuotedString);
      }
    }
  }
  return result;
};

const toTitle = (str) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
};
export default createLookupWordsEn;
