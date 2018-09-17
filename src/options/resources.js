/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import sprintf from "sprintf-js";
import ja from "./resources/ja";

export default (key, ...params) => {
  // Only ja is supported at present
  const templates = ja;

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
