import { beforeAll, expect, test } from "vitest";
import rule from "../../../src/main/core/rule";
import testdata from "../../testdata";

beforeAll(() => {
  testdata.load();
});

// expect(generateEntries("abc.")).toEqual(expect.arrayContaining(["abc"]));

test("should handle simple three-word phrases", () => {
  expect(rule.doPhrase(["a", "b", "c"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c"], //
      ["a", "__", "c"],
      ["a", "b", "~"],
      ["a", "b", "__"],
      ["a", "c"],
    ]),
  );
  expect(rule.doPhrase(["power", "of", "100"])).toEqual(
    expect.arrayContaining([
      ["power", "of", "__"], //
    ]),
  );
  expect(rule.doPhrase(["after", "two", "weeks"])).toEqual(
    expect.arrayContaining([
      ["after", "__", "weeks"], //
    ]),
  );
  expect(rule.doPhrase(["after", "a", "lot", "of", "weeks"])).toEqual(
    expect.arrayContaining([
      ["after", "__", "weeks"], //
    ]),
  );
});

test("should handle four-word phrases", () => {
  expect(rule.doPhrase(["a", "b", "c", "d"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c", "d"], //
      ["a", "b", "~", "d"],
      ["a", "~", "d"],
      ["a", "__", "c", "d"], //
      ["a", "b", "__", "d"],
      ["a", "b", "c", "~"],
      ["a", "b", "c", "__"],
      ["a", "__", "d"],
      ["a", "A", "c", "B"],
      ["a", "d"],
    ]),
  );
});

test("should handle five-word phrases", () => {
  expect(rule.doPhrase(["a", "b", "c", "d", "e"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c", "d", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "~", "d", "e"],
      ["a", "~", "e"],
      ["a", "__", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "~", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "A", "d", "B"],
      ["a", "A", "c", "B", "e"],
      ["a", "A", "c", "d", "B"],
      ["a", "b", "A", "d", "B"],
      ["a", "b", "c", "d", "__"],
    ]),
  );
});

test("should handle long phrases with no modifications", () => {
  expect(
    rule.doPhrase(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"]),
  ).toEqual([]);
});

test("should handle specific phrase modifications", () => {
  expect(rule.doPhrase(["make", "some", "modifications"])).toEqual(
    expect.arrayContaining([
      ["make", "a", "modifications"], //
    ]),
  );
  expect(rule.doPhrase(["make", "thousands", "of", "modifications"])).toEqual(
    expect.arrayContaining([["make", "a", "modifications"]]),
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "modifications"])).toEqual(
    expect.arrayContaining([["make", "a", "modifications"]]),
  );
  expect(rule.doPhrase(["make", "some", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]]),
  );
  expect(rule.doPhrase(["make", "thousands", "of", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]]),
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]]),
  );

  expect(rule.doPhrase(["make", "some", "announcement"])).toEqual(
    expect.arrayContaining([
      ["make", "an", "announcement"], //
    ]),
  );
  expect(rule.doPhrase(["make", "thousands", "of", "announcement"])).toEqual(
    expect.arrayContaining([["make", "an", "announcement"]]),
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "announcement"])).toEqual(
    expect.arrayContaining([["make", "an", "announcement"]]),
  );
});
