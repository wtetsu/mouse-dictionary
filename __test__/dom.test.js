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
  const e = dom.create("<div><span>aaa</span><span>bbb</span><span>ccc</span></div>");
  expect(e.children.length).toEqual(3);
});

test("", () => {
  const e = dom.create("<span></span>");
  e.appendChild(createSpanWithTextNodes("a", "b", "c"));
  e.appendChild(createSpanWithTextNodes("d", "e", "f"));
  e.appendChild(createSpanWithTextNodes("g", "h", "i"));
  e.appendChild(createSpanWithTextNodes("j", "k", "l"));

  expect(dom.fetchStringFromSiblingsTextNodes(e.childNodes[1])).toEqual("ghi jkl");
});

test("", () => {
  const e = dom.create("<span>opinion can be a <em>double</em>-<em>edged sword</em></span>");

  expect(dom.fetchStringFromSiblingsTextNodes(e.childNodes[1])).toEqual("- edged sword");
});
