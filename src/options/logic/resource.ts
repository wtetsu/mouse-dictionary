/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan, { Template } from "hogan.js";
import { JapaneseTextResource, EnglishTextResource } from "../resource";

let _lang: string = null;

const compile = (res: Record<string, string>): Record<string, Template> => {
  const result: Record<string, Template> = {};
  for (const key of Object.keys(res)) {
    result[key] = Hogan.compile(res[key]);
  }
  return result;
};

const compiledTemplates = {
  ja: compile(JapaneseTextResource),
  en: compile(EnglishTextResource),
};

export const setLang = (newLang: string): void => {
  _lang = newLang;
};

export const getLang = (): string => {
  return _lang;
};

export const get = (key: string, params?: Record<string, any>): string => {
  const templates = compiledTemplates[getLang()];
  const template = templates?.[key];
  if (!template) {
    return key;
  }
  return template.render(params);
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
