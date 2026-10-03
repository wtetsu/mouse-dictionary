/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const replaceTrailingCharacters = (str, searchValue, newValue) => {
  if (!str.endsWith(searchValue)) {
    return null;
  }
  return str.substring(0, str.length - searchValue.length) + newValue;
};

const tryToReplaceTrailingStrings = (str, trailingRule, minLength = 3) => {
  const words = [];

  for (let i = 0; i < trailingRule.length; i++) {
    const tlist = trailingRule[i];
    for (let j = 0; j < tlist.length; j++) {
      const t = tlist[j];
      const w = replaceTrailingCharacters(str, t.search, t.new);
      if (w?.length >= minLength) {
        words.push(w);
        break;
      }
    }
  }
  return words;
};

export default { tryToReplaceTrailingStrings };
