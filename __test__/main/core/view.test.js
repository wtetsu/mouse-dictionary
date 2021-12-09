import view from "../../../src/main/core/view";

test("", () => {
  const r = view.create({
    dialogTemplate: "<div></div>",
    contentWrapperTemplate: "<p></p>",
  });
  expect(r.dialog.tagName).toEqual("DIV");
  expect(r.content.tagName).toEqual("P");
});
