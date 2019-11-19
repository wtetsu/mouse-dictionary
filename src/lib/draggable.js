/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";
import utils from "./utils";
import edge from "./edge";

const MODE_NONE = 0;
const MODE_MOVING = 1;
const MODE_RESIZING = 2;
const JUMP_SPACE = 5;
const MIN_DIALOG_SIZE = 50;
const POSITION_FIELDS = ["left", "top", "width", "height"];

export default class Draggable {
  constructor(normalStyles, movingStyles, scrollable) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.mainElement = null;
    this.mainElementStyle = null;
    this.onchange = null;
    this.current = { left: null, top: null, width: null, height: null };
    this.last = { left: null, top: null, width: null, height: null };
    this.edge = edge.build({ gripWidth: { top: 20, right: scrollable ? 35 : 20, bottom: 20, left: 20 } });
    this.edgeState = 0;
    this.selectable = false;
    this.initialize();
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
      this.mainElementStyle.apply(this.normalStyles);
    }
    this.finishChanging();
  }

  finishChanging() {
    this.initialize();
    this.callOnChange();
  }

  updateEdgeState(e) {
    const edgeState = this.edge.getEdgeState(this.current, e.x, e.y);
    if (!this.selectable) {
      this.edgeState = edgeState;
      this.mainElementStyle.set("cursor", this.edge.getCursorStyle(this.edgeState));
      return;
    }

    if (edgeState & edge.INSIDE) {
      this.edgeState = 0;
      this.mainElementStyle.set("cursor", "text");
    } else {
      this.selectable = false;
      this.mainElementStyle.set("cursor", "move");
    }
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
    this.mainElementStyle.apply(this.movingStyles);
  }

  moveElement(left, top) {
    this.mainElement.style.left = `${left}px`;
    this.mainElement.style.top = `${top}px`;
  }

  resize(e) {
    const x = utils.convertToInt(e.pageX);
    const y = utils.convertToInt(e.pageY);

    const latest = { left: null, top: null, width: null, height: null };

    if (this.edgeState & edge.BOTTOM) {
      latest.height = Math.max(this.starting.height + y - this.starting.y, MIN_DIALOG_SIZE);
    } else if (this.edgeState & edge.TOP) {
      latest.height = Math.max(this.starting.height - y + this.starting.y, MIN_DIALOG_SIZE);
      latest.top = this.starting.top + y - this.starting.y;
    }
    if (this.edgeState & edge.RIGHT) {
      latest.width = Math.max(this.starting.width + x - this.starting.x, MIN_DIALOG_SIZE);
    } else if (this.edgeState & edge.LEFT) {
      latest.width = Math.max(this.starting.width - x + this.starting.x, MIN_DIALOG_SIZE);
      latest.left = this.starting.left + x - this.starting.x;
    }

    for (const prop of POSITION_FIELDS) {
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
    this.mainElementStyle = new dom.VirtualStyle(mainElement);
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
    this.mainElementStyle.set("cursor", "move");
    this.current.left = utils.convertToInt(mainElement.style.left);
    this.current.top = utils.convertToInt(mainElement.style.top);
  }

  handleDoubleClick(e) {
    if (this.selectable) {
      return;
    }
    const edgeState = this.edge.getEdgeState(this.current, e.x, e.y);
    if (edgeState & edge.INSIDE) {
      this.selectable = true;
      this.mainElementStyle.set("cursor", "text");
      return;
    }
    this.jump(edgeState);
    this.finishChanging();
  }

  jump(edgeState) {
    if (edgeState & edgeState.LEFT) {
      this.current.left = JUMP_SPACE;
    } else if (edgeState & edgeState.RIGHT) {
      this.current.left = document.documentElement.clientWidth - this.mainElement.clientWidth - JUMP_SPACE;
    }
    if (edgeState & edgeState.TOP) {
      this.current.top = JUMP_SPACE;
    } else if (edgeState & edgeState.BOTTOM) {
      this.current.top = window.innerHeight - this.mainElement.clientHeight - JUMP_SPACE;
    }
    this.moveElement(this.current.left, this.current.top);
  }

  handleMouseDown(e) {
    if (this.selectable) {
      return;
    }
    this.mode = this.edgeState & edge.EDGE ? MODE_RESIZING : MODE_MOVING;
    const newStarting = {
      x: utils.convertToInt(e.pageX),
      y: utils.convertToInt(e.pageY),
      ...utils.omap(this.mainElement.style, utils.convertToInt, POSITION_FIELDS)
    };
    Object.assign(this.starting, newStarting);
    e.preventDefault();
  }
}
