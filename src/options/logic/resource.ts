/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import sprintf from "sprintf-js";
import ja from "../resource/ja";
import en from "../resource/en";

let _lang: string = null;

export const setLang = (newLang: string): void => {
  _lang = newLang;
};

export const get = (key: string, ...params: any[]): string => {
  let templates: Record<string, string>;
  switch (_lang) {
    case "ja":
      templates = ja;
      break;
    case "en":
      templates = en;
      break;
    default:
      templates = en;
      break;
  }

  let r: string;
  const tmpl = templates[key];
  if (tmpl) {
    const sprintfParams = [tmpl].concat(params);
    r = sprintf.sprintf(...sprintfParams);
  } else {
    r = key;
  }
  return r;
};
