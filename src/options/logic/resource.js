/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import sprintf from "sprintf-js";
import ja from "../resource/ja";
import en from "../resource/en";

let _lang = null;

const setLang = (newLang) => {
  _lang = newLang;
};

const get = (key, ...params) => {
  let templates;
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

  let r;
  const tmpl = templates[key];
  if (tmpl) {
    const sprintfParams = [tmpl].concat(params);
    r = sprintf.sprintf(...sprintfParams);
  } else {
    r = key;
  }
  return r;
};

export default { setLang, get };
