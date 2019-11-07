/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const create = html => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

const applyStyles = (element, styles) => {
  if (!styles || typeof styles !== "object") {
    return;
  }
  try {
    for (let key of Object.keys(styles)) {
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

const traverse = elem => {
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

const joinWords = words => {
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

/**
 * VirtualStyle can apply styles to the inner element.
 * This has "shadow" styles internally which can prevent from unnecessary style updates.
 */
class VirtualStyle {
  constructor(element) {
    this.element = element;
    this.stagedStyles = {};
    this.appliedStyles = {};
  }

  set(prop, value) {
    if (this.stagedStyles[prop] === value) {
      return;
    }
    this.stagedStyles[prop] = value;
    this.updateStyles();
  }

  apply(styles) {
    Object.assign(this.stagedStyles, styles);
    this.updateStyles();
  }

  updateStyles() {
    const updatedData = this.getUpdatedData(this.stagedStyles, this.appliedStyles);
    if (updatedData) {
      applyStyles(this.element, updatedData);
    }

    this.stagedStyles = {};
    Object.assign(this.appliedStyles, updatedData);

    this.updated = false;
  }

  getUpdatedData(stagedStyles, appliedStyles) {
    const d = {};
    let count = 0;
    for (const [prop, stagedValue] of Object.entries(stagedStyles)) {
      if (stagedValue !== appliedStyles[prop]) {
        d[prop] = stagedValue;
        count += 1;
      }
    }
    if (count === 0) {
      return null;
    }
    return d;
  }
}

export default { create, applyStyles, replace, traverse, VirtualStyle };
