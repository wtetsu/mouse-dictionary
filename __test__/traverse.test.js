import dom from "../src/lib/dom";
import traverse from "../src/lib/traverse";

const createSpanWithTextNodes = (...textList) => {
  const e = dom.create("<span></span>");
  for (let i = 0; i < textList.length; i++) {
    const text = textList[i];
    e.appendChild(document.createTextNode(text));
  }
  return e;
};

test("", () => {
  const e = dom.create("<span></span>");
  e.appendChild(createSpanWithTextNodes("a", "b", "c"));
  e.appendChild(createSpanWithTextNodes("d", "e", "f"));
  e.appendChild(createSpanWithTextNodes("g", "h", "i"));
  e.appendChild(createSpanWithTextNodes("j", "k", "l"));

  expect(traverse.runFrom(e.childNodes[1])).toEqual("abcdefghijkl");
});

test("", () => {
  const e = dom.create("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(traverse.runFrom(e.childNodes[1])).toEqual("double-edged sword");
});

test("", () => {
  const e = dom.create("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(traverse.runFrom(e.childNodes[1])).toEqual("double-edged sword");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push("  <span>");
  lines.push("    aaa");
  lines.push('    <em id="start">bbb</em>');
  lines.push("    -");
  lines.push("    <em>ccc</em>");
  lines.push("    <span>");
  lines.push("      <span>");
  lines.push("        ddd");
  lines.push("        <span>");
  lines.push("          <span>eee</span>");
  lines.push("          <span>fff</span>");
  lines.push("        </span>");
  lines.push("        <span>ggg</span>");
  lines.push("      </span>");
  lines.push("    </span>");
  lines.push("    hhh");
  lines.push("  </span>");
  lines.push("</div>");

  const start = dom.create(lines.map(a => a.trim()).join("")).querySelector("#start");
  expect(traverse.runFrom(start)).toEqual("bbb-ccc ddd eee fff ggg hhh");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push("  <p>");
  lines.push("    <span>a</span>");
  lines.push("    <span>b</span>");
  lines.push("    <span>c</span>");
  lines.push("    <span> </span>");
  lines.push('    <span id="start">d</span>');
  lines.push("    <span>e</span>");
  lines.push("    <span>f</span>");
  lines.push("    <span> </span>");
  lines.push("    <span>g</span>");
  lines.push("    <span>h</span>");
  lines.push("    <span>i</span>");
  lines.push("    <span> </span>");
  lines.push("  </p>");
  lines.push("</div>");

  const start = dom.create(lines.map(a => a.trim()).join("")).querySelector("#start");
  expect(traverse.runFrom(start)).toEqual("def ghi");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push("  <span>a</span>");
  lines.push("  <span>b</span>");
  lines.push("  <span>c</span>");
  lines.push("  <span> </span>");
  lines.push("  <span>d</span>");
  lines.push("  <span>e</span>");
  lines.push('  <span id="start">f</span>');
  lines.push("  <span> </span>");
  lines.push("  <span>g</span>");
  lines.push("  <span>h</span>");
  lines.push("  <span>i</span>");
  lines.push("  <span> </span>");
  lines.push("</div>");

  const start = dom.create(lines.map(a => a.trim()).join("")).querySelector("#start");
  expect(traverse.runFrom(start)).toEqual("def ghi");
});
