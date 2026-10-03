import { expect, test } from "vitest";
import { reduce } from "../../../src/options/component/organism/ReplaceRuleEditor";

const RULES = [
  { key: "k1", search: "s1", replace: "r1" },
  { key: "k2", search: "s2", replace: "r2" },
];

test("move should swap two rules but keep their keys in place", () => {
  expect(reduce(RULES, { type: "move", payload: { index1: 0, index2: 1 } })).toEqual([
    { key: "k1", search: "s2", replace: "r2" },
    { key: "k2", search: "s1", replace: "r1" },
  ]);
});

test("move should ignore an out-of-range index", () => {
  expect(reduce(RULES, { type: "move", payload: { index1: 1, index2: 2 } })).toEqual(RULES);
  expect(reduce(RULES, { type: "move", payload: { index1: -1, index2: 0 } })).toEqual(RULES);
});
