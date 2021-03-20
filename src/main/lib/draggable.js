/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";
import utils from "./utils";
import edge from "./edge";
import snap from "./snap";

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
    this.current = { left: null, top: null, width: null, height: null };
    this.last = { left: null, top: null, width: null, height: null };
    this.edge = edge.build({ gripWidth: 20 });
    this.edgeState = 0;
    this.selectable = false;
    this.initialize();
    this.mouseMoveFunctions = [this.updateEdgeState, this.move, this.resize];
    this.snap = snap.build();
    this.enableSnap = false;
    this.guide = null;

    this.events = {
      change: () => {},
      move: () => {},
      resize: () => {},
      finish: () => {},
    };
  }

  initialize() {
    this.starting = { x: null, y: null };
    this.changingSquare = null;
    this.mode = MODE_NONE;
  }

  onMouseMove(e, fit) {
    this.mouseMoveFunctions[this.mode].call(this, e, fit);
  }

  onMouseUp(e) {
    if (this.mode === MODE_MOVING) {
      this.mainElementStyle.apply(this.normalStyles);
    }
    this.finishChanging(e);

    // Note: keep this.enableSnap
    this.snap.deactivate();
  }

  finishChanging() {
    if (this.snap.isActivated()) {
      this.snapElement();
    }
    this.initialize();
    this.callOnChange();
    this.events.finish();
  }

  snapElement() {
    const snapRange = this.snap.getRange();
    if (!snapRange) {
      return;
    }
    this.transform(snapRange);
    this.mainElementStyle.apply(this.normalStyles);
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

    this.transform(latest);
    this.events.move();

    // Update auto-snap area
    if (this.enableSnap) {
      this.snap.activate();
    }
    const square = utils.omap(this.mainElement.style, utils.convertToInt, SQUARE_FIELDS);
    this.snap.update(e.clientX, e.clientY, square, this.mainElement.clientWidth);

    this.mainElementStyle.apply(this.movingStyles);
  }

  transform(latest) {
    for (const field of Object.keys(latest)) {
      this.applyNewStyle(latest, field);
    }
  }

  resize(e) {
    const [movedX, movedY] = this.moved(e);
    const latest = this.changingSquare.resize(movedX, movedY);
    this.transform(latest);
    this.events.resize();
  }

  moved(e) {
    return [utils.convertToInt(e.pageX) - this.starting.x, utils.convertToInt(e.pageY) - this.starting.y];
  }

  applyNewStyle(latest, prop) {
    const cval = this.current[prop];
    const lval = latest[prop];
    if (Number.isFinite(lval) && lval !== cval) {
      this.current[prop] = lval;
      this.mainElement.style[prop] = `${lval}px`;
    }
  }

  callOnChange() {
    if (utils.areSame(this.current, this.last)) {
      return;
    }
    this.events.change({ ...this.current });
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
    const newRange = {};
    if (edgeState & edge.LEFT) {
      newRange.left = JUMP_SPACE;
    } else if (edgeState & edge.RIGHT) {
      newRange.left = document.documentElement.clientWidth - this.mainElement.clientWidth - JUMP_SPACE;
    }
    if (edgeState & edge.TOP) {
      newRange.top = JUMP_SPACE;
    } else if (edgeState & edge.BOTTOM) {
      newRange.top = window.innerHeight - this.mainElement.clientHeight - JUMP_SPACE;
    }
    this.transform(newRange);
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

    if (this.mode === MODE_RESIZING) {
      this.events.resize();
    }
    if (this.mode === MODE_MOVING) {
      this.events.move();
    }
  }

  activateSnap() {
    if (this.mode === MODE_MOVING) {
      this.snap.activate();
    }
    this.enableSnap = true;
  }

  deactivateSnap() {
    this.snap.deactivate();
    this.enableSnap = false;
  }
}
