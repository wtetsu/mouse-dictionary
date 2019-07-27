import dom from "../src/lib/dom";

const createSpanWithTextNodes = (...textList) => {
  const e = dom.create("<span></span>");
  for (let i = 0; i < textList.length; i++) {
    const text = textList[i];
    e.appendChild(document.createTextNode(text));
  }
  return e;
};

test("", () => {
  const e = dom.create("<span>text</span>");

  dom.applyStyles(e, { opacity: 0.5 });
  expect(e.style.opacity).toEqual("0.5");

  dom.applyStyles(e, {});
  dom.applyStyles(e);
  dom.applyStyles(e, "xxx");
  expect(e.style.opacity).toEqual("0.5");
});

test("", () => {
  const e = dom.create("<span></span>");
  e.appendChild(createSpanWithTextNodes("a", "b", "c"));
  e.appendChild(createSpanWithTextNodes("d", "e", "f"));
  e.appendChild(createSpanWithTextNodes("g", "h", "i"));
  e.appendChild(createSpanWithTextNodes("j", "k", "l"));

  expect(dom.traverse(e.childNodes[1])).toEqual("d e f g h i j k l");
});

test("", () => {
  const e = dom.create("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(dom.traverse(e.childNodes[1])).toEqual("double-edged sword");
});

test("", () => {
  const e = dom.create("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(dom.traverse(e.childNodes[1])).toEqual("double-edged sword");
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
  expect(dom.traverse(start)).toEqual("bbb-ccc ddd eee fff ggg hhh");
});
