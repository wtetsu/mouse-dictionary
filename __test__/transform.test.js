import testdata from "./testdata";
import transform from "../src/lib/transform";

beforeAll(() => {
  testdata.load();
});

test("", () => {
  expect(transform("word")).toEqual([]);
  expect(transform("deal")).toEqual([]);
  expect(transform("deals")).toEqual(["deal"]);
  expect(transform("dealt")).toEqual(["deal"]);
  expect(transform("dealing")).toEqual(["deal", "deale"]);

  expect(transform("run")).toEqual([]);
  expect(transform("runs")).toEqual(["run"]);
  expect(transform("ran")).toEqual(["run"]);
  expect(transform("running")).toEqual(["run", "runne"]);
});
