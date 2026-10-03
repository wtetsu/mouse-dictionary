/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { template, utils } from "../extern";
import type { TextResource, TextResourceKeys } from "../resource";
import { EnglishTextResource, JapaneseTextResource } from "../resource";

let _lang = "";

const resources: Record<string, TextResource | undefined> = {
  ja: JapaneseTextResource,
  en: EnglishTextResource,
};

export const setLang = (newLang: string): void => {
  _lang = newLang;
};

export const getLang = (): string => {
  if (_lang === "") {
    throw new Error("Language is not set");
  }
  return _lang;
};

export const get = (key: TextResourceKeys, params?: Record<string, any>): string => {
  const resourceText = resources[getLang()]?.[key];
  if (!resourceText) {
    return key;
  }
  return template.render(resourceText, params);
};

export const decideInitialLanguage = (languages: readonly string[]): string =>
  utils.pickLanguage(languages, Object.keys(resources));
