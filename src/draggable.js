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
    this.mainElement = null;
    this.mode = null;
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
    this.cursorEdgePosition = null;
    this.defaultCursor = null;

    document.body.addEventListener("mousemove", e => {
      if (this.currentWidth === null) {
        this.currentWidth = convertToInt(this.mainElement.style.width);
      }
      if (this.currentHeight === null) {
        this.currentHeight = convertToInt(this.mainElement.style.height);
      }

      switch (this.mode) {
        case "moving":
          this.move(e);
          break;
        case "resizing":
          this.resize(e);
          break;
        default:
          this.updateEdgeState(e);
      }
    });

    document.body.addEventListener("mouseup", () => {
      switch (this.mode) {
        case "moving":
          dom.applyStyles(this.mainElement, this.normalStyles);
          break;
        case "resizing":
          break;
      }
      this.finishChanging();
    });
  }

  finishChanging() {
    this.mode = null;
    this.startingX = null;
    this.startingY = null;
    this.startingWidth = null;
    this.startingHeight = null;
    this.elementX = null;
    this.elementY = null;
    this.callOnChange();
  }

  updateEdgeState(e) {
    const { onE, onW, onN, onS } = this.getEdgeState(e.x, e.y);
    let cursor;
    if (onW && onN) {
      this.cursorEdgePosition = "nw";
      cursor = "nwse-resize";
    } else if (onE && onS) {
      this.cursorEdgePosition = "se";
      cursor = "nwse-resize";
    } else if (onE && onN) {
      this.cursorEdgePosition = "ne";
      cursor = "nesw-resize";
    } else if (onW && onS) {
      this.cursorEdgePosition = "sw";
      cursor = "nesw-resize";
    } else if (onW) {
      this.cursorEdgePosition = "w";
      cursor = "ew-resize";
    } else if (onE) {
      this.cursorEdgePosition = "e";
      cursor = "ew-resize";
    } else if (onN) {
      if (!this.movePinch) {
        this.cursorEdgePosition = "n";
        cursor = "ns-resize";
      }
    } else if (onS) {
      this.cursorEdgePosition = "s";
      cursor = "ns-resize";
    } else {
      this.cursorEdgePosition = null;
      cursor = this.defaultCursor;
    }
    if (cursor) {
      this.mainElement.style.cursor = cursor;
    }
  }

  getEdgeState(x, y) {
    let onE = false;
    let onW = false;
    let onN = false;
    let onS = false;
    const offset = 8;
    if (this.onEdge(x - this.currentLeft)) {
      onW = true;
    } else if (this.onEdge(this.currentLeft + (this.currentWidth + offset) - x)) {
      onE = true;
    }
    if (this.onEdge(y - this.currentTop)) {
      onN = true;
    } else if (this.onEdge(this.currentTop + (this.currentHeight + offset) - y)) {
      onS = true;
    }
    return { onE, onW, onN, onS };
  }

  onEdge(num) {
    return num <= 20;
  }

  move(e) {
    const x = convertToInt(e.pageX);
    const y = convertToInt(e.pageY);
    const newLeft = this.elementX + x - this.startingX;
    const newTop = this.elementY + y - this.startingY;
    if (newLeft !== this.currentLeft || newTop !== this.currentTop) {
      this.currentLeft = newLeft;
      this.currentTop = newTop;
      this.moveElement(this.currentLeft, this.currentTop);
      dom.applyStyles(this.mainElement, this.movingStyles);
    }
  }

  moveElement(left, top) {
    this.mainElement.style.left = left.toString() + "px";
    this.mainElement.style.top = top.toString() + "px";
  }

  resize(e) {
    const x = convertToInt(e.pageX);
    const y = convertToInt(e.pageY);

    let newWidth = null;
    let newHeight = null;
    let newLeft = null;
    let newTop = null;
    switch (this.cursorEdgePosition) {
      case "s":
        newHeight = Math.max(this.startingHeight + y - this.startingY, 50);
        break;
      case "e":
        newWidth = Math.max(this.startingWidth + x - this.startingX, 50);
        break;
      case "w":
        newWidth = Math.max(this.startingWidth - x + this.startingX, 50);
        newLeft = this.elementX + x - this.startingX;
        break;
      case "n":
        newHeight = Math.max(this.startingHeight - y + this.startingY, 50);
        newTop = this.elementY + y - this.startingY;
        break;
      case "nw":
        newHeight = Math.max(this.startingHeight - y + this.startingY, 50);
        newTop = this.elementY + y - this.startingY;
        newWidth = Math.max(this.startingWidth - x + this.startingX, 50);
        newLeft = this.elementX + x - this.startingX;
        break;
      case "ne":
        newHeight = Math.max(this.startingHeight - y + this.startingY, 50);
        newTop = this.elementY + y - this.startingY;
        newWidth = this.startingWidth + x - this.startingX;
        break;
      case "se":
        newHeight = Math.max(this.startingHeight + y - this.startingY, 50);
        newWidth = Math.max(this.startingWidth + x - this.startingX, 50);
        break;
      case "sw":
        newHeight = Math.max(this.startingHeight + y - this.startingY, 50);
        newWidth = Math.max(this.startingWidth - x + this.startingX, 50);
        newLeft = this.elementX + x - this.startingX;
        break;
      default:
        newWidth = null;
        newHeight = null;
    }

    if (newWidth !== null && newWidth !== this.currentWidth) {
      this.currentWidth = newWidth;
      this.mainElement.style.width = this.currentWidth.toString() + "px";
    }
    if (newHeight !== null && newHeight !== this.currentHeight) {
      this.currentHeight = newHeight;
      this.mainElement.style.height = this.currentHeight.toString() + "px";
    }
    if (newLeft !== null && newLeft !== this.currentLeft) {
      this.currentLeft = newLeft;
      this.mainElement.style.left = this.currentLeft.toString() + "px";
    }
    if (newTop !== null && newTop !== this.currentTop) {
      this.currentTop = newTop;
      this.mainElement.style.top = this.currentTop.toString() + "px";
    }
  }

  callOnChange() {
    if (!this.onchange) {
      return;
    }
    if (
      this.currentLeft !== this.lastLeft ||
      this.currentTop !== this.lastTop ||
      this.currentWidth !== this.lastWidth ||
      this.currentHeight !== this.lastHeight
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

  add(mainElement, movePinch) {
    if (movePinch) {
      this.defaultCursor = "auto";
    } else {
      this.defaultCursor = "move";
    }

    this.mainElement = mainElement;
    this.movePinch = movePinch;
    this.makeElementDraggable(mainElement, movePinch);

    this.mainElement.addEventListener("click", () => {
      this.currentWidth = convertToInt(this.mainElement.style.width);
      this.currentHeight = convertToInt(this.mainElement.style.height);
    });
  }
  makeElementDraggable(mainElement, movePinch) {
    if (movePinch) {
      movePinch.addEventListener("mousedown", e => {
        this.mode = "moving";
        this.startChanging(e, mainElement);
        e.stopPropagation();
      });
      mainElement.addEventListener("mousedown", e => {
        this.mode = this.cursorEdgePosition ? "resizing" : null;
        this.startChanging(e, mainElement);
      });
    } else {
      mainElement.addEventListener("dblclick", e => {
        const { onE, onW, onN, onS } = this.getEdgeState(e.x, e.y);
        if (!onE && !onW && !onN && !onS) {
          return;
        }
        if (onW) {
          this.currentLeft = 5;
        }
        if (onN) {
          this.currentTop = 5;
        }
        if (onE) {
          this.currentLeft = window.innerWidth - this.currentWidth - 5;
        }
        if (onS) {
          this.currentTop = window.innerHeight - this.currentHeight - 5;
        }
        this.moveElement(this.currentLeft, this.currentTop);
        this.finishChanging();
      });
      mainElement.style.cursor = this.defaultCursor;
      mainElement.addEventListener("mousedown", e => {
        this.mode = this.cursorEdgePosition ? "resizing" : "moving";
        this.startChanging(e, mainElement);
        e.preventDefault();
      });
    }

    this.currentLeft = convertToInt(mainElement.style.left);
    this.currentTop = convertToInt(mainElement.style.top);
  }
  startChanging(e, elem) {
    this.startingX = convertToInt(e.pageX);
    this.startingY = convertToInt(e.pageY);
    this.startingWidth = convertToInt(elem.style.width);
    this.startingHeight = convertToInt(elem.style.height);
    this.elementX = convertToInt(elem.style.left);
    this.elementY = convertToInt(elem.style.top);
  }
}

const convertToInt = str => {
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
};
