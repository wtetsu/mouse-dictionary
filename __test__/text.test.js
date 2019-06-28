import testdata from "./testdata";
import text from "../src/lib/text";

beforeAll(() => {
  testdata.load();
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

// test("", () => {
//   expect(text.parseFirstWord("word")).toEqual([]);

//   expect(text.parseFirstWord("WordoneWordtwoWordthree")).toEqual([
//     "Wordone wordone Wordtwo wordtwo Wordthree wordthree",
//     "Wordone",
//     "wordone",
//     "Wordtwo",
//     "wordtwo",
//     "Wordthree",
//     "wordthree",
//     "wordonewordtwowordthree"
//   ]);

//   expect(text.parseFirstWord("wordone-wordtwo-wordthree")).toEqual([
//     "wordone wordtwo wordthree",
//     "wordone",
//     "wordtwo",
//     "wordthree",
//     "-wordthree"
//   ]);

//   expect(text.parseFirstWord("WORDONE_WORDTWO_WORDTHREE")).toEqual([
//     "WORDONE wordone WORDTWO wordtwo WORDTHREE wordthree",
//     "WORDONE",
//     "wordone",
//     "WORDTWO",
//     "wordtwo",
//     "WORDTHREE",
//     "wordthree",
//     "wordone_wordtwo_wordthree",
//     "wordone wordtwo wordthree"
//   ]);

//   expect(text.parseFirstWord("announcements")).toEqual(["announcement"]);
//   expect(text.parseFirstWord("Announcements")).toEqual(["Announcement", "announcements", "announcement"]);

//   expect(text.parseFirstWord("third-party")).toEqual(["third party", "third", "party", "-party"]);
// });

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
