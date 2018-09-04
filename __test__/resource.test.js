import resource from "../src/resource";

test("", () => {
  expect(resource("finishRegister", 999)).toEqual("登録完了(999語)");
  expect(resource("progressRegister", 999, "hello")).toEqual("999語登録(hello)");
});
