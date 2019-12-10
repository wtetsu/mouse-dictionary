/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import utils from "./utils";

const TOP = 1;
const RIGHT = 2;
const BOTTOM = 4;
const LEFT = 8;
const EDGE = TOP | RIGHT | BOTTOM | LEFT;
const INSIDE = 16;

// Create a "packed" array
// https://v8.dev/blog/elements-kinds
const CURSOR_STYLES = [
  "move",
  "ns-resize", // TOP
  "ew-resize", // RIGHT
  "nesw-resize", // TOP | RIGHT
  "ns-resize", // BOTTOM
  "move",
  "nwse-resize", // BOTTOM | RIGHT
  "move",
  "ew-resize", // LEFT
  "nwse-resize", // TOP | LEFT
  "move",
  "move",
  "nesw-resize", // BOTTOM | LEFT
  "move",
  "move",
  "move",
  "move"
];

class Edge {
  constructor(options) {
    this.gripWidth = options.gripWidth;
  }

  getEdgeState(rect, x, y) {
    if (isNaN(x) || isNaN(y)) {
      return 0;
    }
    let edge = 0;
    if (inRange(rect.left, x, rect.left + this.gripWidth)) {
      edge |= LEFT;
    } else if (inRange(rect.left + rect.width - this.gripWidth, x, rect.left + rect.width)) {
      edge |= RIGHT;
    }
    if (inRange(rect.top, y, rect.top + this.gripWidth)) {
      edge |= TOP;
    } else if (inRange(rect.top + rect.height - this.gripWidth, y, rect.top + rect.height)) {
      edge |= BOTTOM;
    }
    if (edge !== 0 || utils.isInsideRange(rect, { x, y })) {
      edge |= INSIDE;
    }
    return edge;
  }

  getCursorStyle(edgeState) {
    return CURSOR_STYLES[edgeState & EDGE];
  }
}

const build = options => {
  return new Edge(options);
};

const inRange = (low, value, high) => {
  return low <= value && value <= high;
};

export default {
  build,
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  EDGE,
  INSIDE
};
