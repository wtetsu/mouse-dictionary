import decoy from "../src/lib/decoy";
import dom from "../src/lib/dom";

test("", () => {
  const d = decoy.create("div");

  const lines = [];
  lines.push("<div>");
  lines.push('<span id="start">-</span>');
  lines.push("<span>text02</span>");
  lines.push("<span>text03</span>");
  lines.push("<span>-</span>");
  lines.push("<span>text04</span>");
  lines.push("</div>");

  const elem = dom.create(lines.map(a => a.trim()).join(""));

  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.activate(elem);
  expect(d.decoy).not.toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
  d.deactivate();
  expect(d.decoy).toEqual(null);
});

test("", () => {
  const d = decoy.create(null);

  const lines = [];
  lines.push("<div>");
  lines.push('<span id="start">-</span>');
  lines.push("<span>text02</span>");
  lines.push("<span>text03</span>");
  lines.push("<span>-</span>");
  lines.push("<span>text04</span>");
  lines.push("</div>");

  const elem = dom.create(lines.map(a => a.trim()).join(""));

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
