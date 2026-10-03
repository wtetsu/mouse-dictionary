/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import template from "../lib/template";
import type { MouseDictionarySettings, Replace } from "../types";

type GeneratorSettings = Pick<
  MouseDictionarySettings,
  | "shortWordLength"
  | "cutShortWordDescription"
  | "headFontColor"
  | "descFontColor"
  | "headFontSize"
  | "descFontSize"
  | "replaceRules"
  | "contentTemplate"
>;

type CompiledReplaceRule = { search: RegExp; replace: string };

type WordParameter = {
  head: string;
  desc: string;
  isShort: boolean;
  isShortWord: boolean;
  shortDesc: string;
  isFirst: boolean;
  isLast: boolean;
};

export default class Generator {
  shortWordLength: number;
  cutShortWordDescription: number;
  baseParameters: Record<string, string>;
  compiledReplaceRules: CompiledReplaceRule[];
  contentTemplate: string;

  constructor(settings: GeneratorSettings) {
    this.shortWordLength = settings.shortWordLength;
    this.cutShortWordDescription = settings.cutShortWordDescription;

    // cssReset is deprecated. It is kept for backward compatibility with older settings.
    const cssReset = "margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;";

    this.baseParameters = {
      headFontColor: settings.headFontColor,
      descFontColor: settings.descFontColor,
      headFontSize: settings.headFontSize,
      descFontSize: settings.descFontSize,
      cssReset,
    };

    this.compiledReplaceRules = compileReplaceRules(settings.replaceRules, {
      cssReset,
    });

    this.contentTemplate = settings.contentTemplate;

    // Pre-parse and cache template
    template.parse(settings.contentTemplate);
  }

  generate(
    words: string[],
    descriptions: Record<string, unknown>,
    enableShortWordLength = true,
  ): { html: string; hitCount: number } {
    const html = this.#createContentHtml(words, descriptions, enableShortWordLength);
    const hitCount = Object.keys(descriptions).length;
    return { html, hitCount };
  }

  #createContentHtml(words: string[], descriptions: Record<string, unknown>, enableShortWordLength: boolean): string {
    const parameters = {
      ...this.baseParameters,
      words: this.#createWordsParameter(words, descriptions, enableShortWordLength),
    };
    return template.render(this.contentTemplate, parameters);
  }

  #createDescriptionHtml(sourceText: string): string {
    let result = sourceText;
    for (let i = 0; i < this.compiledReplaceRules.length; i++) {
      const rule = this.compiledReplaceRules[i];
      result = result.replace(rule.search, rule.replace);
    }
    return result;
  }

  #createWordsParameter(
    words: string[],
    descriptions: Record<string, unknown>,
    enableShortWordLength: boolean,
  ): WordParameter[] {
    const data: WordParameter[] = [];
    const shortWordLength = enableShortWordLength ? this.shortWordLength : 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = descriptions[word];
      if (typeof desc !== "string") {
        continue;
      }
      const isShort = word.length <= shortWordLength;
      const isShortWord = word.length <= this.shortWordLength;
      data.push({
        head: escapeHtml(word),
        desc: this.#createDescriptionHtml(desc),
        isShort,
        isShortWord,
        shortDesc: desc.substring(0, this.cutShortWordDescription),
        isFirst: false,
        isLast: false,
      });
    }
    if (data.length >= 1) {
      data[0].isFirst = true;
      data[0].isShort = false;
      data[data.length - 1].isLast = true;
    }
    return data;
  }
}

const compileReplaceRules = (replaceRules: Replace[], renderParameters: unknown): CompiledReplaceRule[] => {
  const compiledReplaceRules: CompiledReplaceRule[] = [];
  for (let i = 0; i < replaceRules.length; i++) {
    const compiledRule = compileReplaceRule(replaceRules[i], renderParameters);
    if (compiledRule) {
      compiledReplaceRules.push(compiledRule);
    }
  }
  return compiledReplaceRules;
};

const compileReplaceRule = (rule: Replace, renderParameters: unknown): CompiledReplaceRule | null => {
  if (!rule.search) {
    return null;
  }
  let re = null;
  try {
    re = new RegExp(rule.search, "g");
  } catch (error) {
    console.error(error);
  }
  if (!re) {
    return null;
  }

  const replace = template.render(rule.replace, renderParameters);

  return {
    search: re,
    replace,
  };
};

const mapForEscapeHtml: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

const reForEscapeHtml = /&|<|>|"/g;

const escapeHtml = (str: string): string => {
  return str.replace(reForEscapeHtml, (ch) => mapForEscapeHtml[ch]);
};
