import { afterEach, describe, expect, test, vi } from "vitest";
import snap from "../../../src/main/lib/snap";

const fakeElement = (tagName: string, rect: { left: number; top: number; width: number; height: number }) => ({
  tagName,
  getBoundingClientRect: () => rect,
});

afterEach(() => {
  (document as any).elementsFromPoint = undefined;
  document.body.innerHTML = "";
});

describe("update and getRange", () => {
  test("should return null before any update", () => {
    expect(snap.build().getRange()).toBeNull();
  });

  test("should snap to the left side when the element sticks out to the left", () => {
    const s = snap.build();
    s.update(0, 0, { left: -10, top: 0, width: 300, height: 300 }, 300);
    expect(s.getRange()).toEqual({ left: 0, top: 0, width: 300, height: window.innerHeight - 6 });
  });

  test("should snap to the right side when the element sticks out to the right", () => {
    const s = snap.build();
    s.update(0, 0, { left: window.innerWidth - 100, top: 0, width: 200, height: 300 }, 5000);
    const width = window.innerWidth / 2;
    expect(s.getRange()).toEqual({
      left: document.documentElement.clientWidth - width,
      top: 0,
      width,
      height: window.innerHeight - 6,
    });
  });

  test("should return a copy of the range", () => {
    const s = snap.build();
    s.update(0, 0, { left: -10, top: 0, width: 300, height: 300 }, 300);
    const range = s.getRange();
    range.left = 999;
    expect(s.getRange().left).toEqual(0);
  });

  test("should select the first eligible element under the cursor", () => {
    const eligible = { left: 10, top: 20, width: 400, height: 400 };
    const elementsFromPoint = vi.fn(() => [
      fakeElement("DIV", eligible), // The first one (the dialog itself) is always skipped
      fakeElement("BODY", eligible),
      fakeElement("HTML", eligible),
      fakeElement("DIV", { left: 0, top: 0, width: 50, height: 500 }), // too narrow
      fakeElement("DIV", { left: 0, top: 0, width: 200, height: 200 }), // too small
      fakeElement("DIV", { left: 0, top: 0, width: 1000, height: 700 }), // too large
      fakeElement("DIV", eligible),
    ]);
    (document as any).elementsFromPoint = elementsFromPoint;

    const s = snap.build();
    s.update(30, 40, { left: 100, top: 100, width: 100, height: 100 }, 100);
    expect(elementsFromPoint).toHaveBeenCalledWith(30, 40);
    expect(s.getRange()).toEqual(eligible);
  });

  test("should clamp element size to the window", () => {
    (document as any).elementsFromPoint = () => [
      fakeElement("DIV", { left: 0, top: 0, width: 1, height: 1 }),
      fakeElement("DIV", { left: 0, top: 0, width: 5000, height: 150 }),
    ];
    const s = snap.build();
    s.update(0, 0, { left: 100, top: 100, width: 100, height: 100 }, 100);
    expect(s.getRange()).toEqual({ left: 0, top: 0, width: window.innerWidth, height: 150 });
  });

  test("should keep the last range when no eligible element is found", () => {
    const s = snap.build();
    s.update(0, 0, { left: -10, top: 0, width: 300, height: 300 }, 300);
    (document as any).elementsFromPoint = () => [];
    s.update(0, 0, { left: 100, top: 100, width: 100, height: 100 }, 100);
    expect(s.getRange().width).toEqual(300);
  });
});

describe("activate and deactivate", () => {
  test("should append and remove the snap element", () => {
    const s = snap.build();
    expect(s.isActivated()).toBe(false);

    s.activate();
    s.activate();
    expect(s.isActivated()).toBe(true);
    expect(document.body.children.length).toEqual(1);

    s.deactivate();
    s.deactivate();
    expect(s.isActivated()).toBe(false);
    expect(document.body.children.length).toEqual(0);
  });

  test("should move the snap element after initialized", () => {
    const s = snap.build();
    s.activate();
    s.update(0, 0, { left: -10, top: 0, width: 300, height: 300 }, 300);

    const element = document.body.children[0] as HTMLElement;
    expect(element.style.left).toEqual("0px");
    expect(element.style.width).toEqual("300px");
  });

  test("should skip the snap element itself", () => {
    const s = snap.build();
    s.activate();
    const snapElement = document.body.children[0];
    const eligible = { left: 10, top: 20, width: 400, height: 400 };
    (document as any).elementsFromPoint = () => [
      fakeElement("DIV", eligible),
      snapElement,
      fakeElement("DIV", eligible),
    ];
    s.update(0, 0, { left: 100, top: 100, width: 100, height: 100 }, 100);
    expect(s.getRange()).toEqual(eligible);
  });
});
