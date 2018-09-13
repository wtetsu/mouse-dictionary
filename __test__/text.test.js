import text from "../src/text";

test("", () => {
  expect(text.createLookupWords("thousand miles down")).toEqual(["thousand miles down", "thousand miles", "thousand"]);

  expect(text.createLookupWords("american english")).toEqual(["american english", "american"]);
  expect(text.createLookupWords("American English")).toEqual(["American English", "American", "american english", "american"]);

  expect(text.createLookupWords("Announcement of Hoge")).toEqual(["Announcement of Hoge", "Announcement of", "Announcement", "announcement of hoge", "announcement of", "announcement"]);

  expect(text.createLookupWords("wonder if I shall")).toEqual(["wonder if I shall", "wonder if I", "wonder if", "wonder", "wond", "wonder if i shall", "wonder if i"]);
});

test("", () => {
  expect(text.createLookupWords("deal with")).toEqual(["deal with", "deal"]);
  expect(text.createLookupWords("dealt with")).toEqual(["dealt with", "dealt", "deal with", "deal"]);
  expect(text.createLookupWords("dealing with")).toEqual(["dealing with", "dealing", "deal with", "deal"]);

  expect(text.createLookupWords("run with")).toEqual(["run with", "run"]);
  expect(text.createLookupWords("ran with")).toEqual(["ran with", "ran", "run with", "run"]);
  expect(text.createLookupWords("running with")).toEqual(["running with", "running", "run with", "run"]);

  expect(text.createLookupWords("dealt dealt dealt")).toEqual(["dealt dealt dealt", "dealt dealt", "dealt", "deal dealt dealt", "deal dealt", "deal"]);
});

test("", () => {
  expect(text.splitIntoWords("removed from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("removed  from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("あああremoved  fromあいいいい")).toEqual(["removed", "from"]);

  expect(text.splitIntoWords("American English")).toEqual(["American", "English"]);
});

test("", () => {
  expect(text.parseString("word")).toEqual([]);

  expect(text.parseString("WordoneWordtwoWordthree")).toEqual(["Wordone", "wordone", "Wordtwo", "wordtwo", "Wordthree", "wordthree", "wordonewordtwowordthree"]);

  expect(text.parseString("wordone-wordtwo-wordthree")).toEqual(["wordone", "wordtwo", "wordthree"]);

  expect(text.parseString("WORDONE_WORDTWO_WORDTHREE")).toEqual(["WORDONE", "wordone", "WORDTWO", "wordtwo", "WORDTHREE", "wordthree", "wordone_wordtwo_wordthree"]);

  //expect(text.getAllVerbForms("running")).toEqual(["run"]);

  expect(text.parseString("announcements")).toEqual(["announcement"]);
  expect(text.parseString("Announcements")).toEqual(["Announcement", "announcements", "announcement"]);
});

test("", () => {
  expect(text.linkWords([])).toEqual([]);
  expect(text.linkWords(["word0"])).toEqual(["word0"]);
  expect(text.linkWords(["word0", "word1"])).toEqual(["word0 word1", "word0"]);
  expect(text.linkWords(["word0", "word1", "word2"])).toEqual(["word0 word1 word2", "word0 word1", "word0"]);
  expect(text.linkWords(["announcement", "of", "hoge"])).toEqual(["announcement of hoge", "announcement of", "announcement"]);
  expect(text.linkWords(["Announcement", "of", "Hoge"])).toEqual(["Announcement of Hoge", "Announcement of", "Announcement"]);
  expect(text.linkWords(["American", "English"])).toEqual(["American English", "American"]);
  expect(text.linkWords(["dealt", "with"])).toEqual(["dealt with", "dealt", "deal with", "deal"]);
});
