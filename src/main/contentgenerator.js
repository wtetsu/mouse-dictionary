/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import storage from "../lib/storage";
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

    this.compiledReplaceRules = this.createReplaceRule(settings.replaceRules);

    // Since contentTemplate is executed fairly frequently,
    // it's compiled first and the produced result should be used repeatedly.

    this.compiledContentTemplate = Hogan.compile(settings.contentTemplate);
  }

  createReplaceRule(replaceRules) {
    const compiledReplaceRule = [];
    for (let i = 0; i < replaceRules.length; i++) {
      const rule = replaceRules[i];
      if (rule.search) {
        compiledReplaceRule.push({
          search: new RegExp(rule.search, "g"),
          replace: rule.replace
        });
      }
    }
    return compiledReplaceRule;
  }

  async generate(words, enableShortWordLength = true) {
    const descriptions = await storage.local.get(words);
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
      if (desc) {
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
    }
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      d.isFirst = i === 0;
      d.isLast = i === data.length - 1;
    }

    return data;
  }
}

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
