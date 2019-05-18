/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";

export default class ContentGenerator {
  constructor(settings) {
    this.shortWordLength = settings.shortWordLength;
    this.cutShortWordDescription = settings.cutShortWordDescription;
    this.headFontColor = settings.headFontColor;
    this.descFontColor = settings.descFontColor;
    this.headFontSize = settings.headFontSize;
    this.descFontSize = settings.descFontSize;
    this.scroll = settings.scroll;

    this.compiledReplaceRules = compileReplaceRules(settings.replaceRules);

    // Since contentTemplate is executed fairly frequently,
    // ContentGenerator uses this compiled result repeatedly.
    this.compiledContentTemplate = Hogan.compile(settings.contentTemplate);
  }

  generate(words, descriptions, enableShortWordLength = true) {
    const html = this.createContentHtml(words, descriptions, this.compiledContentTemplate, enableShortWordLength);
    const hitCount = Object.keys(descriptions).length;
    return { html, hitCount };
  }

  createContentHtml(words, descriptions, compiledContentTemplate, enableShortWordLength) {
    const data = this.createContentTemplateData(words, descriptions, enableShortWordLength);
    const html = compiledContentTemplate.render({ words: data });
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

  createContentTemplateData(words, descriptions, enableShortWordLength) {
    const data = [];

    const shortWordLength = enableShortWordLength ? this.shortWordLength : 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = descriptions[word];
      if (!desc) {
        continue;
      }
      data.push({
        head: escapeHtml(word),
        desc: this.createDescriptionHtml(desc),
        isShort: word.length <= shortWordLength,
        shortDesc: desc.substring(0, this.cutShortWordDescription),
        headFontColor: this.headFontColor,
        descFontColor: this.descFontColor,
        headFontSize: this.headFontSize,
        descFontSize: this.descFontSize
      });
    }
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      d.isFirst = i === 0;
      d.isLast = i === data.length - 1;
    }
    return data;
  }
}

const compileReplaceRules = replaceRules => {
  const compiledReplaceRule = [];
  for (let i = 0; i < replaceRules.length; i++) {
    const compiledRule = compileReplaceRule(replaceRules[i]);
    if (compiledRule) {
      compiledReplaceRule.push(compiledRule);
    }
  }
  return compiledReplaceRule;
};

const compileReplaceRule = rule => {
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
  return {
    search: re,
    replace: rule.replace
  };
};

const mapForEscapeHtml = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};

const reForEscapeHtml = /&|<|>|"/g;

const escapeHtml = str => {
  return str.replace(reForEscapeHtml, ch => mapForEscapeHtml[ch]);
};
