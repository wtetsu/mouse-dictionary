/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import entryGeneratorJa from "./entry/ja";
import entryGeneratorEn from "./entry/en";

const generators = {
  en: entryGeneratorEn,
  ja: entryGeneratorJa,
  default: entryGeneratorEn,
};

let languageDetector = (text) => (isEnglishText(text) ? "en" : "ja");

const build = (text, withCapitalized, mustIncludeOriginalText) => {
  const lang = languageDetector(text);
  const generator = generators[lang] ?? generators.default;
  const entries = generator(text, withCapitalized, mustIncludeOriginalText);
  return { entries, lang };
};

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

const registerGenerator = (lang, generator) => {
  generators[lang] = generator;
};

const registerLanguageDetector = (detector) => {
  languageDetector = detector;
};

export default { build, registerGenerator, registerLanguageDetector };
