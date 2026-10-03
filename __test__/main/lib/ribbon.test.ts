import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ribbon from "../../../src/main/lib/ribbon";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

test("should show progress and animate the indicator", () => {
  const [update, close] = ribbon.create("color:red");

  const line = document.body.lastElementChild as HTMLElement;
  expect(line.style.color).toEqual("red");
  const [progress, indicator] = Array.from(line.children);

  update("Downloading...");
  expect(progress.textContent).toEqual("Downloading...");

  vi.advanceTimersByTime(150);
  expect(indicator.textContent).toEqual("⠿");

  update("Done", ["X"]);
  expect(progress.textContent).toEqual("Done");
  vi.advanceTimersByTime(150);
  expect(indicator.textContent).toEqual("X");

  close();
  expect(document.body.contains(line)).toBe(false);
  expect(vi.getTimerCount()).toEqual(0);
});

test("should work with the default style", () => {
  const [, close] = ribbon.create();
  expect(document.body.children.length).toEqual(1);
  close();
  expect(document.body.children.length).toEqual(0);
});
