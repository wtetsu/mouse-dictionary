/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";

const DEFAULT_STYLE = "position:fixed;background-color:#4169e1;opacity:0.20;z-index:2147483646;";

class Snap {
  constructor() {
    this.initialized = false;
    this.activated = false;
    this.minArea = 300 * 300;
    this.minSide = 90;
    this.isElementPresent = false;
  }

  initialize() {
    if (this.initialized) {
      return;
    }
    this.snapElement = dom.create(`<div style="${DEFAULT_STYLE};"></div>`);
    this.initialized = true;
  }

  appendElement() {
    if (this.isElementPresent) {
      return;
    }
    document.body.appendChild(this.snapElement);
    this.isElementPresent = true;
  }
  removeElement() {
    if (!this.isElementPresent) {
      return;
    }
    this.snapElement.remove();
    this.isElementPresent = false;
  }

  update(pointX, pointY, square, clientWidth) {
    const range = this.fetchSnapRange(pointX, pointY, square, clientWidth);
    if (!range) {
      return;
    }
    this.lastRange = range;

    if (this.initialized) {
      this.transform(range);
    }
  }

  transform(range) {
    const style = {
      left: `${range.left}px`,
      top: `${range.top}px`,
      width: `${range.width}px`,
      height: `${range.height}px`,
    };
    dom.applyStyles(this.snapElement, style);
  }

  activate() {
    this.initialize();
    this.appendElement();
    this.activated = true;
  }

  deactivate() {
    this.removeElement();
    this.activated = false;
  }

  getRange() {
    if (!this.lastRange) {
      return null;
    }
    return { ...this.lastRange };
  }

  fetchSnapRange(pointX, pointY, square, clientWidth) {
    if (square.left < 0) {
      const width = Math.min(clientWidth, window.innerWidth / 2);
      const height = window.innerHeight - 6;
      return { left: 0, top: 0, width, height };
    }

    if (square.left + square.width > window.innerWidth) {
      const width = Math.min(clientWidth, window.innerWidth / 2);
      const height = window.innerHeight - 6;
      const left = document.documentElement.clientWidth - width;
      return { left, top: 0, width, height };
    }

    const candidates = document.elementsFromPoint(pointX, pointY);
    return this.selectSnapElementRange(candidates);
  }

  selectSnapElementRange(elements) {
    for (let i = 1; i < elements.length; i++) {
      const e = elements[i];
      if (this.isExceptionalElement(e)) {
        continue;
      }
      const range = adjustRange(e.getBoundingClientRect());
      if (this.isEligibleElement(range)) {
        return range;
      }
    }
    return null;
  }

  isExceptionalElement(element) {
    if (element === this.snapElement) {
      return true;
    }
    const tagName = element.tagName;
    if (tagName === "BODY" || tagName === "HTML") {
      return true;
    }
    return false;
  }

  isEligibleElement(range) {
    if (range.width < this.minSide || range.height < this.minSide) {
      return false;
    }
    const rangeArea = range.width * range.height;
    const windowArea = window.innerWidth * window.innerHeight;
    if (rangeArea < this.minArea || rangeArea > windowArea / 2) {
      return false;
    }
    return true;
  }

  isActivated() {
    return this.activated;
  }
}

const adjustRange = (range) => {
  return {
    left: range.left,
    top: range.top,
    width: Math.min(range.width, window.innerWidth),
    height: Math.min(range.height, window.innerHeight),
  };
};

const build = () => {
  return new Snap();
};

export default {
  build,
};
