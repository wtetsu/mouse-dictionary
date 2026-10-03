import { afterEach, describe, expect, test, vi } from "vitest";
import chrome from "../../../src/main/lib/ponyfill/chrome";
import firefox from "../../../src/main/lib/ponyfill/firefox";
import safari from "../../../src/main/lib/ponyfill/safari";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("chrome", () => {
  test("getCaretNodeAndOffsetFromPoint should convert a range", () => {
    const node = document.createTextNode("abc");
    const ownerDocument = { caretRangeFromPoint: vi.fn(() => ({ startContainer: node, startOffset: 2 })) };
    expect(chrome.getCaretNodeAndOffsetFromPoint(ownerDocument, 10, 20)).toEqual({ node, offset: 2 });
    expect(ownerDocument.caretRangeFromPoint).toHaveBeenCalledWith(10, 20);
  });

  test("getCaretNodeAndOffsetFromPoint should return null when no range is found", () => {
    const ownerDocument = { caretRangeFromPoint: () => null };
    expect(chrome.getCaretNodeAndOffsetFromPoint(ownerDocument, 10, 20)).toBeNull();
  });

  test("getComputedCssText should return cssText", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ cssText: "color: red;" } as any);
    expect(chrome.getComputedCssText(document.createElement("div"))).toEqual("color: red;");
  });
});

describe("firefox", () => {
  test("getCaretNodeAndOffsetFromPoint should convert a caret position", () => {
    const node = document.createTextNode("abc");
    const ownerDocument = { caretPositionFromPoint: vi.fn(() => ({ offsetNode: node, offset: 1 })) };
    expect(firefox.getCaretNodeAndOffsetFromPoint(ownerDocument, 10, 20)).toEqual({ node, offset: 1 });
    expect(ownerDocument.caretPositionFromPoint).toHaveBeenCalledWith(10, 20);
  });

  test("getCaretNodeAndOffsetFromPoint should return null when no position is found", () => {
    const ownerDocument = { caretPositionFromPoint: () => null };
    expect(firefox.getCaretNodeAndOffsetFromPoint(ownerDocument, 10, 20)).toBeNull();
  });

  test("getComputedCssText should build cssText while skipping numeric keys", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      0: "color",
      12: "fontSize",
      color: "red",
      fontSize: "12px",
    } as any);
    expect(firefox.getComputedCssText(document.createElement("div"))).toEqual("color:red;fontSize:12px");
  });
});

test("safari should share the implementation with chrome", () => {
  expect(safari.getComputedCssText).toBe(chrome.getComputedCssText);
  expect(safari.getCaretNodeAndOffsetFromPoint).toBe(chrome.getCaretNodeAndOffsetFromPoint);
});

test.each(["chrome", "firefox", "safari"])("ponyfill should select the implementation for %s", async (browser) => {
  vi.stubGlobal("BROWSER", browser);
  const { default: ponyfill } = await import("../../../src/main/lib/ponyfill/ponyfill");
  const { default: expected } = await import(`../../../src/main/lib/ponyfill/${browser}.ts`);
  expect(ponyfill).toBe(expected);
});
