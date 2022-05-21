/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import entry from "../entry";
import entryGeneratorJa from "./ja";
import entryGeneratorEn from "./en";

// Can add other languages here
const generators = {
  en: entryGeneratorEn,
  ja: entryGeneratorJa,
  default: entryGeneratorEn,
};

let languageDetector = (text) => (isEnglishText(text) ? "en" : "ja");

const isEnglishText = (str) => {
  let result = true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const isEnglishLike = (0x20 <= code && code <= 0x7e) || code === 0x2011 || code === 0x200c;
    if (!isEnglishLike) {
      result = false;
      break;
    }
  }
  return result;
};

const build = () => {
  return entry.build(languageDetector, generators);
};

export default build;
