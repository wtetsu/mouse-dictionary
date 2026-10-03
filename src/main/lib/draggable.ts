/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu, suiheilibe
 * Licensed under MIT
 */

import dom from "./dom";
import edge from "./edge";
import snap from "./snap";
import type { Rect } from "./utils";
import utils from "./utils";

const MODE_NONE = 0;
const MODE_MOVING = 1;
const MODE_RESIZING = 2;
const JUMP_SPACE = 5;
const MIN_ELEMENT_SIZE = 50;
const SQUARE_FIELDS = ["left", "top", "width", "height"];

type Square = { left: number | null; top: number | null; width: number | null; height: number | null };
type PartialSquare = Partial<Square>;
type MouseMoveFunction = (e: MouseEvent) => void;
type ChangingSquare = ReturnType<typeof edge.createSquare>;

export type DraggableEvents = {
  change: (square: Square) => void;
  move: () => void;
  resize: () => void;
  finish: () => void;
};

export default class Draggable {
  normalStyles: Record<string, string>;
  movingStyles: Record<string, string>;
  mainElement: HTMLElement | null;
  mainElementStyle: InstanceType<typeof dom.VirtualStyle> | null;
  current: Square;
  last: Square;
  edge: ReturnType<typeof edge.build>;
  edgeState: number;
  selectable: boolean;
  mouseMoveFunctions: MouseMoveFunction[];
  snap: ReturnType<typeof snap.build>;
  enableSnap: boolean;
  guide: HTMLElement | null;
  events: DraggableEvents;
  // Initialized in initialize()
  starting!: { x: number | null; y: number | null };
  changingSquare!: ChangingSquare | null;
  mode!: number;

  constructor(normalStyles: Record<string, string>, movingStyles: Record<string, string>) {
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

  initialize(): void {
    this.starting = { x: null, y: null };
    this.changingSquare = null;
    this.mode = MODE_NONE;
  }

  onMouseMove(e: MouseEvent): void {
    this.mouseMoveFunctions[this.mode].call(this, e);
  }

  onMouseUp(): void {
    if (this.mode === MODE_MOVING) {
      this.mainElementStyle?.apply(this.normalStyles);
    }
    this.finishChanging();

    // Note: keep this.enableSnap
    this.snap.deactivate();
  }

  finishChanging(): void {
    if (this.snap.isActivated()) {
      this.snapElement();
    }
    this.initialize();
    this.callOnChange();
    this.events.finish();
  }

  snapElement(): void {
    const snapRange = this.snap.getRange();
    if (!snapRange) {
      return;
    }
    this.transform(snapRange);
    this.mainElementStyle?.apply(this.normalStyles);
  }

  updateEdgeState(e: MouseEvent): void {
    const edgeState = this.edge.getEdgeState(this.current as Rect, e.x, e.y);
    if (!this.selectable) {
      this.edgeState = edgeState;
      this.mainElementStyle?.set("cursor", this.edge.getCursorStyle(this.edgeState));
      return;
    }
    if (edgeState & edge.INSIDE) {
      this.edgeState = 0;
      this.mainElementStyle?.set("cursor", "text");
    } else {
      this.selectable = false;
      this.mainElementStyle?.set("cursor", "move");
    }
  }

  move(e: MouseEvent): void {
    const [movedX, movedY] = this.moved(e);
    const latest = (this.changingSquare as ChangingSquare).move(movedX, movedY);
    if (utils.areSame(this.current, latest)) {
      return;
    }

    this.transform(latest);
    this.events.move();

    // Update auto-snap area
    if (this.enableSnap) {
      this.snap.activate();
    }
    const mainElement = this.mainElement as HTMLElement;
    const square = getElementSquare(mainElement);
    this.snap.update(e.clientX, e.clientY, square, mainElement.clientWidth);

    this.mainElementStyle?.apply(this.movingStyles);
  }

  transform(latest: PartialSquare): void {
    for (const field of Object.keys(latest) as (keyof Square)[]) {
      this.applyNewStyle(latest, field);
    }
  }

  resize(e: MouseEvent): void {
    const [movedX, movedY] = this.moved(e);
    const latest = (this.changingSquare as ChangingSquare).resize(movedX, movedY);
    this.transform(latest);
    this.events.resize();
  }

  moved(e: MouseEvent): [number, number] {
    const { x, y } = this.starting as { x: number; y: number };
    return [utils.convertToInt(e.pageX) - x, utils.convertToInt(e.pageY) - y];
  }

  applyNewStyle(latest: PartialSquare, prop: keyof Square): void {
    const cval = this.current[prop];
    const lval = latest[prop];
    if (typeof lval === "number" && Number.isFinite(lval) && lval !== cval) {
      this.current[prop] = lval;
      (this.mainElement as HTMLElement).style[prop] = `${lval}px`;
    }
  }

  callOnChange(): void {
    if (utils.areSame(this.current, this.last)) {
      return;
    }
    this.events.change({ ...this.current });
    Object.assign(this.last, this.current);
  }

  add(mainElement: HTMLElement): void {
    this.mainElement = mainElement;
    this.mainElementStyle = new dom.VirtualStyle(mainElement);
    this.makeElementDraggable(mainElement);

    this.current.width = mainElement.clientWidth;
    this.current.height = mainElement.clientHeight;

    mainElement.addEventListener("click", () => {
      this.current.width = mainElement.clientWidth;
      this.current.height = mainElement.clientHeight;
    });
  }

  makeElementDraggable(mainElement: HTMLElement): void {
    mainElement.addEventListener("dblclick", (e) => this.handleDoubleClick(e));
    mainElement.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.mainElementStyle?.set("cursor", "move");
    this.current.left = utils.convertToInt(mainElement.style.left);
    this.current.top = utils.convertToInt(mainElement.style.top);
  }

  handleDoubleClick(e: MouseEvent): void {
    if (this.selectable) {
      return;
    }
    const edgeState = this.edge.getEdgeState(this.current as Rect, e.x, e.y);
    if (edgeState === edge.INSIDE) {
      this.selectable = true;
      this.mainElementStyle?.set("cursor", "text");
      return;
    }
    this.jump(edgeState);
    this.finishChanging();
  }

  jump(edgeState: number): void {
    const mainElement = this.mainElement as HTMLElement;
    const newRange: PartialSquare = {};
    if (edgeState & edge.LEFT) {
      newRange.left = JUMP_SPACE;
    } else if (edgeState & edge.RIGHT) {
      newRange.left = document.documentElement.clientWidth - mainElement.clientWidth - JUMP_SPACE;
    }
    if (edgeState & edge.TOP) {
      newRange.top = JUMP_SPACE;
    } else if (edgeState & edge.BOTTOM) {
      newRange.top = window.innerHeight - mainElement.clientHeight - JUMP_SPACE;
    }
    this.transform(newRange);
  }

  handleMouseDown(e: MouseEvent): void {
    if (this.selectable) {
      return;
    }
    this.mode = this.edgeState & edge.EDGE ? MODE_RESIZING : MODE_MOVING;
    this.starting.x = utils.convertToInt(e.pageX);
    this.starting.y = utils.convertToInt(e.pageY);

    const square = getElementSquare(this.mainElement as HTMLElement);
    this.changingSquare = edge.createSquare(square, this.edgeState, MIN_ELEMENT_SIZE);
    e.preventDefault();

    if (this.mode === MODE_RESIZING) {
      this.events.resize();
    }
    if (this.mode === MODE_MOVING) {
      this.events.move();
    }
  }

  activateSnap(): void {
    if (this.mode === MODE_MOVING) {
      this.snap.activate();
    }
    this.enableSnap = true;
  }

  deactivateSnap(): void {
    this.snap.deactivate();
    this.enableSnap = false;
  }

  scroll(length: number): void {
    (this.mainElement as HTMLElement).scrollTop += length;
  }

  resetScroll(): void {
    (this.mainElement as HTMLElement).scrollTop = 0;
  }
}

// Reads left/top/width/height of the element style as integers
const getElementSquare = (element: HTMLElement): Rect => {
  return utils.omap(element.style as unknown as Record<string, string>, utils.convertToInt, SQUARE_FIELDS) as Rect;
};
