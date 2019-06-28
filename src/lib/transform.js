/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import UniqList from "uniqlist";
import text from "./text";
import utils from "./utils";

export default word => {
  const list = new UniqList();
  const v = verbs.get(word);
  if (v) {
    list.push(v);
  }
  const n = nouns.get(word);
  if (n) {
    list.push(n);
  }
  const otherForms = text.tryToReplaceTrailingStrings(word, replaceTrailingRules);
  list.merge(otherForms);
  return list.toArray();
};

const replaceTrailingRules = [];

// Lazy load
const verbs = new Map();
const nouns = new Map();

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
utils.loadJson("data/verbs.json").then(data => utils.updateMap(verbs, data));
utils.loadJson("data/nouns.json").then(data => utils.updateMap(nouns, data));
utils.loadJson("data/trailing.json").then(data => Object.assign(replaceTrailingRules, data));
