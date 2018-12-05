import verbs from "../src/lib/transform";

test("", () => {
  expect(verbs("word")).toEqual([]);
  expect(verbs("deal")).toEqual([]);
  expect(verbs("deals")).toEqual(["deal"]);
  expect(verbs("dealt")).toEqual(["deal"]);
  expect(verbs("dealing")).toEqual(["deal", "deale"]);

  expect(verbs("run")).toEqual([]);
  expect(verbs("runs")).toEqual(["run"]);
  expect(verbs("ran")).toEqual(["run"]);
  expect(verbs("running")).toEqual(["run", "runne"]);
});
