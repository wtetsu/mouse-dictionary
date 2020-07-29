import dom from "../src/main/lib/dom";

const createDom = (html: string): HTMLElement => dom.create(html) as HTMLElement;

const createSpanWithTextNodes = (...textList) => {
  const e = createDom("<span></span>");
  for (let i = 0; i < textList.length; i++) {
    const text = textList[i];
    e.appendChild(document.createTextNode(text));
  }
  return e;
};

test("", () => {
  const e = createDom("<span>text</span>") as HTMLElement;

  dom.applyStyles(e, { opacity: 0.5 });
  expect(e.style.opacity).toEqual("0.5");

  dom.applyStyles(e, { opacity: 0.6, "@invalidProperty": 99999 });
  expect(e.style.opacity).toEqual("0.6");

  dom.applyStyles(e, { "@invalidProperty": 99999, opacity: 0.7 });
  expect(e.style.opacity).toEqual("0.7");

  dom.applyStyles(e, {});
  dom.applyStyles(e);
  dom.applyStyles(e, "xxx");
  expect(e.style.opacity).toEqual("0.7");
});

test("", () => {
  const e = createDom("<div><span>aaa</span></div>");
  dom.replace(e, createDom("<span>bbb</span>"));
  expect("<span>bbb</span>").toEqual(e.innerHTML);
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push('  <span id="start">text01</span>');
  lines.push("  <span>text02</span>");
  lines.push("  <span>text03</span>");
  lines.push("  <span>text04</span>");
  lines.push("  <span>text05</span>");
  lines.push("  <span>text06</span>");
  lines.push("  <span>text07</span>");
  lines.push("  <span>text08</span>");
  lines.push("  <span>text09</span>");
  lines.push("  <span>text10</span>");
  lines.push("  <span>text11</span>"); // truncated
  lines.push("  <span>text12</span>"); // truncated
  lines.push("</div>");

  const start = createDom(lines.map((a) => a.trim()).join("")).querySelector("#start");
  expect(dom.traverse(start)).toEqual("text01 text02 text03 text04 text05 text06 text07 text08 text09 text10");
});

test("", () => {
  const e = createDom("<span></span>");
  e.appendChild(createSpanWithTextNodes("a", "b", "c"));
  e.appendChild(createSpanWithTextNodes("d", "e", "f"));
  e.appendChild(createSpanWithTextNodes("g", "h", "i"));
  e.appendChild(createSpanWithTextNodes("j", "k", "l"));

  expect(dom.traverse(e.childNodes[1])).toEqual("d e f g h i j k l");
});

test("", () => {
  const e = createDom("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(dom.traverse(e.childNodes[1])).toEqual("double-edged sword");
});

test("", () => {
  const e = createDom("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

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

  const start = createDom(lines.map((a) => a.trim()).join("")).querySelector("#start");
  expect(dom.traverse(start)).toEqual("bbb-ccc ddd eee fff ggg hhh");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push('<span id="start"></span>');
  lines.push("</div>");

  const start = createDom(lines.map((a) => a.trim()).join("")).querySelector("#start");
  expect(dom.traverse(start)).toEqual("");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push('<span id="start">text01</span>');
  lines.push("<span>-</span>");
  lines.push("<span>text02</span>");
  lines.push("<span>text03</span>");
  lines.push("<span>-</span>");
  lines.push("<span>text04</span>");
  lines.push("</div>");

  const start = createDom(lines.map((a) => a.trim()).join("")).querySelector("#start");
  expect(dom.traverse(start)).toEqual("text01-text02 text03-text04");
});

test("", () => {
  const lines = [];
  lines.push("<div>");
  lines.push('<span id="start">-</span>');
  lines.push("<span>text02</span>");
  lines.push("<span>text03</span>");
  lines.push("<span>-</span>");
  lines.push("<span>text04</span>");
  lines.push("</div>");

  const start = createDom(lines.map((a) => a.trim()).join("")).querySelector("#start");
  expect(dom.traverse(start)).toEqual("-text02 text03-text04");
});

test("", () => {
  const element: Record<string, any> = {};
  const vStyle = new dom.VirtualStyle(element);

  element.style = {};
  expect(element.style).toEqual({});

  element.style = {};
  vStyle.set("cursor", "move");
  expect(element.style).toEqual({ cursor: "move" });

  element.style = {};
  vStyle.set("cursor", "move");
  vStyle.set("cursor", "move");
  expect(element.style).toEqual({});

  element.style = {};
  vStyle.set("cursor", "wait");
  expect(element.style).toEqual({ cursor: "wait" });

  element.style = {};
  vStyle.apply({ cursor: "wait", color: "red" });
  expect(element.style).toEqual({ color: "red" });

  element.style = {};
  vStyle.apply({ cursor: "move", color: "blue" });
  expect(element.style).toEqual({ cursor: "move", color: "blue" });
});

test("", () => {
  expect(dom.pxToFloat()).toEqual(0);
  expect(dom.pxToFloat("")).toEqual(0);
  expect(dom.pxToFloat("@@")).toEqual(NaN);
  expect(dom.pxToFloat("123")).toEqual(123);
  expect(dom.pxToFloat("123px")).toEqual(123);
  expect(dom.pxToFloat("123.5px")).toEqual(123.5);
});

test("", () => {
  const lines = [];
  lines.push('<div style="width:200px;height:300px;">');
  lines.push('<span id="start">-</span>');
  lines.push("<span>text02</span>");
  lines.push("<span>text03</span>");
  lines.push("<span>-</span>");
  lines.push("<span>text04</span>");
  lines.push("</div>");

  const elem = createDom(lines.map((a) => a.trim()).join(""));

  const clonedElem = dom.clone(elem);

  expect(clonedElem).not.toEqual(elem);

  expect(clonedElem.style.width).toEqual("200px");
  expect(clonedElem.style.height).toEqual("300px");
});
