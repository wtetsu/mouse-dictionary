let string = {};

string._isStrCapital = function(str) {
  return /^[A-Z]$/.test(str);
};

string._splitString = function(str) {
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
    var isCapital = string._isStrCapital(ch);
    var wordToAdd = null;
    if (ch === "-" || ch === "_") {
      wordToAdd = str.substring(startIndex, i);
      startIndex = i+1;
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

string.parseString = function(str) {
  var result = [];
  if (str) {
    result = result.concat(string.transformWord(str.toLowerCase()));

    var arr = string._splitString(str);
    var i, len;
    for (i = 0, len = arr.length; i < len; i++) {
      result.push(arr[i]);
    }
  }

  return result;
};

string.replaceTrailingCharacters = function(str, searchValue, newValue) {
  let result = null;
  if (str.endsWith(searchValue)) {
    result = str.substring(str, str.length - searchValue.length) + newValue;
  }
  return result;
};

string.transformWord = function(str) {
  let w;
  let words = [];
  if (str != str.toLowerCase()) {
    words.push(str.toLowerCase());
  }
  w = string.replaceTrailingCharacters(str, 'ied', 'y');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'ed', '');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'ed', 'e');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'ies', 'y');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'ier', 'y');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'er', '');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'iest', 'y');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'est', '');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 's', '');
  if (w) words.push(w);

  w = string.replaceTrailingCharacters(str, 'nning', 'n');
  if (w) {
    words.push(w);
  } else {
    w = string.replaceTrailingCharacters(str, 'ing', '');
    if (w) words.push(w);
  }

  return words;
};

module.exports = string;
