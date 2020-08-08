import * as res from "../src/options/logic/resource";

test("", () => {
  res.setLang("ja");
  expect(res.get("selectDictFile")).toEqual("辞書ファイルを選択してください。");
  expect(res.get("finishRegister", { count: 999 })).toEqual("登録完了(999語)");
  expect(res.get("progressRegister", { count: 999, progress: "hello" })).toEqual("999語登録(hello)");
  expect(res.get("invalidKey")).toEqual("invalidKey");

  res.setLang("en");
  expect(res.get("selectDictFile")).toEqual("Select dictionary data");
  expect(res.get("finishRegister", { count: 999 })).toEqual("Loading has finished(999 words)");
  expect(res.get("progressRegister", { count: 999, progress: "hello" })).toEqual(
    "999 words have been registered(hello)"
  );
  expect(res.get("invalidKey")).toEqual("invalidKey");

  res.setLang("invalid_language");
  expect(res.get("selectDictFile")).toEqual("selectDictFile");
  expect(res.get("finishRegister", { count: 999 })).toEqual("finishRegister");
  expect(res.get("progressRegister", { count: 999, progress: "hello" })).toEqual("progressRegister");
  expect(res.get("invalidKey")).toEqual("invalidKey");
});
