/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";

export default class Draggable {
  constructor(normalStyles, movingStyles) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.targetElement = null;
    this.startingX = null;
    this.startingY = null;
    this.elementX = null;
    this.elementY = null;
    this.onchange = null;
    this.currentLeft = null;
    this.currentTop = null;
    this.currentWidth = null;
    this.currentHeight = null;
    this.lastLeft = null;
    this.lastTop = null;
    this.lastWidth = null;
    this.lastHeight = null;

    document.body.addEventListener("mousemove", e => {
      if (this.targetElement) {
        let x = this.parseInt(e.pageX);
        let y = this.parseInt(e.pageY);
        this.currentLeft = this.elementX + x - this.startingX;
        this.currentTop = this.elementY + y - this.startingY;
        this.targetElement.style.left = this.currentLeft.toString() + "px";
        this.targetElement.style.top = this.currentTop.toString() + "px";
      }
    });
    document.body.addEventListener("mouseup", () => {
      if (this.targetElement) {
        dom.applyStyles(this.targetElement, this.normalStyles);
        this.targetElement = null;
        this.startingX = null;
        this.startingY = null;
        this.elementX = null;
        this.elementY = null;
        this.callOnChange();
      }
    });
  }

  callOnChange() {
    if (!this.onchange) {
      return;
    }
    if (
      this.currentLeft != this.lastLeft ||
      this.currentTop != this.lastTop ||
      this.currentWidth != this.lastWidth ||
      this.currentHeight != this.lastHeight
    ) {
      const e = {
        left: this.currentLeft,
        top: this.currentTop,
        width: this.currentWidth,
        height: this.currentHeight
      };
      this.onchange(e);

      this.lastLeft = this.currentLeft;
      this.lastTop = this.currentTop;
      this.lastWidth = this.currentWidth;
      this.lastHeight = this.currentHeight;
    }
  }

  add(elem, titleBar) {
    this.makeElementDraggable(elem, titleBar);

    elem.addEventListener("click", () => {
      this.currentWidth = elem.clientWidth;
      this.currentHeight = elem.clientHeight;
      this.callOnChange();
    });
  }
  makeElementDraggable(elem, titleBar) {
    titleBar.addEventListener("mousedown", e => {
      this.targetElement = elem;
      dom.applyStyles(this.targetElement, this.movingStyles);
      this.startingX = this.parseInt(e.pageX);
      this.startingY = this.parseInt(e.pageY);
      this.currentWidth = elem.clientWidth;
      this.currentHeight = elem.clientHeight;
      this.elementX = this.parseInt(this.targetElement.style.left);
      this.elementY = this.parseInt(this.targetElement.style.top);
    });
    this.currentLeft = this.parseInt(elem.style.left);
    this.currentTop = this.parseInt(elem.style.top);
  }

  parseInt(str) {
    let r;
    if (str === null || str === undefined || str === "") {
      r = 0;
    } else {
      r = parseInt(str, 10);
      if (isNaN(r)) {
        r = 0;
      }
    }
    return r;
  }
}
