/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan, { Template } from "hogan.js";
import ja from "../resource/ja";
import en from "../resource/en";

let _lang: string = null;

const compile = (res: Record<string, string>): Record<string, Template> => {
  const result: Record<string, Template> = {};
  for (const key of Object.keys(res)) {
    result[key] = Hogan.compile(res[key]);
  }
  return result;
};

const compiledTemplates = {
  ja: compile(ja),
  en: compile(en),
};

export const setLang = (newLang: string): void => {
  _lang = newLang;
};

const getLang = () => {
  if (_lang === "ja" || _lang === "en") {
    return _lang;
  }
  return "en";
};

export const get = (key: string, params?: Record<string, any>): string => {
  const templates = compiledTemplates[getLang()];
  const template = templates[key];
  if (!template) {
    return key;
  }
  return template.render(params);
};
