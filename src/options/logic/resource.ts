/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { template } from "../extern";

import { JapaneseTextResource, EnglishTextResource, TextResourceKeys } from "../resource";

let _lang: string = null;

const resources = {
  ja: JapaneseTextResource,
  en: EnglishTextResource,
};

export const setLang = (newLang: string): void => {
  _lang = newLang;
};

export const getLang = (): string => {
  return _lang;
};

export const get = (key: TextResourceKeys, params?: Record<string, any>): string => {
  const resourceText = resources[getLang()]?.[key];
  if (!resourceText) {
    return key;
  }
  return template.render(resourceText, params);
};

export const decideInitialLanguage = (languages: string[]): string => {
  if (!languages) {
    return "en";
  }
  const validLanguages = ["en", "ja"];
  let result = "en";
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i].toLowerCase().split("-")[0];
    if (validLanguages.includes(lang)) {
      result = lang;
      break;
    }
  }
  return result;
};
