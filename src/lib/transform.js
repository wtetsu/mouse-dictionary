/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import text from "./text";
import data from "./data";

export default word => {
  const list = new UniqList();
  const v = data.verbs.get(word);
  if (v) {
    list.push(v);
  }
  const n = data.nouns.get(word);
  if (n) {
    list.push(n);
  }
  const otherForms = text.tryToReplaceTrailingStrings(word, data.replaceTrailingRules);
  list.merge(otherForms);
  return list.toArray();
};
