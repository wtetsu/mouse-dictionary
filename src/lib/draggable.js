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
const MIN_ELEMENT_SIZE = 50;
const SQUARE_FIELDS = ["left", "top", "width", "height"];

export default class Draggable {
  constructor(normalStyles, movingStyles) {
    this.normalStyles = normalStyles;
    this.movingStyles = movingStyles;
    this.mainElement = null;
    this.mainElementStyle = null;
    this.onchange = null;
    this.current = { left: null, top: null, width: null, height: null };
    this.last = { left: null, top: null, width: null, height: null };
    this.edge = edge.build({ gripWidth: 20 });
    this.edgeState = 0;
    this.selectable = false;
    this.initialize();
    this.mouseMoveFunctions = [this.updateEdgeState, this.move, this.resize];
  }

  initialize() {
    this.starting = { x: null, y: null };
    this.changingSquare = null;
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
    const [movedX, movedY] = this.moved(e);
    const latest = this.changingSquare.move(movedX, movedY);
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
    const [movedX, movedY] = this.moved(e);
    const latest = this.changingSquare.resize(movedX, movedY);
    for (const prop of SQUARE_FIELDS) {
      this.applyNewStyle(latest, prop);
    }
  }

  moved(e) {
    return [utils.convertToInt(e.pageX) - this.starting.x, utils.convertToInt(e.pageY) - this.starting.y];
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
    if (utils.areSame(this.current, this.last)) {
      return;
    }
    this.onchange?.({ ...this.current });
    Object.assign(this.last, this.current);
  }

  add(mainElement) {
    this.mainElement = mainElement;
    this.mainElementStyle = new dom.VirtualStyle(mainElement);
    this.makeElementDraggable(mainElement);

    this.current.width = mainElement.clientWidth;
    this.current.height = mainElement.clientHeight;

    this.mainElement.addEventListener("click", () => {
      this.current.width = this.mainElement.clientWidth;
      this.current.height = this.mainElement.clientHeight;
    });
  }

  makeElementDraggable(mainElement) {
    mainElement.addEventListener("dblclick", (e) => this.handleDoubleClick(e));
    mainElement.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.mainElementStyle.set("cursor", "move");
    this.current.left = utils.convertToInt(mainElement.style.left);
    this.current.top = utils.convertToInt(mainElement.style.top);
  }

  handleDoubleClick(e) {
    if (this.selectable) {
      return;
    }
    const edgeState = this.edge.getEdgeState(this.current, e.x, e.y);
    if (edgeState === edge.INSIDE) {
      this.selectable = true;
      this.mainElementStyle.set("cursor", "text");
      return;
    }
    this.jump(edgeState);
    this.finishChanging();
  }

  jump(edgeState) {
    if (edgeState & edge.LEFT) {
      this.current.left = JUMP_SPACE;
    } else if (edgeState & edge.RIGHT) {
      this.current.left = document.documentElement.clientWidth - this.mainElement.clientWidth - JUMP_SPACE;
    }
    if (edgeState & edge.TOP) {
      this.current.top = JUMP_SPACE;
    } else if (edgeState & edge.BOTTOM) {
      this.current.top = window.innerHeight - this.mainElement.clientHeight - JUMP_SPACE;
    }
    this.moveElement(this.current.left, this.current.top);
  }

  handleMouseDown(e) {
    if (this.selectable) {
      return;
    }
    this.mode = this.edgeState & edge.EDGE ? MODE_RESIZING : MODE_MOVING;
    this.starting.x = utils.convertToInt(e.pageX);
    this.starting.y = utils.convertToInt(e.pageY);

    const square = utils.omap(this.mainElement.style, utils.convertToInt, SQUARE_FIELDS);
    this.changingSquare = edge.createSquare(square, this.edgeState, MIN_ELEMENT_SIZE);
    e.preventDefault();
  }
}
