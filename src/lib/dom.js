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

export default dom;
