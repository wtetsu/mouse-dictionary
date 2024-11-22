import view from "../../../src/main/core/view";

test("should create a dialog element with the correct tag name", () => {
  const r = view.create({
    dialogTemplate: "<div></div>",
    contentWrapperTemplate: "<p></p>",
  });
  expect(r.dialog.tagName).toEqual("DIV");
  expect(r.content.tagName).toEqual("P");
});
