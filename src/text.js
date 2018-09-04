const text = {};

const reCapital = /^[A-Z]$/;

text._isStrCapital = str => {
  return reCapital.test(str);
};

text._splitString = str => {
  var arr = [];
  var startIndex = 0;
  var i = 0;
  var len = str.length;
  var isLastCapital = true;
  for (;;) {
    if (i >= len) {
      break;
    }
    var ch = str[i];
    var isCapital = text._isStrCapital(ch);
    var wordToAdd = null;
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
      var lWordToAdd = wordToAdd.toLowerCase();
      if (lWordToAdd !== wordToAdd) {
        arr.push(lWordToAdd);
      }
    }
    i += 1;
  }
  if (startIndex > 0) {
    var lastWord = str.substring(startIndex);
    arr.push(lastWord);
    var lLastWord = lastWord.toLowerCase();
    if (lLastWord !== lastWord) {
      arr.push(lLastWord);
    }
  }

  return arr;
};

text.parseString = str => {
  var result = [];
  if (str) {
    result = result.concat(text.transformWord(str));

    var arr = text._splitString(str);
    var i, len;
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

const _reSigns = /[!"#$%&'’‘()*+-.,/:;<=>?@[\\\]^_`{|}~]/gm;

text.transformWord = str => {
  let w;
  let words = [];
  if (str !== str.toLowerCase()) words.push(str);

  w = text.replaceTrailingCharacters(str, "ied", "y");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "ed", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "ed", "e");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "ies", "y");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "ier", "y");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "er", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "iest", "y");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "est", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "s", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "es", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "'s", "");
  if (w) words.push(w);

  w = text.replaceTrailingCharacters(str, "nning", "n");
  if (w) {
    words.push(w);
  } else {
    w = text.replaceTrailingCharacters(str, "ing", "");
    if (w) words.push(w);
  }

  // signs
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
