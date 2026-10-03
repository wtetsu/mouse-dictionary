/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "../../lib/utils";
import entry from "../entry";
import entryGeneratorEn from "./en";
import entryGeneratorJa from "./ja";

// Can add other languages here
const generators = {
  en: entryGeneratorEn,
  ja: entryGeneratorJa,
  default: entryGeneratorEn,
};

const languageDetector = (text: string): string => (isEnglishText(text) ? "en" : "ja");

const isEnglishText = (str: string): boolean => {
  let result = true;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Also allows non-breaking hyphens and zero width non-joiners
    const isEnglishLike = utils.isEnglishLikeCharacter(code) || code === 0x2011 || code === 0x200c;
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
