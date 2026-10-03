import { afterEach, beforeEach, expect, test, vi } from "vitest";

const RULE_DATA = {
  letters: [[97, 3]],
  noun: [["mice", "mouse"]],
  verb: [["ran", "run"]],
  trailing: [],
  phrase: [],
  pronoun: [],
  spelling: [["colour", "color"]],
};

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  global.chrome = { runtime: { getURL: (path: string) => `chrome-extension://test/${path}` } } as any;
  fetchMock = vi.fn(async () => ({ json: async () => RULE_DATA }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("should load the rule file only once", async () => {
  const { default: rule } = await import("../../../src/main/core/rule");

  const [data1, data2] = await Promise.all([rule.load(), rule.load()]);
  const data3 = await rule.load();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("chrome-extension://test/data/rule.json");
  expect(data1).toEqual(RULE_DATA);
  expect(data2).toBe(data1);
  expect(data3).toBe(data1);
});

test("should load a specified rule file", async () => {
  const { default: rule } = await import("../../../src/main/core/rule");
  await rule.load("data/other.json");
  expect(fetchMock).toHaveBeenCalledWith("chrome-extension://test/data/other.json");
});

test("should apply the loaded rules", async () => {
  const { default: rule } = await import("../../../src/main/core/rule");
  await rule.load();

  expect(rule.doLetters(97)).toEqual(3);
  expect(rule.doLetters(98)).toBeUndefined();
  expect(rule.doBase("mice")).toContain("mouse");
  expect(rule.doBase("ran")).toContain("run");
  expect(rule.doSpelling(["colour"])).toEqual(["color"]);
  expect(rule.doPhrase(["a", "b"])).toEqual([]);
  expect(rule.doPronoun(["a", "b"])).toEqual([]);
});

test("doJa should do nothing until Japanese rules are loaded", async () => {
  const { default: rule } = await import("../../../src/main/core/rule");
  expect(rule.doJa("走った")).toBeUndefined();
});
