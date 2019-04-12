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

dom.fetchStringFromSiblingsTextNodes = endNode => {
  const childNodes = endNode.parentNode && endNode.parentNode.childNodes;
  if (!childNodes || childNodes.length <= 1) {
    return "";
  }
  const words = [];
  let afterTheNode = false;
  for (let i = 0; i < childNodes.length; i++) {
    const childNode = childNodes[i];
    if (!afterTheNode) {
      if (childNode === endNode) {
        afterTheNode = true;
      }
    } else {
      const t = childNode.textContent && childNode.textContent.trim();
      if (t) {
        words.push(t);
      }
    }
  }
  return words.join(" ");
};

dom.traverse = elem => {
  const words = [];
  const siblings = getYoungerSiblings(elem);
  for (let i = 0; i < siblings.length; i++) {
    const descendantsWords = getDescendantsWords(siblings[i]);
    words.push(...descendantsWords);
  }
  return words.join(" ");
};

const getDescendantsWords = elem => {
  const words = [];
  const children = elem.childNodes;

  if (!children || children.length === 0) {
    return [elem.textContent];
  }
  for (let i = 0; i < children.length; i++) {
    const descendantsWords = getDescendantsWords(children[i]);
    words.push(...descendantsWords);
  }
  return words;
};

const getYoungerSiblings = elem => {
  const children = elem.parentNode && elem.parentNode.childNodes;
  if (!children || children.length <= 1) {
    return [];
  }
  const siblings = [];
  let afterTheNode = false;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!afterTheNode) {
      if (child === elem) {
        afterTheNode = true;
      }
    } else {
      siblings.push(child);
    }
  }
  return siblings;
};

export default dom;
