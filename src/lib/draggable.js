/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";
import utils from "./utils";

const MODE_NONE = 0;
const MODE_MOVING = 1;
const MODE_RESIZING = 2;

const EDGE_TOP = 1;
const EDGE_RIGHT = 2;
const EDGE_BOTTOM = 4;
const EDGE_LEFT = 8;

const EDGE_WIDTH = 8;

const POSITION_FIELDS = ["left", "top", "width", "height"];

export default class Draggable {
  constructor(normalStyles, movingStyles, scrollable) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.mainElement = null;
    this.onchange = null;
    this.current = utils.omap({}, null, POSITION_FIELDS);
    this.last = utils.omap({}, null, POSITION_FIELDS);
    this.cursorEdge = 0;
    this.defaultCursor = null;
    this.selectable = false;
    this.initialize();

    if (scrollable) {
      this.onRightEdge = this.onEdgeWithScrollBar;
    } else {
      this.onRightEdge = this.onEdge;
    }
  }

  initialize() {
    this.starting = { x: null, y: null, width: null, height: null, left: null, right: null };
    this.mode = MODE_NONE;
  }

  onMouseMove(e) {
    if (this.current.width === null) {
      this.current.width = utils.convertToInt(this.mainElement.style.width);
    }
    if (this.current.height === null) {
      this.current.height = utils.convertToInt(this.mainElement.style.height);
    }

    switch (this.mode) {
      case MODE_MOVING:
        this.move(e);
        break;
      case MODE_RESIZING:
        this.resize(e);
        break;
      default:
        this.updateEdgeState(e);
    }
  }

  onMouseUp() {
    switch (this.mode) {
      case MODE_MOVING:
        dom.applyStyles(this.mainElement, this.normalStyles);
        break;
      case MODE_RESIZING:
        break;
    }
    this.finishChanging();
  }

  finishChanging() {
    this.initialize();
    this.callOnChange();
  }

  updateEdgeState(e) {
    if (this.selectable) {
      if (utils.isInsideRange(this.current, e)) {
        this.cursorEdge = 0;
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

  /**
   * (binary)0001:top, 0010: right, 0100: bottom, 1000: left
   */
  getEdgeState(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return 0;
    }
    let edge = 0;
    if (this.onEdge(x - this.current.left)) {
      edge = EDGE_LEFT;
    } else if (this.onRightEdge(this.current.left + (this.current.width + EDGE_WIDTH) - x)) {
      edge = EDGE_RIGHT;
    }
    if (this.onEdge(y - this.current.top)) {
      edge |= EDGE_TOP;
    } else if (this.onEdge(this.current.top + (this.current.height + EDGE_WIDTH) - y)) {
      edge |= EDGE_BOTTOM;
    }
    return edge;
  }

  onEdge(num) {
    return num <= 20;
  }

  onEdgeWithScrollBar(num) {
    return num <= 35;
  }

  move(e) {
    const latest = {
      left: this.starting.left + utils.convertToInt(e.pageX) - this.starting.x,
      top: this.starting.top + utils.convertToInt(e.pageY) - this.starting.y
    };
    if (utils.areSame(this.current, latest)) {
      return;
    }
    Object.assign(this.current, latest);
    this.moveElement(this.current.left, this.current.top);
    dom.applyStyles(this.mainElement, this.movingStyles);
  }

  moveElement(left, top) {
    this.mainElement.style.left = `${left}px`;
    this.mainElement.style.top = `${top}px`;
  }

  resize(e) {
    const MIN_SIZE = 50;
    const x = utils.convertToInt(e.pageX);
    const y = utils.convertToInt(e.pageY);

    const latest = { height: null, width: null, top: null, left: null };
    if (this.cursorEdge & EDGE_BOTTOM) {
      latest.height = Math.max(this.starting.height + y - this.starting.y, MIN_SIZE);
    } else if (this.cursorEdge & EDGE_TOP) {
      latest.height = Math.max(this.starting.height - y + this.starting.y, MIN_SIZE);
      latest.top = this.starting.top + y - this.starting.y;
    }
    if (this.cursorEdge & EDGE_RIGHT) {
      latest.width = Math.max(this.starting.width + x - this.starting.x, MIN_SIZE);
    } else if (this.cursorEdge & EDGE_LEFT) {
      latest.width = Math.max(this.starting.width - x + this.starting.x, MIN_SIZE);
      latest.left = this.starting.left + x - this.starting.x;
    }
    this.applyNewStyle(latest, "height");
    this.applyNewStyle(latest, "width");
    this.applyNewStyle(latest, "top");
    this.applyNewStyle(latest, "left");
  }

  applyNewStyle(latest, prop) {
    const cval = this.current[prop];
    const lval = latest[prop];
    if (lval !== null && lval !== cval) {
      this.current[prop] = lval;
      this.mainElement.style[prop] = `${lval}px`;
    }
  }

  callOnChange() {
    if (!this.onchange) {
      return;
    }
    if (utils.areSame(this.current, this.last)) {
      return;
    }
    this.onchange(Object.assign({}, this.current));
    Object.assign(this.last, this.current);
  }

  add(mainElement) {
    this.defaultCursor = "move";
    this.mainElement = mainElement;
    this.makeElementDraggable(mainElement);

    this.mainElement.addEventListener("click", () => {
      this.current.width = utils.convertToInt(this.mainElement.style.width);
      this.current.height = utils.convertToInt(this.mainElement.style.height);
    });
  }

  makeElementDraggable(mainElement) {
    mainElement.addEventListener("dblclick", e => this.handleDoubleClick(e));
    mainElement.addEventListener("mousedown", e => this.handleMouseDown(e));
    mainElement.style.cursor = this.defaultCursor;
    this.current.left = utils.convertToInt(mainElement.style.left);
    this.current.top = utils.convertToInt(mainElement.style.top);
  }

  handleDoubleClick(e) {
    if (this.selectable) {
      return;
    }
    const edge = this.getEdgeState(e.x, e.y);
    if (edge === 0 && utils.isInsideRange(this.current, e)) {
      this.selectable = true;
      this.mainElement.style.cursor = "text";
      return;
    }
    const SPACE = 5;
    if (edge & EDGE_LEFT) {
      this.current.left = SPACE;
    } else if (edge & EDGE_RIGHT) {
      this.current.left = document.documentElement.clientWidth - this.mainElement.clientWidth - SPACE;
    }
    if (edge & EDGE_TOP) {
      this.current.top = SPACE;
    } else if (edge & EDGE_BOTTOM) {
      this.current.top = window.innerHeight - this.mainElement.clientHeight - SPACE;
    }
    this.moveElement(this.current.left, this.current.top);
    this.finishChanging();
  }

  handleMouseDown(e) {
    if (this.selectable) {
      return;
    }
    this.mode = this.cursorEdge >= 1 ? MODE_RESIZING : MODE_MOVING;
    const newStarting = {
      x: utils.convertToInt(e.pageX),
      y: utils.convertToInt(e.pageY),
      ...utils.omap(this.mainElement.style, utils.convertToInt, POSITION_FIELDS)
    };
    Object.assign(this.starting, newStarting);
    e.preventDefault();
  }
}

// Create a "packed" array
// https://v8.dev/blog/elements-kinds
const cursorStyles = [
  "",
  "ns-resize", // EDGE_TOP
  "ew-resize", // EDGE_RIGHT
  "nesw-resize", // EDGE_TOP | EDGE_RIGHT
  "ns-resize", // EDGE_BOTTOM
  "",
  "nwse-resize", // EDGE_BOTTOM | EDGE_RIGHT
  "",
  "ew-resize", // EDGE_LEFT
  "nwse-resize", // EDGE_TOP | EDGE_LEFT
  "",
  "",
  "nesw-resize" // EDGE_BOTTOM | EDGE_LEFT
];

const getCursorStyle = edge => {
  if (edge === 0) {
    return null;
  }
  return cursorStyles[edge];
};
