/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import buildDeinja from "deinja/build";
import type { TrailingRule } from "../lib/trailing";
import utils from "../lib/utils";
import base from "./rule/base";
import type { PhraseRule } from "./rule/phrase";
import phrase from "./rule/phrase";
import pronoun from "./rule/pronoun";
import spelling from "./rule/spelling";

type Pairs<K, V> = [K, V][];

// Contents of data/rule.json
export type RuleData = {
  letters?: Pairs<number, number>;
  noun?: Pairs<string, string>;
  phrase?: PhraseRule;
  pronoun?: Pairs<string, string>[];
  spelling?: Pairs<string, string>;
  trailing?: TrailingRule;
  verb?: Pairs<string, string>;
  ja?: unknown;
};

// Lazy load
const nounRule = new Map<string, string>();
const phraseRule: PhraseRule = [];
const pronounRule: Map<string, string>[] = [];
const spellingRule = new Map<string, string>();
const trailingRule: TrailingRule = [];
const verbRule = new Map<string, string>();
const lettersRule = new Map<number, number>();

let deinjaConvert: (word: string) => string[] | undefined = () => undefined;
const registerLetters = (data: Pairs<number, number>) => utils.updateMap(lettersRule, data);
const registerNoun = (data: Pairs<string, string>) => utils.updateMap(nounRule, data);
const registerPhrase = (data: PhraseRule) => Object.assign(phraseRule, data);
const registerPronoun = (data: Pairs<string, string>[]) =>
  Object.assign(
    pronounRule,
    data.map((datum) => new Map(datum)),
  );
const registerSpelling = (data: Pairs<string, string>) => utils.updateMap(spellingRule, data);
const registerTrailing = (data: TrailingRule) => Object.assign(trailingRule, data);
const registerVerb = (data: Pairs<string, string>) => utils.updateMap(verbRule, data);
const registerJa = (data: unknown) => {
  deinjaConvert = buildDeinja(data);
};

const DEFAULT_RULE_FILE = "data/rule.json";

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const readAndLoadRuleFiles = async (ruleFile: string): Promise<RuleData> => {
  DEBUG && console.time("rule");

  const rulePromise = utils.loadJson<RuleData>(ruleFile);

  // Redefine in order not to be executed twice
  loadBody = () => rulePromise;

  const loadedRuleData = await rulePromise;
  registerRuleData(loadedRuleData);

  DEBUG && console.timeEnd("rule");

  return loadedRuleData;
};

const registerRuleData = (ruleData: RuleData): void => {
  // Each register function accepts the type of its own field
  const processes: { field: keyof RuleData; register: (data: any) => unknown }[] = [
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

const load = async (ruleFile = DEFAULT_RULE_FILE): Promise<RuleData> => {
  return loadBody(ruleFile);
};

export default {
  load,
  registerRuleData,
  doBase: (word: string) => base({ noun: nounRule, trailing: trailingRule, verb: verbRule }, word),
  doLetters: (ch: number) => lettersRule.get(ch),
  doPhrase: (words: string[]) => phrase(phraseRule, words),
  doPronoun: (words: string[]) => pronoun(pronounRule, words),
  doSpelling: (words: string[]) => spelling(spellingRule, words),
  doJa: (word: string) => deinjaConvert(word),
};
