/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "./utils";

// Lazy load
const spellings = new Map();
const pronounsList = [];
const verbs = new Map();
const nouns = new Map();
const replaceTrailingRules = [];
const phrase = [];

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const load = () => {
  utils.loadJson("data/spelling.json").then(registerSpelling);
  utils.loadJson("data/possessives.json").then(registerPossessives);
  utils.loadJson("data/verbs.json").then(registerVerbs);
  utils.loadJson("data/nouns.json").then(registerNouns);
  utils.loadJson("data/trailing.json").then(registerTrailing);
  utils.loadJson("data/phrase.json").then(registerPhrase);
};

const registerSpelling = data => utils.updateMap(spellings, data);
const registerPossessives = data => Object.assign(pronounsList, data.map(datum => new Map(datum)));
const registerVerbs = data => utils.updateMap(verbs, data);
const registerNouns = data => utils.updateMap(nouns, data);
const registerTrailing = data => Object.assign(replaceTrailingRules, data);
const registerPhrase = data => Object.assign(phrase, data);

export default {
  load,
  registerSpelling,
  registerPossessives,
  registerVerbs,
  registerNouns,
  registerTrailing,
  registerPhrase,
  spellings,
  pronounsList,
  verbs,
  nouns,
  replaceTrailingRules,
  phrase
};
