import testdata from "./testdata";
import rule from "../src/main/rule";

beforeAll(() => {
  testdata.load();
});

// expect(generateEntries("abc.")).toEqual(expect.arrayContaining(["abc"]));

test("3", () => {
  expect(rule.doPhrase(["a", "b", "c"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c"], //
      ["a", "c"]
    ])
  );
});

test("4", () => {
  expect(rule.doPhrase(["a", "b", "c", "d"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c", "d"], //
      ["a", "b", "~", "d"],
      ["a", "~", "d"],
      ["a", "A", "c", "B"],
      ["a", "d"]
    ])
  );
});

test("5", () => {
  expect(rule.doPhrase(["a", "b", "c", "d", "e"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c", "d", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "~", "d", "e"],
      ["a", "~", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "~", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "A", "d", "B"],
      ["a", "A", "c", "B", "e"],
      ["a", "A", "c", "d", "B"],
      ["a", "b", "A", "d", "B"]
    ])
  );
});

test("20", () => {
  expect(
    rule.doPhrase(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"])
  ).toEqual([]);
});

test("", () => {
  expect(rule.doPhrase(["make", "some", "modifications"])).toEqual(
    expect.arrayContaining([
      ["make", "a", "modifications"] //
    ])
  );
  expect(rule.doPhrase(["make", "thousands", "of", "modifications"])).toEqual(
    expect.arrayContaining([["make", "a", "modifications"]])
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "modifications"])).toEqual(
    expect.arrayContaining([["make", "a", "modifications"]])
  );
  expect(rule.doPhrase(["make", "some", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]])
  );
  expect(rule.doPhrase(["make", "thousands", "of", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]])
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "careful", "selections"])).toEqual(
    expect.arrayContaining([["make", "a", "careful", "selections"]])
  );
});

test("", () => {
  expect(rule.doPhrase(["two", "years", "ago"])).toEqual(
    expect.arrayContaining([
      ["__", "years", "ago"] //
    ])
  );
  expect(rule.doPhrase(["after", "two", "weeks"])).toEqual(
    expect.arrayContaining([
      ["after", "__", "weeks"] //
    ])
  );
});
