import text from "../src/lib/text";

test("", () => {
  expect(text.createLookupWords("Test")).toEqual(["Test", "test"]);
});

test("", () => {
  let r;
  r = text.createLookupWords("ladies-in-waiting");
  expect(r.includes("ladies-in-waiting")).toBeTruthy();
  expect(r.includes("lady-in-waiting")).toBeTruthy();

  r = text.createLookupWords("stands-by");
  expect(r.includes("stands-by")).toBeTruthy();
  expect(r.includes("stand-by")).toBeTruthy();
});

test("", () => {
  expect(text.createLookupWords("thousand miles down")).toEqual([
    "thousand miles down",
    "thousand miles",
    "thousand",
    "thousand ~ down",
    "thousand down",
    "thousand mile"
  ]);

  expect(text.createLookupWords("american english")).toEqual(["american english", "american"]);
  expect(text.createLookupWords("American English")).toEqual([
    "American English",
    "American",
    "american english",
    "american"
  ]);

  expect(text.createLookupWords("Announcement of Hoge")).toEqual([
    "Announcement of Hoge",
    "Announcement of",
    "Announcement",
    "Announcement ~ Hoge",
    "Announcement Hoge",
    "announcement of hoge",
    "announcement of",
    "announcement",
    "announcement ~ hoge",
    "announcement hoge"
  ]);

  expect(text.createLookupWords("wonder if I shall")).toEqual([
    "wonder if I shall",
    "wonder if I",
    "wonder if",
    "wonder",
    "wonder ~ I",
    "wonder I",
    "wonder if ~ shall",
    "wonder ~ I shall",
    "wonder A I B",
    "wonder ~ shall",
    "wonder I shall",
    "wonder shall",
    "wond",
    "wonder if i shall",
    "wonder if i",
    "wonder ~ i",
    "wonder i",
    "wonder ~ i shall",
    "wonder A i B",
    "wonder i shall"
  ]);
});

test("", () => {
  expect(text.createLookupWords("blue-gray")).toEqual(["blue-gray", "blue gray", "blue", "gray", "-gray", "bluegray"]);
  expect(text.createLookupWords("third-party")).toEqual([
    "third-party",
    "third party",
    "third",
    "party",
    "-party",
    "thirdparty"
  ]);

  // non-breaking hyphen(U+2011)
  expect(text.createLookupWords("blue‑gray")).toEqual(["blue-gray", "blue gray", "blue", "gray", "-gray", "bluegray"]);
  expect(text.createLookupWords("third‑party")).toEqual([
    "third-party",
    "third party",
    "third",
    "party",
    "-party",
    "thirdparty"
  ]);
});

test("", () => {
  expect(text.createLookupWords("folk tales")).toEqual(["folk tales", "folk", "folk tale"]);
});

test("", () => {
  expect(text.createLookupWords("deal with")).toEqual(["deal with", "deal"]);
  expect(text.createLookupWords("dealt with")).toEqual(["dealt with", "dealt", "deal with", "deal"]);
  expect(text.createLookupWords("dealing with")).toEqual([
    "dealing with",
    "dealing",
    "deal with",
    "deal",
    "deale with",
    "deale"
  ]);

  expect(text.createLookupWords("run with")).toEqual(["run with", "run"]);
  expect(text.createLookupWords("ran with")).toEqual(["ran with", "ran", "run with", "run"]);
  expect(text.createLookupWords("running with")).toEqual([
    "running with",
    "running",
    "run with",
    "run",
    "runne with",
    "runne"
  ]);

  expect(text.createLookupWords("dealt dealt dealt")).toEqual([
    "dealt dealt dealt",
    "dealt dealt",
    "dealt",
    "deal dealt dealt",
    "deal dealt",
    "deal",
    "dealt ~ dealt",
    "deal ~ dealt"
  ]);
});

test("", () => {
  expect(text.createLookupWords("cut back")).toEqual(["cut back", "cut"]);
  expect(text.createLookupWords("cutting back")).toEqual([
    "cutting back",
    "cutting",
    "cut back",
    "cut",
    "cutte back",
    "cutte"
  ]);

  expect(text.createLookupWords("die out")).toEqual(["die out", "die"]);
  expect(text.createLookupWords("dying out")).toEqual(["dying out", "dying", "die out", "die"]);

  expect(text.createLookupWords("play with")).toEqual(["play with", "play"]);
  expect(text.createLookupWords("played with")).toEqual([
    "played with",
    "played",
    "play with",
    "play",
    "playe with",
    "playe"
  ]);

  expect(text.createLookupWords("pop up")).toEqual(["pop up", "pop"]);
  expect(text.createLookupWords("popped up")).toEqual([
    "popped up",
    "popped",
    "pop up",
    "pop",
    "popp up",
    "popp",
    "poppe up",
    "poppe"
  ]);
});

test("", () => {
  expect(text.splitIntoWords("removed from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("removed  from")).toEqual(["removed", "from"]);
  expect(text.splitIntoWords("あああremoved  fromあいいいい")).toEqual(["removed", "from"]);

  expect(text.splitIntoWords("American English")).toEqual(["American", "English"]);
  expect(text.splitIntoWords(".American English.")).toEqual(["American", "English"]);

  expect(text.splitIntoWords("American\rEnglish")).toEqual(["American", "English"]);
  expect(text.splitIntoWords("American\nEnglish")).toEqual(["American", "English"]);
  expect(text.splitIntoWords("American\r\nEnglish")).toEqual(["American", "English"]);
  expect(text.splitIntoWords("American.English")).toEqual(["American", "English"]);
  expect(text.splitIntoWords("American,English")).toEqual(["American", "English"]);
  expect(text.splitIntoWords("American-English")).toEqual(["American-English"]);
  expect(text.splitIntoWords("American_English")).toEqual(["American_English"]);
});

test("", () => {
  expect(text.createLookupWords("aaa_bbb")).toEqual(["aaa_bbb", "aaa bbb", "aaa", "bbb"]);
  expect(text.createLookupWords("worker_processes")).toEqual([
    "worker_processes",
    "worker_process",
    "worker_processe",
    "worker_processis",
    "worker processes",
    "worker",
    "processes",
    "process",
    "processe",
    "processis",
    "worker_proces",
    "worker_processi",
    "worker processe",
    "work",
    "proces",
    "processi"
  ]);
});

test("", () => {
  expect(text.createLookupWords("on one's own")).toEqual([
    "on one's own",
    "on one's",
    "on",
    //"on one",
    "on ~ own",
    "on own",
    "on one"
  ]);
  expect(text.createLookupWords("on his own")).toEqual([
    "on his own",
    "on his",
    "on",
    "on ~ own",
    "on own",
    "on hi",
    "on one's own",
    "on one's",
    "on one",
    "on someone's own",
    "on someone's",
    "on someone"
  ]);

  expect(text.createLookupWords("his only son")).toEqual([
    "his only son",
    "his only",
    "his",
    "his ~ son",
    "his son",
    "one's only son",
    "one's only",
    "one' only son",
    "one' only",
    "one's ~ son",
    "one's son",
    "one' ~ son",
    "one' son",
    "someone's only son",
    "someone's only",
    "someone' only son",
    "someone' only",
    "someone's ~ son",
    "someone's son",
    "someone' ~ son",
    "someone' son"
  ]);

  expect(text.createLookupWords("Senete's")).toEqual(["Senete's", "Senete'", "Senete", "senete's", "senete'", "senete"]);

  expect(text.createLookupWords("by oneself")).toEqual(["by oneself", "by"]);
  expect(text.createLookupWords("by myself")).toEqual(["by myself", "by", "by oneself"]);

  expect(text.createLookupWords("brush one's dog")).toEqual([
    "brush one's dog",
    "brush one's",
    "brush",
    "brush ~ dog",
    "brush dog",
    "brush one"
  ]);
  expect(text.createLookupWords("brush Taro's dog")).toEqual([
    "brush Taro's dog",
    "brush Taro's",
    "brush",
    "brush ~ dog",
    "brush dog",
    "brush Taro",
    "brush one's dog",
    "brush one's",
    "brush one",
    "brush someone's dog",
    "brush someone's",
    "brush someone",
    "brush taro's dog",
    "brush taro's",
    "brush taro"
  ]);
});

test("", () => {
  expect(text.parseFirstWord("word")).toEqual([]);

  expect(text.parseFirstWord("WordoneWordtwoWordthree")).toEqual([
    "Wordone wordone Wordtwo wordtwo Wordthree wordthree",
    "Wordone",
    "wordone",
    "Wordtwo",
    "wordtwo",
    "Wordthree",
    "wordthree",
    "wordonewordtwowordthree"
  ]);

  expect(text.parseFirstWord("wordone-wordtwo-wordthree")).toEqual([
    "wordone wordtwo wordthree",
    "wordone",
    "wordtwo",
    "wordthree",
    "-wordthree"
  ]);

  expect(text.parseFirstWord("WORDONE_WORDTWO_WORDTHREE")).toEqual([
    "WORDONE wordone WORDTWO wordtwo WORDTHREE wordthree",
    "WORDONE",
    "wordone",
    "WORDTWO",
    "wordtwo",
    "WORDTHREE",
    "wordthree",
    "wordone_wordtwo_wordthree",
    "wordone wordtwo wordthree"
  ]);

  expect(text.parseFirstWord("announcements")).toEqual(["announcement"]);
  expect(text.parseFirstWord("Announcements")).toEqual(["Announcement", "announcements", "announcement"]);

  expect(text.parseFirstWord("third-party")).toEqual(["third party", "third", "party", "-party"]);
});

test("", () => {
  expect(text.linkWords([])).toEqual([]);
  expect(text.linkWords(["word0"])).toEqual(["word0"]);
  expect(text.linkWords(["word0", "word1"])).toEqual(["word0 word1", "word0"]);
  expect(text.linkWords(["word0", "word1", "word2"])).toEqual([
    "word0 word1 word2",
    "word0 word1",
    "word0",
    "word0 ~ word2",
    "word0 word2"
  ]);
  expect(text.linkWords(["announcement", "of", "hoge"])).toEqual([
    "announcement of hoge",
    "announcement of",
    "announcement",
    "announcement ~ hoge",
    "announcement hoge"
  ]);
  expect(text.linkWords(["Announcement", "of", "Hoge"])).toEqual([
    "Announcement of Hoge",
    "Announcement of",
    "Announcement",
    "Announcement ~ Hoge",
    "Announcement Hoge"
  ]);
  expect(text.linkWords(["American", "English"])).toEqual(["American English", "American"]);
  expect(text.linkWords(["dealt", "with"])).toEqual(["dealt with", "dealt", "deal with", "deal"]);
});

test("", () => {
  expect(text.splitString("camelCase")).toEqual(["camel", "Case", "case"]);
  expect(text.splitString("PascalCase")).toEqual(["Pascal", "pascal", "Case", "case"]);
  expect(text.splitString("snake_case")).toEqual(["snake", "case"]);
  expect(text.splitString("UPPER_SNAKE_CASE")).toEqual(["UPPER", "upper", "SNAKE", "snake", "CASE", "case"]);
});

test("", () => {
  // normal hyphen
  expect(text.dealWithHyphens("abc")).toEqual("abc");
  expect(text.dealWithHyphens("abc-efg")).toEqual("abc-efg");
  expect(text.dealWithHyphens("abc-efg-hij")).toEqual("abc-efg-hij");
  expect(text.dealWithHyphens("abc-\nefg")).toEqual("abcefg");
  expect(text.dealWithHyphens("abc efg hij")).toEqual("abc efg hij");
  expect(text.dealWithHyphens("abc-\nefg hij")).toEqual("abcefg hij");
  expect(text.dealWithHyphens("abc-\nefg hij-\nklm")).toEqual("abcefg hijklm");
  expect(text.dealWithHyphens("aaa-\nbbb ccc-@*+ddd")).toEqual("aaabbb cccddd");
  expect(text.dealWithHyphens("aaa-")).toEqual("aaa-");
  expect(text.dealWithHyphens("emo- ↵tional")).toEqual("emotional");
  expect(text.dealWithHyphens("emo- @*tional")).toEqual("emotional");

  // non-breaking hyphen(U+2011)
  expect(text.dealWithHyphens("abc")).toEqual("abc");
  expect(text.dealWithHyphens("abc‑efg")).toEqual("abc-efg");
  expect(text.dealWithHyphens("abc‑efg‑hij")).toEqual("abc-efg-hij");
  expect(text.dealWithHyphens("abc‑\nefg")).toEqual("abcefg");
  expect(text.dealWithHyphens("abc efg hij")).toEqual("abc efg hij");
  expect(text.dealWithHyphens("abc‑\nefg hij")).toEqual("abcefg hij");
  expect(text.dealWithHyphens("abc‑\nefg hij‑\nklm")).toEqual("abcefg hijklm");
  expect(text.dealWithHyphens("aaa‑\nbbb ccc‑@*+ddd")).toEqual("aaabbb cccddd");
  expect(text.dealWithHyphens("aaa‑")).toEqual("aaa-");
  expect(text.dealWithHyphens("emo‑ ↵tional")).toEqual("emotional");
  expect(text.dealWithHyphens("emo‑ @*tional")).toEqual("emotional");
});
