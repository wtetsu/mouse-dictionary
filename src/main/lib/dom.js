/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import ponyfill from "ponyfill";

const create = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const applyStyles = (element, styles) => {
  if (!styles || typeof styles !== "object") {
    return;
  }
  try {
    for (const key of Object.keys(styles)) {
      element.style[key] = styles[key];
    }
  } catch (e) {
    console.error(e);
  }
};

const replace = (element, newDom) => {
  element.innerHTML = "";
  element.appendChild(newDom);
};

const MAX_TRAVERSE_LEVEL = 4;
const MAX_TRAVERSE_WORDS = 10;

const traverse = (elem) => {
  const resultWords = [];

  let current = elem;
  let skip = current;

  for (let i = 0; i < MAX_TRAVERSE_LEVEL; i++) {
    if (!current || current.tagName === "BODY") {
      break;
    }

    const words = getDescendantsWords(current, skip);
    resultWords.push(...words);

    if (resultWords.length >= MAX_TRAVERSE_WORDS) {
      break;
    }

    skip = current;
    current = current.parentNode;
  }

  return joinWords(resultWords.slice(0, MAX_TRAVERSE_WORDS));
};

const joinWords = (words) => {
  const newWords = [];
  let i = 0;
  for (;;) {
    if (i >= words.length) {
      break;
    }
    const w = words[i];

    if (w === "-") {
      if (newWords.length === 0) {
        const nextWord = words[i + 1];
        newWords.push("-" + nextWord);
      } else {
        const prevWord = newWords[newWords.length - 1];
        const nextWord = words[i + 1];
        newWords[newWords.length - 1] = prevWord + "-" + nextWord;
      }
      i += 2;
    } else {
      newWords.push(w);
      i += 1;
    }
  }
  return newWords.join(" ");
};

const getDescendantsWords = (elem, skip) => {
  const words = [];

  if (!elem.childNodes || elem.childNodes.length === 0) {
    if (elem === skip) {
      return [];
    }
    const t = elem.textContent.trim();
    return t ? [t] : [];
  }

  const children = getChildren(elem, skip);
  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i]);
    words.push(...descendantsWords);
  }
  return words;
};

const getChildren = (elem, skip) => {
  if (!skip) {
    return elem.childNodes;
  }

  const result = [];
  for (let i = elem.childNodes.length - 1; i >= 0; i--) {
    const child = elem.childNodes[i];
    if (child === skip) {
      break;
    }
    result.push(child);
  }
  return result.reverse();
};

const clone = (orgElement, baseElement) => {
  const clonedElement = baseElement ?? document.createElement(orgElement.tagName);

  // Copy all styles
  clonedElement.style.cssText = ponyfill.getComputedCssText(orgElement);

  return clonedElement;
};

// "100px" -> 100.0
const pxToFloat = (str) => {
  if (!str) {
    return 0;
  }
  if (str.endsWith("px")) {
    return parseFloat(str.slice(0, -2));
  }
  return parseFloat(str);
};

/**
 * VirtualStyle can apply styles to the inner element.
 * This has "shadow" styles internally which can prevent from unnecessary style updates.
 *
 * Repeated element style updates could cause some unnecessary loads,
 * even if the assigned value is not different.
 *
 * element.style.cursor = "move";
 */
class VirtualStyle {
  constructor(element) {
    this.element = element;
    this.stagedStyles = new Map();
    this.appliedStyles = new Map();
  }

  set(prop, value) {
    if (this.stagedStyles.get(prop) === value) {
      return;
    }
    this.stagedStyles.set(prop, value);
    this.updateStyles();
  }

  apply(styles) {
    for (const [prop, value] of Object.entries(styles)) {
      this.stagedStyles.set(prop, value);
    }
    this.updateStyles();
  }

  updateStyles() {
    const diff = this.getUpdatedData(this.stagedStyles, this.appliedStyles);
    if (!diff) {
      return;
    }

    applyStyles(this.element, diff);
    this.stagedStyles = new Map();
    for (const [prop, value] of Object.entries(diff)) {
      this.appliedStyles.set(prop, value);
    }
  }

  getUpdatedData(stagedStyles, appliedStyles) {
    const diff = {};
    let count = 0;
    for (const [prop, stagedValue] of stagedStyles) {
      if (stagedValue !== appliedStyles.get(prop)) {
        diff[prop] = stagedValue;
        count += 1;
      }
    }
    if (count === 0) {
      return null;
    }
    return diff;
  }
}

export default { create, applyStyles, replace, traverse, clone, pxToFloat, VirtualStyle };
