/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "../lib/utils";

import base from "./rule/base";
import phrase from "./rule/phrase";
import pronoun from "./rule/pronoun";
import spelling from "./rule/spelling";

// Lazy load
const nounRule = new Map();
const phraseRule = [];
const pronounRule = [];
const spellingRule = new Map();
const trailingRule = [];
const verbRule = new Map();

const registerNoun = data => utils.updateMap(nounRule, data);
const registerPhrase = data => Object.assign(phraseRule, data);
const registerPronoun = data => Object.assign(pronounRule, data.map(datum => new Map(datum)));
const registerSpelling = data => utils.updateMap(spellingRule, data);
const registerTrailing = data => Object.assign(trailingRule, data);
const registerVerb = data => utils.updateMap(verbRule, data);

const processes = [
  { file: "data/rule/noun.json", register: registerNoun },
  { file: "data/rule/phrase.json", register: registerPhrase },
  { file: "data/rule/pronoun.json", register: registerPronoun },
  { file: "data/rule/spelling.json", register: registerSpelling },
  { file: "data/rule/trailing.json", register: registerTrailing },
  { file: "data/rule/verb.json", register: registerVerb }
];

let promiseForLoad = null;

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const load = async () => {
  if (promiseForLoad) {
    // Must not load twice
    return promiseForLoad;
  }
  let startTime;
  if (process.env.NODE_ENV !== "production") {
    startTime = new Date().getTime();
  }

  promiseForLoad = Promise.all(processes.map(it => utils.loadJson(it.file)));

  const data = await promiseForLoad;

  for (let i = 0; i < data.length; i++) {
    processes[i].register(data[i]);
  }

  if (process.env.NODE_ENV !== "production") {
    const time = new Date().getTime() - startTime;
    console.info(`Finish loading rules:${time}ms`);
  }
};

export default {
  load,
  registerNoun,
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
