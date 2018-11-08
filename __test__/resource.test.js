import res from "../src/options/resources";

test("", () => {
  res.setLang("ja");
  expect(res.get("finishRegister", 999)).toEqual("登録完了(999語)");
  expect(res.get("progressRegister", 999, "hello")).toEqual("999語登録(hello)");

  res.setLang("en");
  expect(res.get("finishRegister", 999)).toEqual("Loading has finished(999 words)");
  expect(res.get("progressRegister", 999, "hello")).toEqual("999 words have registered(hello)");
});
