import testdata from "./testdata";
import rule from "../src/main/core/rule";

beforeAll(() => {
  testdata.load();
});

test("", () => {
  expect(rule.doBase("word")).toEqual([]);
  expect(rule.doBase("deal")).toEqual([]);
  expect(rule.doBase("deals")).toEqual(["deal"]);
  expect(rule.doBase("dealt")).toEqual(["deal"]);
  expect(rule.doBase("dealing")).toEqual(["deal", "deale"]);

  expect(rule.doBase("run")).toEqual([]);
  expect(rule.doBase("runs")).toEqual(["run"]);
  expect(rule.doBase("ran")).toEqual(["run"]);
  expect(rule.doBase("running")).toEqual(["run", "runne", "runn"]);
});

test("", () => {
  expect(rule.doJa("死んだ")).toEqual(expect.arrayContaining(["死ぬ"]));
  expect(rule.doJa("殺った")).toEqual(expect.arrayContaining(["殺る"]));
});
