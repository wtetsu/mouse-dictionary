import text from "../src/text";

test("", () => {
  expect(text.splitIntoWords("removed from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("removed  from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("あああremoved  fromあいいいい")).toEqual(["removed", "from"]);
});

test("", () => {
  expect(text.parseString("word")).toEqual([]);

  expect(text.parseString("WordoneWordtwoWordthree")).toEqual(["WordoneWordtwoWordthree", "Wordone", "wordone", "Wordtwo", "wordtwo", "Wordthree", "wordthree"]);

  expect(text.parseString("wordone-wordtwo-wordthree")).toEqual(["wordonewordtwowordthree", "wordone", "wordtwo", "wordthree"]);

  expect(text.parseString("WORDONE_WORDTWO_WORDTHREE")).toEqual([
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

  expect(text.transformWord("running")).toEqual(["run"]);
});

test("", () => {
  expect(text.transformWord("word")).toEqual([]);
  expect(text.transformWord("Word")).toEqual(["Word"]);
  expect(text.transformWord("studied")).toEqual(["study", "studi", "studie"]);
  expect(text.transformWord("studies")).toEqual(["study", "studie", "studi"]);
  expect(text.transformWord("player")).toEqual(["play"]);
  expect(text.transformWord("supplier")).toEqual(["supply", "suppli"]);
  expect(text.transformWord("happiest")).toEqual(["happy", "happi"]);
  expect(text.transformWord("runs")).toEqual(["run"]);
  expect(text.transformWord("running")).toEqual(["run"]);
  expect(text.transformWord("playing")).toEqual(["play"]);
});

test("", () => {
  expect(text.linkWords([])).toEqual([]);
  expect(text.linkWords(["word0"])).toEqual(["word0"]);
  expect(text.linkWords(["word0", "word1"])).toEqual(["word0 word1", "word0"]);
  expect(text.linkWords(["word0", "word1", "word2"])).toEqual(["word0 word1 word2", "word0 word1", "word0"]);
});
