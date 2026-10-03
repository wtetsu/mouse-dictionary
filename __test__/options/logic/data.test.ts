import { expect, test } from "vitest";
import defaultsettings from "../../../src/main/settings";
import * as data from "../../../src/options/logic/data";
import type { MouseDictionarySettings } from "../../../src/options/types";

test("preProcessSettings and postProcessSettings should correctly process settings", () => {
  const d1 = defaultsettings as MouseDictionarySettings;
  const d2 = data.preProcessSettings(d1);
  const d3 = data.postProcessSettings(d1);
  expect(false).toEqual(d1 === d2);
  expect(false).toEqual(d2 === d3);

  expect(0).toEqual(d1.replaceRules.filter((r) => r.key).length);
  expect(d1.replaceRules.length).toEqual(d1.replaceRules.length);
  expect(d2.replaceRules.length).toEqual(d2.replaceRules.filter((r) => r.key).length);
  expect(0).toEqual(d3.replaceRules.filter((r) => r.key).length);

  expect(JSON.stringify(d1)).toEqual(JSON.stringify(d3));
});

test("sanitizeNumbers should replace NaN and negative integers with 0", () => {
  const patch = { a: Number.NaN, b: -1, c: 5, d: -1.5, e: "x", f: true };
  const result = data.sanitizeNumbers(patch);
  expect(result).toEqual({ a: 0, b: 0, c: 5, d: -1.5, e: "x", f: true });
  expect(patch.a).toBeNaN();

  const valid = { a: 1 };
  expect(data.sanitizeNumbers(valid)).toBe(valid);
});
