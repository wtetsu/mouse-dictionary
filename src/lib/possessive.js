/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

/**
 * ["on", "my", "own"] -> [["on", "one's", "own"], ["on", "someone's", "own"]]
 */
const normalize = words => {
  let result = [];

  let changed = false;

  for (let i = 0; i < PRONOUN_CONVERSIONS.length; i++) {
    const convertedWords = Object.assign([], words);
    for (let j = 0; j < convertedWords.length; j++) {
      const w = doConvert(convertedWords[j], PRONOUN_CONVERSIONS[i]);
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
  if (typeof w === "string") {
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
const PRONOUN_CONVERSIONS = [
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

export default { normalize };
