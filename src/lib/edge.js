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
const DOWNWARDS = { near: TOP, far: BOTTOM };
const RIGHTWARDS = { near: LEFT, far: RIGHT };

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
  "move",
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

const build = (options) => {
  return new Edge(options);
};

const inRange = (low, value, high) => {
  return low <= value && value <= high;
};

class Square {
  constructor(onsetSquare, edgeState, minimumLength) {
    this.square = onsetSquare;
    this.edgeState = edgeState;
    this.minimumLength = minimumLength;
  }

  move(movedX, movedY) {
    return {
      left: this.square.left + movedX,
      top: this.square.top + movedY,
    };
  }

  resize(movedX, movedY) {
    const resizedSquare = { left: null, top: null, width: null, height: null };

    const downwardsPosition = this.calculate1dPosition(DOWNWARDS, this.square.top, this.square.height, movedY);
    resizedSquare.top = downwardsPosition.position;
    resizedSquare.height = downwardsPosition.length;

    const rightwardsPosition = this.calculate1dPosition(RIGHTWARDS, this.square.left, this.square.width, movedX);
    resizedSquare.left = rightwardsPosition.position;
    resizedSquare.width = rightwardsPosition.length;

    return resizedSquare;
  }

  calculate1dPosition(edges, startPosition, startLength, movedLength) {
    if (this.edgeState & edges.near) {
      const length = Math.max(startLength - movedLength, this.minimumLength);
      const position = startPosition + startLength - length;
      return { position, length };
    }
    if (this.edgeState & edges.far) {
      const length = Math.max(startLength + movedLength, this.minimumLength);
      return { position: null, length };
    }
    return {};
  }
}

const createSquare = (square, edgeState, minimumLength) => {
  return new Square(square, edgeState, minimumLength);
};

export default {
  build,
  createSquare,
  TOP,
  RIGHT,
  BOTTOM,
  LEFT,
  EDGE,
  INSIDE,
};
