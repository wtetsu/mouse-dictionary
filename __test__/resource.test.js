import res from "../src/options/resources";

test("", () => {
  expect(res("finishRegister", 999)).toEqual("登録完了(999語)");
  expect(res("progressRegister", 999, "hello")).toEqual("999語登録(hello)");
});
