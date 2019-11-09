/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import rule from "../rule";
import text from "../../lib/text";

const createLookupWordsEn = (rawSourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const sourceStr = text.dealWithHyphens(rawSourceStr, rule.doLetters);
  const lowerStr = sourceStr.toLowerCase();

  const isAllLower = lowerStr === sourceStr;
  const sourceStringList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];
  sourceStringList.push(...fetchQuotedStrings(sourceStr));

  const lookupWords = new UniqList();

  if (mustIncludeOriginalText) {
    lookupWords.merge(sourceStr);
  }

  const wordListList = createWordsList(sourceStringList);
  for (const wordList of wordListList) {
    lookupWords.merge(createLinkedWords(wordList, isAllLower));
  }

  const firstWord = wordListList[0] && wordListList[0][0];
  if (firstWord) {
    lookupWords.merge(processFirstWord(firstWord));
  }

  if (withCapitalized) {
    lookupWords.merge(lookupWords.toArray().map(s => s.toUpperCase()));
  }
  return lookupWords.toArray().filter(s => s.length >= 2 || s === firstWord);
};

const processFirstWord = firstWord => [...dealWithFirstWordHyphen(firstWord), ...divideIntoTwoWords(firstWord)];

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

const divideIntoTwoWords = str => {
  const result = [];
  for (let i = 2; i <= str.length - 2; i++) {
    const former = str.slice(0, i);
    const latter = str.slice(i);
    result.push(former + " " + latter);
    result.push(former + "-" + latter);
  }
  return result;
};

const createWordsList = stringList => {
  const wordListList = [];
  for (const str of stringList) {
    const words = text.splitIntoWords(str, rule.doLetters);
    wordListList.push(words);
    const unifiedSpellingWords = rule.doSpelling(words);
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
  const convertedWordsList = words.length >= 2 ? rule.doPronoun(words) : [];
  for (const convertedWords of convertedWordsList) {
    if (convertedWords) {
      const linkedConvertedWords = createLinkedWordList(convertedWords, !isAllLower, 2);
      lookupWords.push(...linkedConvertedWords);
    }
  }
  return lookupWords;
};

const TRAILING_RULES = [
  [{ search: "'s", new: "" }, { search: "s", new: "" }],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }]
];

/**
 *  ['cut', 'back'] -> [ 'cut back', 'cut' ]
 *  [ 'ran', 'with' ]  -> [ 'ran with', 'ran', 'run with', 'run' ]
 */
const createLinkedWordList = (arr, ignoreLowerCase, minWordNum = 1) => {
  const linkedWords = text.linkWords(arr, minWordNum);
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
  wordList.filer = a => a.length >= minLength;

  const lowerStr = sourceStr.toLowerCase();
  const strList = ignoreLowerCase || lowerStr === sourceStr ? [sourceStr] : [sourceStr, lowerStr];

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

const fetchQuotedStrings = str => {
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

export default createLookupWordsEn;
