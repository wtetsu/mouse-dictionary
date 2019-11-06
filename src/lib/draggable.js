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

const EDGE_WIDTH = 8;

const EDGE_TOP = 1;
const EDGE_RIGHT = 2;
const EDGE_BOTTOM = 4;
const EDGE_LEFT = 8;

// Create a "packed" array
// https://v8.dev/blog/elements-kinds
const cursorStyles = [
  "move",
  "ns-resize", // EDGE_TOP
  "ew-resize", // EDGE_RIGHT
  "nesw-resize", // EDGE_TOP | EDGE_RIGHT
  "ns-resize", // EDGE_BOTTOM
  "move",
  "nwse-resize", // EDGE_BOTTOM | EDGE_RIGHT
  "move",
  "ew-resize", // EDGE_LEFT
  "nwse-resize", // EDGE_TOP | EDGE_LEFT
  "move",
  "move",
  "nesw-resize" // EDGE_BOTTOM | EDGE_LEFT
];

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
    this.selectable = false;
    this.initialize();
    this.gripWidth = 20;
    this.rightGripWidth = scrollable ? 35 : 20;
    this.mouseMoveFunctions = [this.updateEdgeState, this.move, this.resize];
  }

  initialize() {
    this.starting = { x: null, y: null, width: null, height: null, left: null, right: null };
    this.mode = MODE_NONE;
  }

  onMouseMove(e) {
    this.mouseMoveFunctions[this.mode].call(this, e);
  }

  onMouseUp() {
    if (this.mode === MODE_MOVING) {
      dom.applyStyles(this.mainElement, this.normalStyles);
    }
    this.finishChanging();
  }

  finishChanging() {
    this.initialize();
    this.callOnChange();
  }

  updateEdgeState(e) {
    if (!this.selectable) {
      this.cursorEdge = this.getEdgeState(e.x, e.y);
      this.mainElement.style.cursor = cursorStyles[this.cursorEdge];
      return;
    }

    if (utils.isInsideRange(this.current, e)) {
      this.cursorEdge = 0;
      this.mainElement.style.cursor = "text";
    } else {
      this.selectable = false;
      this.mainElement.style.cursor = "move";
    }
  }

  getEdgeState(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return 0;
    }
    let edge = 0;
    if (x - this.current.left <= this.gripWidth) {
      edge = EDGE_LEFT;
    } else if (this.current.left + (this.current.width + EDGE_WIDTH) - x <= this.rightGripWidth) {
      edge = EDGE_RIGHT;
    }
    if (y - this.current.top <= this.gripWidth) {
      edge |= EDGE_TOP;
    } else if (this.current.top + (this.current.height + EDGE_WIDTH) - y <= this.gripWidth) {
      edge |= EDGE_BOTTOM;
    }
    return edge;
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

    const latest = { left: null, top: null, width: null, height: null };

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

    for (let prop of Object.keys(latest)) {
      this.applyNewStyle(latest, prop);
    }
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
    this.onchange({ ...this.current });
    Object.assign(this.last, this.current);
  }

  add(mainElement) {
    this.mainElement = mainElement;
    this.makeElementDraggable(mainElement);

    this.current.width = utils.convertToInt(mainElement.style.width);
    this.current.height = utils.convertToInt(mainElement.style.height);

    this.mainElement.addEventListener("click", () => {
      this.current.width = utils.convertToInt(this.mainElement.style.width);
      this.current.height = utils.convertToInt(this.mainElement.style.height);
    });
  }

  makeElementDraggable(mainElement) {
    mainElement.addEventListener("dblclick", e => this.handleDoubleClick(e));
    mainElement.addEventListener("mousedown", e => this.handleMouseDown(e));
    mainElement.style.cursor = "move";
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
