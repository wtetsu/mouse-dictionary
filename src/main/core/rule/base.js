/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import text from "../../lib/text";

export default (rule, word) => {
  const list = new UniqList();
  const v = rule.verb.get(word);
  if (v) {
    list.push(v);
  }
  const n = rule.noun.get(word);
  if (n) {
    list.push(n);
  }
  const otherForms = text.tryToReplaceTrailingStrings(word, rule.trailing);
  list.merge(otherForms);
  return list.toArray();
};
