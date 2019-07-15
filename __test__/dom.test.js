import dom from "../src/lib/dom";

test("", () => {
  const e = dom.create(`
   <div>
    <span>aaa</span>
    <span>bbb</span>
    <span>ccc</span>
   </div>
   `);
  expect(e.children.length).toEqual(3);
});
