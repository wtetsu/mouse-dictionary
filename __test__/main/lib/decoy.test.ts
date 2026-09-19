import { afterEach, expect, test } from "vitest";
import decoy from "../../../src/main/lib/decoy";
import dom from "../../../src/main/lib/dom";

// Decoy reads computed styles of the underlay, which are only available
// once the element is attached to the document.
const createAttached = (html: string): HTMLElement => {
  const elem = dom.create(html) as HTMLElement;
  document.body.appendChild(elem);
  return elem;
};

afterEach(() => {
  document.body.innerHTML = "";
});

test("should handle input element", () => {
  const d = decoy.create("div");

  const lines: string[] = [];
  lines.push('<input type="text" value="this is text">');

  const elem = createAttached(lines.map((a) => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).not.toEqual(null);
  expect(d.decoy.innerText).toEqual("this is text");
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});

test("should handle textarea element", () => {
  const d = decoy.create("div");

  const lines: string[] = [];
  lines.push("<textarea>this is text</textarea>");

  const elem = createAttached(lines.map((a) => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).not.toEqual(null);
  expect(d.decoy.innerText).toEqual("this is text");
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});

test("should handle select element", () => {
  const d = decoy.create("div");

  const lines: string[] = [];
  lines.push("<select><option>this is text</option></select>");

  const elem = createAttached(lines.map((a) => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).not.toEqual(null);
  expect(d.decoy.innerText).toEqual("this is text");
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});

test("should handle div element", () => {
  const d = decoy.create("div");

  const lines: string[] = [];
  lines.push("<div>this is text</div>");

  const elem = createAttached(lines.map((a) => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});

test("should handle null element", () => {
  const d = decoy.create(null);

  const lines: string[] = [];
  lines.push('<input type="text" value="this is text">');

  const elem = createAttached(lines.map((a) => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});
