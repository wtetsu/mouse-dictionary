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

const replaceTrailingRules = [
  [
    { search: "nned", new: "n" },
    { search: "tted", new: "t" },
    { search: "dded", new: "d" },
    { search: "gged", new: "g" },
    { search: "pped", new: "p" },
    { search: "mmed", new: "m" },
    { search: "bbed", new: "b" },
    { search: "rred", new: "r" },
    { search: "zzed", new: "z" },
    { search: "ied", new: "y" }
  ],
  [
    { search: "nning", new: "n" },
    { search: "tting", new: "t" },
    { search: "dding", new: "d" },
    { search: "gging", new: "g" },
    { search: "pping", new: "p" },
    { search: "mming", new: "m" },
    { search: "bbing", new: "b" },
    { search: "rring", new: "r" },
    { search: "lling", new: "l" },
    { search: "zzing", new: "z" },
    { search: "ing", new: "" }
  ],
  [{ search: "ying", new: "ie" }, { search: "ing", new: "e" }],
  [{ search: "ed", new: "" }],
  [{ search: "ed", new: "e" }],
  [{ search: "ies", new: "y" }],
  [{ search: "ier", new: "y" }],
  [{ search: "ves", new: "fe" }],
  [{ search: "ves", new: "f" }],
  [{ search: "zzes", new: "z" }],
  [{ search: "es", new: "" }],
  [{ search: "s", new: "" }],
  [{ search: "men", new: "man" }],
  [{ search: "ae", new: "a" }],
  [{ search: "li", new: "us" }],
  [{ search: "ia", new: "ium" }],
  [{ search: "gi", new: "gus" }],
  [{ search: "ses", new: "sis" }]
];

// Lazy load
const verbs = new Map();
const nouns = new Map();

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
utils.loadJson("data/verbs.json").then(data => utils.updateMap(verbs, data));
utils.loadJson("data/nouns.json").then(data => utils.updateMap(nouns, data));
