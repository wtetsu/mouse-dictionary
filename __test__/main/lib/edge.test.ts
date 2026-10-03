import { describe, expect, test } from "vitest";
import edge from "../../../src/main/lib/edge";

const rect = { left: 100, top: 100, width: 200, height: 200 };

describe("getEdgeState", () => {
  const e = edge.build({ gripWidth: 20 });

  test("should detect corners", () => {
    expect(e.getEdgeState(rect, 100, 100)).toEqual(edge.LEFT | edge.TOP | edge.INSIDE);
    expect(e.getEdgeState(rect, 300, 100)).toEqual(edge.RIGHT | edge.TOP | edge.INSIDE);
    expect(e.getEdgeState(rect, 100, 300)).toEqual(edge.LEFT | edge.BOTTOM | edge.INSIDE);
    expect(e.getEdgeState(rect, 300, 300)).toEqual(edge.RIGHT | edge.BOTTOM | edge.INSIDE);
  });

  test("should detect sides", () => {
    expect(e.getEdgeState(rect, 110, 200)).toEqual(edge.LEFT | edge.INSIDE);
    expect(e.getEdgeState(rect, 290, 200)).toEqual(edge.RIGHT | edge.INSIDE);
    expect(e.getEdgeState(rect, 200, 110)).toEqual(edge.TOP | edge.INSIDE);
    expect(e.getEdgeState(rect, 200, 290)).toEqual(edge.BOTTOM | edge.INSIDE);
  });

  test("should detect inside and outside", () => {
    expect(e.getEdgeState(rect, 200, 200)).toEqual(edge.INSIDE);
    expect(e.getEdgeState(rect, 50, 50)).toEqual(0);
    expect(e.getEdgeState(rect, 400, 200)).toEqual(0);
  });

  test("should return 0 for NaN coordinates", () => {
    expect(e.getEdgeState(rect, Number.NaN, 100)).toEqual(0);
    expect(e.getEdgeState(rect, 100, Number.NaN)).toEqual(0);
  });
});

test("getCursorStyle should return a cursor for each edge state", () => {
  const e = edge.build({ gripWidth: 20 });
  expect(e.getCursorStyle(edge.INSIDE)).toEqual("move");
  expect(e.getCursorStyle(edge.TOP | edge.INSIDE)).toEqual("ns-resize");
  expect(e.getCursorStyle(edge.BOTTOM)).toEqual("ns-resize");
  expect(e.getCursorStyle(edge.LEFT)).toEqual("ew-resize");
  expect(e.getCursorStyle(edge.RIGHT)).toEqual("ew-resize");
  expect(e.getCursorStyle(edge.TOP | edge.RIGHT)).toEqual("nesw-resize");
  expect(e.getCursorStyle(edge.BOTTOM | edge.LEFT)).toEqual("nesw-resize");
  expect(e.getCursorStyle(edge.TOP | edge.LEFT)).toEqual("nwse-resize");
  expect(e.getCursorStyle(edge.BOTTOM | edge.RIGHT | edge.INSIDE)).toEqual("nwse-resize");
});

describe("Square", () => {
  test("move should shift the position", () => {
    const square = edge.createSquare({ ...rect }, edge.INSIDE, 50);
    expect(square.move(10, -20)).toEqual({ left: 110, top: 80 });
  });

  test("resize from the top-left corner should change both position and size", () => {
    const square = edge.createSquare({ ...rect }, edge.TOP | edge.LEFT, 50);
    expect(square.resize(30, 40)).toEqual({ left: 130, top: 140, width: 170, height: 160 });
  });

  test("resize from the bottom-right corner should change only size", () => {
    const square = edge.createSquare({ ...rect }, edge.BOTTOM | edge.RIGHT, 50);
    expect(square.resize(30, 40)).toEqual({ left: null, top: null, width: 230, height: 240 });
  });

  test("resize should respect the minimum length", () => {
    const top = edge.createSquare({ ...rect }, edge.TOP, 50);
    expect(top.resize(0, 500)).toEqual({ top: 250, height: 50 });

    const right = edge.createSquare({ ...rect }, edge.RIGHT, 50);
    expect(right.resize(-500, 0)).toEqual({ left: null, width: 50 });
  });
});
