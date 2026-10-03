import { expect, test } from "vitest";
import trailing from "../../../src/main/lib/trailing";

const RULES = [
  [{ search: "ies", new: "y" }],
  [
    { search: "ing", new: "" },
    { search: "ing", new: "e" },
  ],
];

test("should replace trailing strings by rules", () => {
  expect(trailing.tryToReplaceTrailingStrings("studies", RULES)).toEqual(["study"]);
  expect(trailing.tryToReplaceTrailingStrings("making", RULES)).toEqual(["mak"]);
  expect(trailing.tryToReplaceTrailingStrings("dog", RULES)).toEqual([]);
});

test("should try the next candidate when a result is shorter than minLength", () => {
  expect(trailing.tryToReplaceTrailingStrings("going", RULES)).toEqual(["goe"]);
  expect(trailing.tryToReplaceTrailingStrings("going", RULES, 2)).toEqual(["go"]);
});
