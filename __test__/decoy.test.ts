import decoy from "../src/main/lib/decoy";
import dom from "../src/main/lib/dom";

test("", () => {
  const d = decoy.create("div");

  const lines = [];
  lines.push('<input type="text" value="this is text">');

  const elem = dom.create(lines.map((a) => a.trim()).join(""));

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

test("", () => {
  const d = decoy.create("div");

  const lines = [];
  lines.push("<textarea>this is text</textarea>");

  const elem = dom.create(lines.map((a) => a.trim()).join(""));

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

test("", () => {
  const d = decoy.create("div");

  const lines = [];
  lines.push("<select><option>this is text</option></select>");

  const elem = dom.create(lines.map((a) => a.trim()).join(""));

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

test("", () => {
  const d = decoy.create("div");

  const lines = [];
  lines.push("<div>this is text</div>");

  const elem = dom.create(lines.map((a) => a.trim()).join(""));

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

test("", () => {
  const d = decoy.create(null);

  const lines = [];
  lines.push('<input type="text" value="this is text">');

  const elem = dom.create(lines.map((a) => a.trim()).join(""));

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
