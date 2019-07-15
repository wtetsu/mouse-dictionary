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

export default { create, applyStyles, replace };
