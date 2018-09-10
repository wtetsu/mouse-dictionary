import consts from "./consts";

const text = {};

text.createLookupWords = sourceStr => {
  const lowerStr = sourceStr.toLowerCase();
  const isAllLower = lowerStr === sourceStr;
  const strList = isAllLower ? [sourceStr] : [sourceStr, lowerStr];

  const result = [];
  for (let i = 0; i < strList.length; i++) {
    const str = strList[i];

    const arr = text.splitIntoWords(str);
    const linkedWords = text.linkWords(arr);
    const wlist = text.parseString(arr[0], !isAllLower);
    for (let i = 0; i < wlist.length; i++) {
      linkedWords.push(wlist[i]);
    }

    mergeArray(result, linkedWords);
  }
  return result;
};

const mergeArray = (destArray, srcArray) => {
  for (let i = 0; i < srcArray.length; i++) {
    const a = srcArray[i];
    if (!destArray.includes(a)) {
      destArray.push(a);
    }
  }
};

const reCapital = /^[A-Z]$/;

const reIgnores = /(\r\n|\n|\r|,|\.)/gm;

text.splitIntoWords = rawstr => {
  const words = [];
  let startIndex = null;
  let i = 0;
  const str = rawstr.replace(reIgnores, " ");
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

text._isStrCapital = str => {
  return reCapital.test(str);
};

text._splitString = str => {
  const arr = [];
  let startIndex = 0;
  let i = 0;
  let isLastCapital = true;
  for (;;) {
    if (i >= str.length) {
      break;
    }
    const ch = str[i];
    const isCapital = text._isStrCapital(ch);
    let wordToAdd = null;
    if (ch === "-" || ch === "_" || ch === "#" || ch === ".") {
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
    result = result.concat(text.transformWord(str));
    const arr = text._splitString(str);
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

const _trailingRule = [
  [{ search: "ied", new: "y" }],
  [{ search: "ed", new: "" }],
  [{ search: "ed", new: "e" }],
  [{ search: "ies", new: "y" }],
  [{ search: "ier", new: "y" }],
  [{ search: "er", new: "" }],
  [{ search: "iest", new: "y" }],
  [{ search: "est", new: "" }],
  [{ search: "s", new: "" }],
  [{ search: "es", new: "" }],
  [{ search: "'s", new: "" }],
  [{ search: "nning", new: "n" }, { search: "ing", new: "" }]
];

text.transformWord = str => {
  let words = [];

  for (let i = 0; i < _trailingRule.length; i++) {
    const tlist = _trailingRule[i];

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
 * -> ["American English", "American", "american engish", "american"]);
 */
text.linkWords = words => {
  let linkedWords = [];
  let currentString;

  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    if (i === 0) {
      currentString = word;
    } else {
      currentString += " " + word;
    }
    linkedWords.unshift(currentString);
  }
  return linkedWords;
};

export default text;
