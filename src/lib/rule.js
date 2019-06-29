/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "./utils";

import base from "./rule/base";
import phrase from "./rule/phrase";
import pronoun from "./rule/pronoun";
import spelling from "./rule/spelling";

// Lazy load
const spellingRule = new Map();
const pronounRule = [];
const verbRule = new Map();
const nounRule = new Map();
const trailingRule = [];
const phraseRule = [];

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const load = () => {
  utils.loadJson("data/rule/noun.json").then(registerNouns);
  utils.loadJson("data/rule/phrase.json").then(registerPhrase);
  utils.loadJson("data/rule/pronoun.json").then(registerPronoun);
  utils.loadJson("data/rule/spelling.json").then(registerSpelling);
  utils.loadJson("data/rule/trailing.json").then(registerTrailing);
  utils.loadJson("data/rule/verb.json").then(registerVerb);
};

const registerNouns = data => utils.updateMap(nounRule, data);
const registerPhrase = data => Object.assign(phraseRule, data);
const registerPronoun = data => Object.assign(pronounRule, data.map(datum => new Map(datum)));
const registerSpelling = data => utils.updateMap(spellingRule, data);
const registerTrailing = data => Object.assign(trailingRule, data);
const registerVerb = data => utils.updateMap(verbRule, data);

export default {
  load,
  registerNouns,
  registerPhrase,
  registerPronoun,
  registerSpelling,
  registerTrailing,
  registerVerb,
  doBase: word => base({ noun: nounRule, trailing: trailingRule, verb: verbRule }, word),
  doPhrase: words => phrase(phraseRule, words),
  doPronoun: words => pronoun(pronounRule, words),
  doSpelling: words => spelling(spellingRule, words)
};
