/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "../lib/dom";

const MODE = {
  NONE: 0,
  MOVING: 1,
  RESIZING: 2
};
export default class Draggable {
  constructor(normalStyles, movingStyles, scrollable) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.mainElement = null;
    this.mode = MODE.NONE;
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
    this.cursorEdge = { top: false, right: false, bottom: false, left: false };
    this.defaultCursor = null;
    this.selectable = false;
    this.scrollable = scrollable;
  }

  onMouseMove(e) {
    if (this.currentWidth === null) {
      this.currentWidth = convertToInt(this.mainElement.style.width);
    }
    if (this.currentHeight === null) {
      this.currentHeight = convertToInt(this.mainElement.style.height);
    }

    switch (this.mode) {
      case MODE.MOVING:
        this.move(e);
        break;
      case MODE.RESIZING:
        this.resize(e);
        break;
      default:
        this.updateEdgeState(e);
    }
  }

  onMouseUp() {
    switch (this.mode) {
      case MODE.MOVING:
        dom.applyStyles(this.mainElement, this.normalStyles);
        break;
      case MODE.RESIZING:
        break;
    }
    this.finishChanging();
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
    if (this.selectable) {
      const insideWindow = this.isInsideWindow(e);
      if (insideWindow) {
        this.cursorEdge = { top: false, right: false, bottom: false, left: false };
        this.mainElement.style.cursor = "text";
      } else {
        this.selectable = false;
        this.mainElement.style.cursor = this.defaultCursor;
      }
      return;
    }
    this.cursorEdge = this.getEdgeState(e.x, e.y);
    const cursorStyle = getCursorStyle(this.cursorEdge) || this.defaultCursor;
    if (cursorStyle) {
      this.mainElement.style.cursor = cursorStyle;
    }
  }

  getEdgeState(x, y) {
    const SPACE = 8;
    const edge = { top: false, right: false, bottom: false, left: false };
    if (this.onEdge(x - this.currentLeft)) {
      edge.left = true;
    } else {
      if (this.scrollable) {
        if (this.onEdgeWithScrollBar(this.currentLeft + (this.currentWidth + SPACE) - x)) {
          edge.right = true;
        }
      } else {
        if (this.onEdge(this.currentLeft + (this.currentWidth + SPACE) - x)) {
          edge.right = true;
        }
      }
    }
    if (this.onEdge(y - this.currentTop)) {
      edge.top = true;
    } else if (this.onEdge(this.currentTop + (this.currentHeight + SPACE) - y)) {
      edge.bottom = true;
    }
    return edge;
  }

  isInsideWindow(e) {
    return (
      e.x >= this.currentLeft &&
      e.x <= this.currentLeft + this.currentWidth &&
      e.y >= this.currentTop &&
      e.y <= this.currentTop + this.currentHeight
    );
  }
  onEdge(num) {
    return num <= 20;
  }
  onEdgeWithScrollBar(num) {
    return num <= 35;
  }

  move(e) {
    const newLeft = this.elementX + convertToInt(e.pageX) - this.startingX;
    const newTop = this.elementY + convertToInt(e.pageY) - this.startingY;
    const moved = newLeft !== this.currentLeft || newTop !== this.currentTop;
    if (!moved) {
      return;
    }
    this.currentLeft = newLeft;
    this.currentTop = newTop;
    this.moveElement(this.currentLeft, this.currentTop);
    dom.applyStyles(this.mainElement, this.movingStyles);
  }

  moveElement(left, top) {
    this.mainElement.style.left = `${left}px`;
    this.mainElement.style.top = `${top}px`;
  }

  resize(e) {
    const x = convertToInt(e.pageX);
    const y = convertToInt(e.pageY);

    let newHeight = null;
    let newTop = null;
    if (this.cursorEdge.bottom) {
      newHeight = Math.max(this.startingHeight + y - this.startingY, 50);
    } else if (this.cursorEdge.top) {
      newHeight = Math.max(this.startingHeight - y + this.startingY, 50);
      newTop = this.elementY + y - this.startingY;
    }

    let newWidth = null;
    let newLeft = null;
    if (this.cursorEdge.right) {
      newWidth = Math.max(this.startingWidth + x - this.startingX, 50);
    } else if (this.cursorEdge.left) {
      newWidth = Math.max(this.startingWidth - x + this.startingX, 50);
      newLeft = this.elementX + x - this.startingX;
    }

    if (newWidth !== null && newWidth !== this.currentWidth) {
      this.currentWidth = newWidth;
      this.mainElement.style.width = `${this.currentWidth}px`;
    }
    if (newHeight !== null && newHeight !== this.currentHeight) {
      this.currentHeight = newHeight;
      this.mainElement.style.height = `${this.currentHeight}px`;
    }
    if (newLeft !== null && newLeft !== this.currentLeft) {
      this.currentLeft = newLeft;
      this.mainElement.style.left = `${this.currentLeft}px`;
    }
    if (newTop !== null && newTop !== this.currentTop) {
      this.currentTop = newTop;
      this.mainElement.style.top = `${this.currentTop}px`;
    }
  }

  callOnChange() {
    if (!this.onchange) {
      return;
    }
    const changed =
      this.currentLeft !== this.lastLeft ||
      this.currentTop !== this.lastTop ||
      this.currentWidth !== this.lastWidth ||
      this.currentHeight !== this.lastHeight;

    if (!changed) {
      return;
    }
    this.onchange({
      left: this.currentLeft,
      top: this.currentTop,
      width: this.currentWidth,
      height: this.currentHeight
    });

    this.lastLeft = this.currentLeft;
    this.lastTop = this.currentTop;
    this.lastWidth = this.currentWidth;
    this.lastHeight = this.currentHeight;
  }

  add(mainElement) {
    this.defaultCursor = "move";

    this.mainElement = mainElement;
    this.makeElementDraggable(mainElement);

    this.mainElement.addEventListener("click", () => {
      this.currentWidth = convertToInt(this.mainElement.style.width);
      this.currentHeight = convertToInt(this.mainElement.style.height);
    });
  }
  makeElementDraggable(mainElement) {
    mainElement.addEventListener("dblclick", e => {
      if (this.selectable) {
        return;
      }
      const edge = this.getEdgeState(e.x, e.y);
      const insideWindow = this.isInsideWindow(e);
      if (insideWindow && !edge.right && !edge.left && !edge.top && !edge.bottom) {
        this.selectable = true;
        this.mainElement.style.cursor = "text";
        return;
      }
      if (edge.left) {
        this.currentLeft = 5;
      }
      if (edge.top) {
        this.currentTop = 5;
      }
      if (edge.right) {
        this.currentLeft = document.documentElement.clientWidth - this.mainElement.clientWidth - 5;
      }
      if (edge.bottom) {
        this.currentTop = window.innerHeight - this.mainElement.clientHeight - 5;
      }
      this.moveElement(this.currentLeft, this.currentTop);
      this.finishChanging();
    });
    mainElement.style.cursor = this.defaultCursor;
    mainElement.addEventListener("mousedown", e => {
      if (this.selectable) {
        return;
      }
      const edge = this.cursorEdge;
      this.mode = edge.top || edge.right || edge.bottom || edge.left ? MODE.RESIZING : MODE.MOVING;
      this.startChanging(e, mainElement);
      e.preventDefault();
    });

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

const getCursorStyle = edge => {
  let cursorStyle = null;
  if (edge.left && edge.top) {
    cursorStyle = "nwse-resize";
  } else if (edge.right && edge.bottom) {
    cursorStyle = "nwse-resize";
  } else if (edge.right && edge.top) {
    cursorStyle = "nesw-resize";
  } else if (edge.left && edge.bottom) {
    cursorStyle = "nesw-resize";
  } else if (edge.left) {
    cursorStyle = "ew-resize";
  } else if (edge.right) {
    cursorStyle = "ew-resize";
  } else if (edge.top) {
    cursorStyle = "ns-resize";
  } else if (edge.bottom) {
    cursorStyle = "ns-resize";
  }
  return cursorStyle;
};
