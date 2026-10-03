import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import dom from "../../../src/main/lib/dom";
import Draggable from "../../../src/main/lib/draggable";

const NORMAL_STYLES = { opacity: "1" };
const MOVING_STYLES = { opacity: "0.5" };

let elementsFromPoint: ReturnType<typeof vi.fn>;

beforeEach(() => {
  elementsFromPoint = vi.fn(() => []);
  (document as any).elementsFromPoint = elementsFromPoint;
});

afterEach(() => {
  (document as any).elementsFromPoint = undefined;
  document.body.innerHTML = "";
});

// A 200x200 element at (100, 100)
const createElement = (): HTMLElement => {
  const elem = dom.create(
    '<div style="position:fixed;left:100px;top:100px;width:200px;height:200px;"></div>',
  ) as HTMLElement;
  Object.defineProperty(elem, "clientWidth", { value: 200, configurable: true });
  Object.defineProperty(elem, "clientHeight", { value: 200, configurable: true });
  document.body.appendChild(elem);
  return elem;
};

const fire = (elem: HTMLElement, type: string, props: object) => {
  const event = new Event(type);
  Object.assign(event, props);
  elem.dispatchEvent(event);
  return event;
};

const setup = () => {
  const elem = createElement();
  const draggable = new Draggable(NORMAL_STYLES, MOVING_STYLES);
  const events = {
    change: vi.fn(),
    move: vi.fn(),
    resize: vi.fn(),
    finish: vi.fn(),
  };
  draggable.events = events;
  draggable.add(elem);
  return { elem, draggable, events };
};

// Hover, press and drag like a real user
const drag = (draggable: Draggable, elem: HTMLElement, from: number[], to: number[]) => {
  draggable.onMouseMove({ x: from[0], y: from[1] });
  fire(elem, "mousedown", { pageX: from[0], pageY: from[1] });
  draggable.onMouseMove({ pageX: to[0], pageY: to[1], clientX: to[0], clientY: to[1] });
};

describe("moving", () => {
  test("should move the element", () => {
    const { elem, draggable, events } = setup();
    expect(elem.style.cursor).toEqual("move");

    drag(draggable, elem, [200, 200], [230, 250]);
    expect(elem.style.left).toEqual("130px");
    expect(elem.style.top).toEqual("150px");
    expect(elem.style.opacity).toEqual("0.5");
    expect(events.move).toHaveBeenCalledTimes(2);

    draggable.onMouseUp();
    expect(elem.style.opacity).toEqual("1");
    expect(events.change).toHaveBeenCalledWith({ left: 130, top: 150, width: 200, height: 200 });
    expect(events.finish).toHaveBeenCalledTimes(1);

    // Nothing changed
    draggable.onMouseUp();
    expect(events.change).toHaveBeenCalledTimes(1);
  });

  test("should do nothing when the position doesn't change", () => {
    const { elem, draggable, events } = setup();
    drag(draggable, elem, [200, 200], [200, 200]);
    expect(events.move).toHaveBeenCalledTimes(1); // only by mousedown
    expect(elementsFromPoint).not.toHaveBeenCalled();
  });

  test("should snap to the element under the cursor", () => {
    const { elem, draggable } = setup();
    const target = { left: 10, top: 20, width: 400, height: 400 };
    elementsFromPoint.mockReturnValue([elem, { tagName: "DIV", getBoundingClientRect: () => target }]);

    draggable.onMouseMove({ x: 200, y: 200 });
    fire(elem, "mousedown", { pageX: 200, pageY: 200 });
    draggable.activateSnap();
    expect(document.body.children.length).toEqual(2); // The snap guide appears

    draggable.onMouseMove({ pageX: 230, pageY: 250, clientX: 230, clientY: 250 });
    draggable.onMouseUp();

    expect(elem.style.left).toEqual("10px");
    expect(elem.style.top).toEqual("20px");
    expect(elem.style.width).toEqual("400px");
    expect(elem.style.height).toEqual("400px");
    expect(document.body.children.length).toEqual(1);
    // enableSnap is kept after mouseup
    expect(draggable.enableSnap).toBe(true);
  });

  test("should activate snap while moving when shift is already pressed", () => {
    const { elem, draggable } = setup();
    draggable.activateSnap();
    expect(document.body.children.length).toEqual(1);

    drag(draggable, elem, [200, 200], [230, 250]);
    expect(document.body.children.length).toEqual(2);

    draggable.deactivateSnap();
    expect(document.body.children.length).toEqual(1);
    expect(draggable.enableSnap).toBe(false);
  });

  test("should keep the position when there is no snap range", () => {
    const { elem, draggable } = setup();
    draggable.onMouseMove({ x: 200, y: 200 });
    fire(elem, "mousedown", { pageX: 200, pageY: 200 });
    draggable.activateSnap();
    draggable.onMouseUp();
    expect(elem.style.left).toEqual("100px");
  });
});

describe("resizing", () => {
  test("should resize the element from the top-left corner", () => {
    const { elem, draggable, events } = setup();

    draggable.onMouseMove({ x: 100, y: 100 });
    expect(elem.style.cursor).toEqual("nwse-resize");

    fire(elem, "mousedown", { pageX: 100, pageY: 100 });
    expect(events.resize).toHaveBeenCalledTimes(1);

    draggable.onMouseMove({ pageX: 130, pageY: 140 });
    expect(elem.style.left).toEqual("130px");
    expect(elem.style.top).toEqual("140px");
    expect(elem.style.width).toEqual("170px");
    expect(elem.style.height).toEqual("160px");
    expect(events.resize).toHaveBeenCalledTimes(2);

    draggable.onMouseUp();
    expect(events.change).toHaveBeenCalledWith({ left: 130, top: 140, width: 170, height: 160 });
  });

  test("should resize the element from the bottom-right corner", () => {
    const { elem, draggable } = setup();
    drag(draggable, elem, [300, 300], [350, 320]);
    expect(elem.style.left).toEqual("100px");
    expect(elem.style.width).toEqual("250px");
    expect(elem.style.height).toEqual("220px");
  });
});

describe("double click", () => {
  test("should make the element selectable when double-clicked inside", () => {
    const { elem, draggable, events } = setup();
    fire(elem, "dblclick", { x: 200, y: 200 });
    expect(elem.style.cursor).toEqual("text");

    // Ignored while selectable
    fire(elem, "dblclick", { x: 100, y: 100 });
    const mouseDown = fire(elem, "mousedown", { pageX: 200, pageY: 200 });
    expect(mouseDown.defaultPrevented).toBe(false);
    expect(events.move).not.toHaveBeenCalled();

    // Still selectable inside the element
    draggable.onMouseMove({ x: 200, y: 200 });
    expect(elem.style.cursor).toEqual("text");

    // Leaving the element makes it draggable again
    draggable.onMouseMove({ x: 0, y: 0 });
    expect(elem.style.cursor).toEqual("move");
  });

  test.each([
    ["left", 110, 200, { left: "5px", top: "100px" }],
    ["right", 290, 200, { left: `${document.documentElement.clientWidth - 200 - 5}px`, top: "100px" }],
    ["top", 200, 110, { left: "100px", top: "5px" }],
    ["bottom", 200, 290, { left: "100px", top: `${window.innerHeight - 200 - 5}px` }],
  ])("should jump to the %s edge", (_, x, y, expected) => {
    const { elem, events } = setup();
    fire(elem, "dblclick", { x, y });
    expect(elem.style.left).toEqual(expected.left);
    expect(elem.style.top).toEqual(expected.top);
    expect(events.change).toHaveBeenCalledTimes(1);
    expect(events.finish).toHaveBeenCalledTimes(1);
  });
});

test("should update its size on click", () => {
  const { elem, draggable } = setup();
  Object.defineProperty(elem, "clientWidth", { value: 300 });
  Object.defineProperty(elem, "clientHeight", { value: 400 });
  fire(elem, "click", {});
  expect(draggable.current.width).toEqual(300);
  expect(draggable.current.height).toEqual(400);
});

test("should scroll the element", () => {
  const { elem, draggable } = setup();
  draggable.scroll(50);
  expect(elem.scrollTop).toEqual(50);
  draggable.scroll(-20);
  expect(elem.scrollTop).toEqual(30);
  draggable.resetScroll();
  expect(elem.scrollTop).toEqual(0);
});
