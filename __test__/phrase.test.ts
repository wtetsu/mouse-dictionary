import testdata from "./testdata";
import rule from "../src/main/core/rule";

beforeAll(() => {
  testdata.load();
});

// expect(generateEntries("abc.")).toEqual(expect.arrayContaining(["abc"]));

test("3", () => {
  expect(rule.doPhrase(["a", "b", "c"])).toEqual(
    expect.arrayContaining([
      ["a", "~", "c"], //
      ["a", "__", "c"],
      ["a", "b", "~"],
      ["a", "b", "__"],
      ["a", "c"],
    ])
  );
  expect(rule.doPhrase(["power", "of", "100"])).toEqual(
    expect.arrayContaining([
      ["power", "of", "__"], //
    ])
  );
  expect(rule.doPhrase(["after", "two", "weeks"])).toEqual(
    expect.arrayContaining([
      ["after", "__", "weeks"], //
    ])
  );
  expect(rule.doPhrase(["after", "a", "lot", "of", "weeks"])).toEqual(
    expect.arrayContaining([
      ["after", "__", "weeks"], //
    ])
  );
});

test("4", () => {
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
      ["a", "__", "e"],
      ["a", "b", "~", "d", "e"],
      ["a", "b", "~", "e"],
      ["a", "b", "c", "~", "e"],
      ["a", "A", "d", "B"],
      ["a", "A", "c", "B", "e"],
      ["a", "A", "c", "d", "B"],
      ["a", "b", "A", "d", "B"],
      ["a", "b", "c", "d", "__"],
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
      ["make", "a", "modifications"], //
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

  expect(rule.doPhrase(["make", "some", "announcement"])).toEqual(
    expect.arrayContaining([
      ["make", "an", "announcement"], //
    ])
  );
  expect(rule.doPhrase(["make", "thousands", "of", "announcement"])).toEqual(
    expect.arrayContaining([["make", "an", "announcement"]])
  );
  expect(rule.doPhrase(["make", "a", "lot", "of", "announcement"])).toEqual(
    expect.arrayContaining([["make", "an", "announcement"]])
  );
});
