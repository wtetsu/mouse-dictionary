/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const dom = {};

dom.create = html => {
  var template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

dom.applyStyles = (element, styles) => {
  if (!styles) {
    return;
  }
  for (let key of Object.keys(styles)) {
    element.style[key] = styles[key];
  }
};

const MAX_TRAVERSE_LEVEL = 4;
const MAX_TRAVERSE_WORDS = 10;

dom.traverse = elem => {
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

export default dom;
