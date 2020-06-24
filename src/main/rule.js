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
import buildDeinja from "deinja/build";

// Lazy load
const nounRule = new Map();
const phraseRule = [];
const pronounRule = [];
const spellingRule = new Map();
const trailingRule = [];
const verbRule = new Map();
const lettersRule = new Map();

let deinjaConvert = () => {};
const registerLetters = (data) => utils.updateMap(lettersRule, data);
const registerNoun = (data) => utils.updateMap(nounRule, data);
const registerPhrase = (data) => Object.assign(phraseRule, data);
const registerPronoun = (data) =>
  Object.assign(
    pronounRule,
    data.map((datum) => new Map(datum))
  );
const registerSpelling = (data) => utils.updateMap(spellingRule, data);
const registerTrailing = (data) => Object.assign(trailingRule, data);
const registerVerb = (data) => utils.updateMap(verbRule, data);
const registerJa = (data) => {
  deinjaConvert = buildDeinja(data);
};

const DEFAULT_RULE_FILE = "data/rule.json";

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const readAndLoadRuleFiles = async (ruleFile) => {
  console.time("rule");

  const rulePromise = utils.loadJson(ruleFile);

  // Redefine in order not to be executed twice
  loadBody = () => rulePromise;

  const loadedRuleData = await rulePromise;
  registerRuleData(loadedRuleData);

  console.timeEnd("rule");

  return loadedRuleData;
};

const registerRuleData = (ruleData) => {
  const processes = [
    { field: "letters", register: registerLetters },
    { field: "noun", register: registerNoun },
    { field: "phrase", register: registerPhrase },
    { field: "pronoun", register: registerPronoun },
    { field: "spelling", register: registerSpelling },
    { field: "trailing", register: registerTrailing },
    { field: "verb", register: registerVerb },
    { field: "ja", register: registerJa },
  ];

  for (let i = 0; i < processes.length; i++) {
    const proc = processes[i];
    const data = ruleData[proc.field];
    if (data) {
      proc.register(data);
    }
  }
};

let loadBody = readAndLoadRuleFiles;

const load = async (ruleFile = DEFAULT_RULE_FILE) => {
  return loadBody(ruleFile);
};

export default {
  load,
  registerRuleData,
  doBase: (word) => base({ noun: nounRule, trailing: trailingRule, verb: verbRule }, word),
  doLetters: (ch) => lettersRule.get(ch),
  doPhrase: (words) => phrase(phraseRule, words),
  doPronoun: (words) => pronoun(pronounRule, words),
  doSpelling: (words) => spelling(spellingRule, words),
  doJa: (word) => deinjaConvert(word),
};
