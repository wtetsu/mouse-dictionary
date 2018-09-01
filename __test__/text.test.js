import text from "../src/text.js";

test("", () => {
  expect(text("finishRegister", 999)).toEqual("登録完了(999語)");
  expect(text("progressRegister", 999, "hello")).toEqual("999語登録(hello)");
});
