/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";

export default class Generator {
  constructor(settings) {
    this.shortWordLength = settings.shortWordLength;
    this.cutShortWordDescription = settings.cutShortWordDescription;

    const cssReset = "margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;";

    this.baseParameters = {
      headFontColor: settings.headFontColor,
      descFontColor: settings.descFontColor,
      headFontSize: settings.headFontSize,
      descFontSize: settings.descFontSize,
      cssReset,
    };

    this.scroll = settings.scroll;

    this.compiledReplaceRules = compileReplaceRules(settings.replaceRules, { cssReset });

    // Since contentTemplate is executed fairly frequently,
    // Generator uses this compiled result repeatedly.
    this.compiledContentTemplate = Hogan.compile(settings.contentTemplate);
  }

  generate(words, descriptions, enableShortWordLength = true) {
    const html = this.createContentHtml(words, descriptions, this.compiledContentTemplate, enableShortWordLength);
    const hitCount = Object.keys(descriptions).length;
    return { html, hitCount };
  }

  createContentHtml(words, descriptions, compiledContentTemplate, enableShortWordLength) {
    const parameters = {
      ...this.baseParameters,
      words: this.createWordsParameter(words, descriptions, enableShortWordLength),
    };
    const html = compiledContentTemplate.render(parameters);
    return html;
  }

  createDescriptionHtml(sourceText) {
    let result = sourceText;
    for (let i = 0; i < this.compiledReplaceRules.length; i++) {
      const rule = this.compiledReplaceRules[i];
      result = result.replace(rule.search, rule.replace);
    }
    return result;
  }

  createWordsParameter(words, descriptions, enableShortWordLength) {
    const data = [];
    const shortWordLength = enableShortWordLength ? this.shortWordLength : 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = descriptions[word];
      if (typeof desc !== "string") {
        continue;
      }
      data.push({
        head: escapeHtml(word),
        desc: this.createDescriptionHtml(desc),
        isShort: word.length <= shortWordLength,
        shortDesc: desc.substring(0, this.cutShortWordDescription),
        isFirst: false,
        isLast: false,
      });
    }
    if (data.length >= 1) {
      data[0].isFirst = true;
      data[data.length - 1].isLast = true;
    }
    return data;
  }
}

const compileReplaceRules = (replaceRules, renderParameters) => {
  const compiledReplaceRules = [];
  for (let i = 0; i < replaceRules.length; i++) {
    const compiledRule = compileReplaceRule(replaceRules[i], renderParameters);
    if (compiledRule) {
      compiledReplaceRules.push(compiledRule);
    }
  }
  return compiledReplaceRules;
};

const compileReplaceRule = (rule, renderParameters) => {
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

  const template = Hogan.compile(rule.replace);
  const replace = template.render(renderParameters);

  return {
    search: re,
    replace,
  };
};

const mapForEscapeHtml = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

const reForEscapeHtml = /&|<|>|"/g;

const escapeHtml = (str) => {
  return str.replace(reForEscapeHtml, (ch) => mapForEscapeHtml[ch]);
};
