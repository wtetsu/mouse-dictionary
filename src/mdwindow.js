/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import Hogan from "hogan.js";
import dom from "./dom";
const mdwindow = {};
mdwindow.create = settings => {
  const dialog = createDialogElement(settings);

  let header;
  if (settings.showTitlebar) {
    header = createHeaderElement(settings);
    dialog.appendChild(header);
  }

  const content = createContentWrapperElement(settings);
  dialog.appendChild(content);

  return { dialog, header, content };
};

class ContentGenerator {
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

  async generate(words) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(words, descriptions => {
        const html = this.createContentHtml(words, descriptions, this.compiledContentTemplate);
        const hitCount = Object.keys(descriptions).length;
        resolve({ html, hitCount });
      }),
        e => reject(e);
    });
  }

  createContentHtml(words, descriptions, compiledContentTemplate) {
    const data = this.createContentTemplateData(words, descriptions);
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

  createContentTemplateData(words, descriptions) {
    const data = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = descriptions[word];
      if (desc) {
        data.push({
          head: escapeHtml(word),
          desc: this.createDescriptionHtml(desc),
          isShort: word.length <= this.shortWordLength,
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
      d.isFirst = i == 0;
      d.isLast = i == data.length - 1;
    }

    return data;
  }
}

mdwindow.ContentGenerator = ContentGenerator;

export default mdwindow;

const createDialogElement = settings => {
  const compiledTemplate = Hogan.compile(settings.dialogTemplate);
  const html = compiledTemplate.render({
    backgroundColor: settings.backgroundColor,
    titlebarBackgroundColor: settings.titlebarBackgroundColor,
    width: settings.width,
    height: settings.height,
    scroll: settings.scroll
  });
  const dialog = dom.create(html);
  dom.applyStyles(dialog, settings.normalDialogStyles);
  return dialog;
};

const createHeaderElement = settings => {
  const compiledTemplate = Hogan.compile(settings.titlebarTemplate);
  const html = compiledTemplate.render({
    backgroundColor: settings.backgroundColor,
    titlebarBackgroundColor: settings.titlebarBackgroundColor
  });
  return dom.create(html);
};

const createContentWrapperElement = settings => {
  const dialog = dom.create(settings.contentWrapperTemplate);
  return dialog;
};

const escapeHtml = str => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};
