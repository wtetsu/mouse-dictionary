/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import dom from "./dom";

const create = () => {
  return new Decoy();
};

class Decoy {
  constructor(tag = "div") {
    this.elementCache = document.createElement(tag);
  }

  activate(underlay) {
    const decoy = prepare(dom.clone(underlay, this.elementCache), underlay);
    document.body.appendChild(decoy);
    decoy.scrollTop = underlay.scrollTop;
    decoy.scrollLeft = underlay.scrollLeft;

    this.decoy = decoy;
  }

  deactivate() {
    const decoy = this.decoy;
    this.decoy = null;
    if (decoy) {
      document.body.removeChild(decoy);
    }
  }
}

const prepare = (decoy, underlay) => {
  decoy.innerText = underlay.value;

  const style = createDecoyStyle(decoy, underlay);
  dom.applyStyles(decoy, style);

  return decoy;
};

const createDecoyStyle = (decoy, underlay) => {
  const offset = getOffset(underlay);
  const top = offset.top - dom.pxToFloat(decoy.style.marginTop);
  const left = offset.left - dom.pxToFloat(decoy.style.marginLeft);

  return {
    top: `${top}px`,
    left: `${left}px`,
    position: "absolute",
    zIndex: 2147483647,
    opacity: 0
  };
};

const getOffset = element => {
  const rect = element.getBoundingClientRect();
  const doc = document.documentElement;

  return {
    top: rect.top + window.pageYOffset - doc.clientTop,
    left: rect.left + window.pageXOffset - doc.clientLeft
  };
};

export default { create };
