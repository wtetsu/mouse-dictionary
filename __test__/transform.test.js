import fs from "fs";
import transform from "../src/lib/transform";
import data from "../src/lib/data";

beforeAll(() => {
  data.registerSpelling(readJson("spelling.json"));
  data.registerPossessives(readJson("possessives.json"));
  data.registerVerbs(readJson("verbs.json"));
  data.registerNouns(readJson("nouns.json"));
  data.registerTrailing(readJson("trailing.json"));
});

const readJson = fileName => {
  const json = fs.readFileSync(`static/data/${fileName}`, "utf8");
  return JSON.parse(json);
};

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
