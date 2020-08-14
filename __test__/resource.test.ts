import * as res from "../src/options/logic/resource";

test("", () => {
  expect(res.decideInitialLanguage([])).toEqual("en");
  expect(res.decideInitialLanguage(["en", "ja"])).toEqual("en");
  expect(res.decideInitialLanguage(["ja", "en"])).toEqual("ja");
  expect(res.decideInitialLanguage(["fr", "ja", "en"])).toEqual("ja");
  expect(res.decideInitialLanguage(["en-US", "ja"])).toEqual("en");
  expect(res.decideInitialLanguage(["en-UK", "ja"])).toEqual("en");
  expect(res.decideInitialLanguage(["ja-JP", "en"])).toEqual("ja");

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
