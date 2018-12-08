/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import consts from "./consts";
import transform from "./transform";
import phrase from "./phrase";
import UniqArray from "./uniqarray";

const text = {};

text.createLookupWords = (rawSourceStr, withCapitalized = false, mustIncludeOriginalText = false) => {
  const sourceStr = text.dealWithHyphens(rawSourceStr);
  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;
  const strList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];

  const lookupWords = new UniqArray();

  if (mustIncludeOriginalText) {
    lookupWords.push(sourceStr);
  }
  let theFirstWord = null;
  for (let i = 0; i < strList.length; i++) {
    const words = text.splitIntoWords(strList[i]);

    if (i === 0) {
      theFirstWord = words[0];
    }

    const linkedWords = createLinkedWordList(words, !isAllLower, 1);
    lookupWords.merge(linkedWords);

    // ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
    const convertedWordsList = words.length >= 2 ? doPronounConversions(words) : [];
    for (let j = 0; j < convertedWordsList.length; j++) {
      const convertedWords = convertedWordsList[j];
      if (convertedWords) {
        const linkedConvertedWords = createLinkedWordList(convertedWords, !isAllLower, 2);
        lookupWords.merge(linkedConvertedWords);
      }
    }
  }

  if (theFirstWord) {
    lookupWords.merge(dealWithFirstWordHyphen(theFirstWord));
  }

  if (withCapitalized) {
    lookupWords.merge(lookupWords.toArray().map(s => s.toUpperCase()));
  }
  return lookupWords.toArray().filter(s => s.length >= 2 || s === theFirstWord);
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
 * ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
 */
const doPronounConversions = words => {
  let result = [];

  let changed = false;

  for (let i = 0; i < pronounConversions.length; i++) {
    const convertedWords = Object.assign([], words);
    for (let j = 0; j < convertedWords.length; j++) {
      const w = doConvert(convertedWords[j], pronounConversions[i]);
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
    const firstCode = word.charCodeAt(0);
    if (firstCode >= 65 && firstCode <= 90 && (word.endsWith("'s") || word.endsWith("s'"))) {
      result = conversionRule["'s"];
    }
  }
  return result;
};

const ONES = "one's";
const SOMEONE = "someone";
const SOMEONES = "someone's";
const ONESELF = "oneself";
const pronounConversions = [
  {
    my: ONES,
    your: ONES,
    his: ONES,
    her: ONES,
    its: ONES,
    our: ONES,
    their: ONES,
    "'s": ONES,
    "one's": ONES,
    "someone's": SOMEONES,
    myself: ONESELF,
    yourself: ONESELF,
    himself: ONESELF,
    herself: ONESELF,
    ourselves: ONESELF,
    themselves: ONESELF,
    him: SOMEONE,
    them: SOMEONE,
    us: SOMEONE
  },
  {
    my: SOMEONES,
    your: SOMEONES,
    his: SOMEONES,
    her: SOMEONES,
    its: SOMEONES,
    our: SOMEONES,
    their: SOMEONES,
    "'s": SOMEONES,
    "one's": ONES,
    "someone's": SOMEONES,
    myself: ONESELF,
    yourself: ONESELF,
    himself: ONESELF,
    herself: ONESELF,
    ourselves: ONESELF,
    themselves: ONESELF,
    him: SOMEONE,
    them: SOMEONE,
    us: SOMEONE
  },
  {
    my: SOMEONES,
    your: SOMEONES,
    his: SOMEONES,
    her: SOMEONE,
    its: SOMEONES,
    our: SOMEONES,
    their: SOMEONES,
    "'s": SOMEONES,
    "one's": ONES,
    "someone's": SOMEONES,
    myself: ONESELF,
    yourself: ONESELF,
    himself: ONESELF,
    herself: ONESELF,
    ourselves: ONESELF,
    themselves: ONESELF,
    him: SOMEONE,
    them: SOMEONE,
    us: SOMEONE
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
  [{ search: "'s", new: "" }, { search: "s", new: "" }],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }]
];

/**
 * "wordone-wordtwo-wordthree" -> ["wordone", "wordtwo", "wordthree"]
 * "Announcements" -> ["Announcement", "announcements", "announcement]
 * "third-party" -> ["third party", "third", "party"]
 */
text.parseFirstWord = (sourceStr, ignoreLowerCase, minLength = 3) => {
  if (!sourceStr) {
    return [];
  }
  const wordList = new UniqArray();
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

// "ladies-in-waiting" -> ["ladies-in-waiting", "lady-in-waiting", ...]
const dealWithFirstWordHyphen = theFirstWord => {
  const wordList = theFirstWord.split("-");
  if (wordList.length <= 1) {
    return [];
  }

  const result = new UniqArray();
  const splittedFirstWord = wordList[0];

  const phraseWithoutHyphen = wordList.join("");
  result.push(phraseWithoutHyphen);
  result.push(phraseWithoutHyphen.toLowerCase());

  const transformedList = transform(splittedFirstWord);

  for (let i = 0; i < transformedList.length; i++) {
    wordList[0] = transformedList[i];
    const joinedWithHyphen = wordList.join("-");
    result.push(joinedWithHyphen);
    result.push(joinedWithHyphen.toLowerCase());

    const joined = wordList.join("");
    result.push(joined);
    result.push(joined.toLowerCase());
  }

  return result.toArray();
};

export default text;
