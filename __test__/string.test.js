import string from "../src/string";

test("", () => {
  // TODO

  expect(string.parseString("word")).toEqual([]);

  expect(string.parseString("WordoneWordtwoWordthree")).toEqual([
    "WordoneWordtwoWordthree",
    "Wordone",
    "wordone",
    "Wordtwo",
    "wordtwo",
    "Wordthree",
    "wordthree"
  ]);

  expect(string.parseString("wordone-wordtwo-wordthree")).toEqual([
    "wordonewordtwowordthree",
    "wordone",
    "wordtwo",
    "wordthree"
  ]);

  expect(string.parseString("WORDONE_WORDTWO_WORDTHREE")).toEqual([
    "WORDONE_WORDTWO_WORDTHREE",
    "WORDONEWORDTWOWORDTHREE",
    "WORDONEWORDTWOWORDTHREE",
    "WORDONE",
    "wordone",
    "WORDTWO",
    "wordtwo",
    "WORDTHREE",
    "wordthree"
  ]);

  expect(string.transformWord("running")).toEqual(["run"]);
});

test("", () => {
  expect(string.transformWord("word")).toEqual([]);
  expect(string.transformWord("Word")).toEqual(["Word"]);
  expect(string.transformWord("studied")).toEqual(["study", "studi", "studie"]);
  expect(string.transformWord("studies")).toEqual(["study", "studie", "studi"]);
  expect(string.transformWord("player")).toEqual(["play"]);
  expect(string.transformWord("supplier")).toEqual(["supply", "suppli"]);
  expect(string.transformWord("happiest")).toEqual(["happy", "happi"]);
  expect(string.transformWord("runs")).toEqual(["run"]);
  expect(string.transformWord("running")).toEqual(["run"]);
  expect(string.transformWord("playing")).toEqual(["play"]);
});

test("", () => {
  expect(string.linkWords([])).toEqual([]);
  expect(string.linkWords(["word0"])).toEqual(["word0"]);
  expect(string.linkWords(["word0", "word1"])).toEqual([
    "word0 word1",
    "word0"
  ]);
  expect(string.linkWords(["word0", "word1", "word2"])).toEqual([
    "word0 word1 word2",
    "word0 word1",
    "word0"
  ]);
});
