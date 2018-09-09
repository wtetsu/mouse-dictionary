const text = {};

const reCapital = /^[A-Z]$/;

text.splitIntoWords = str => {
  const words = [];
  let startIndex = null;
  let i = 0;
  for (;;) {
    const code = str.charCodeAt(i);
    const isEnglishCharacter = code >= 0x21 && code <= 0x7e;
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

text.parseString = str => {
  let result = [];
  if (str) {
    result = result.concat(text.transformWord(str));

    const arr = text._splitString(str);
    let i, len;
    for (i = 0, len = arr.length; i < len; i++) {
      result.push(arr[i]);
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

const _reSigns = /[!"#$%&'’‘()*+-.,/:;<=>?@[\\\]^_`{|}~]/gm;

text.transformWord = str => {
  let words = [];
  if (str !== str.toLowerCase()) words.push(str);

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

  // signs
  let w;
  w = str.replace(_reSigns, "");
  if (w != str) {
    words.push(w);
    const lw = w.toLowerCase();
    if (lw !== w) {
      words.push(w);
    }
  }

  return words;
};

text.linkWords = words => {
  let linkedWords = [];
  let currentString;
  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();
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
