import testdata from "./testdata";
import text from "../src/main/lib/text";
import rule from "../src/main/core/rule";

beforeAll(() => {
  testdata.load();
});

test("", () => {
  const splitIntoWords = (str) => {
    return text.splitIntoWords(str, (ch) => rule.doLetters(ch) === 3);
  };

  expect(splitIntoWords("removed from")).toEqual(["removed", "from"]);
  expect(splitIntoWords("removed  from")).toEqual(["removed", "from"]);
  expect(splitIntoWords("あああremoved  fromあいいいい")).toEqual(["removed", "from"]);

  expect(splitIntoWords("American English")).toEqual(["American", "English"]);
  expect(splitIntoWords(".American English.")).toEqual(["American", "English"]);

  expect(splitIntoWords("American\rEnglish")).toEqual(["American", "English"]);
  expect(splitIntoWords("American\nEnglish")).toEqual(["American", "English"]);
  expect(splitIntoWords("American\r\nEnglish")).toEqual(["American", "English"]);
  expect(splitIntoWords("American.English")).toEqual(["American", "English"]);
  expect(splitIntoWords("American,English")).toEqual(["American", "English"]);
  expect(splitIntoWords("American-English")).toEqual(["American-English"]);
  expect(splitIntoWords("American_English")).toEqual(["American_English"]);
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
  testList(text.linkWords([]), []);
  testList(text.linkWords(["word0"]), ["word0"]);
  testList(text.linkWords(["word0", "word1"]), ["word0 word1", "word0"]);
  testList(text.linkWords(["word0", "word1", "word2"]), [
    "word0 word1 word2",
    "word0 word1",
    "word0",
    "word0 ~ word2",
    "word0 word2",
  ]);
  testList(text.linkWords(["announcement", "of", "hoge"]), [
    "announcement of hoge",
    "announcement of",
    "announcement",
    "announcement ~ hoge",
    "announcement hoge",
  ]);
  testList(text.linkWords(["Announcement", "of", "Hoge"]), [
    "Announcement of Hoge",
    "Announcement of",
    "Announcement",
    "Announcement ~ Hoge",
    "Announcement Hoge",
  ]);
  testList(text.linkWords(["American", "English"]), [
    "American English", //
    "American",
  ]);
  testList(text.linkWords(["dealt", "with"]), [
    "dealt with", //
    "dealt",
    "deal with",
    "deal",
  ]);
});

test("", () => {
  expect(text.splitString("camelCase")).toEqual([
    "camel", //
    "Case",
    "case",
  ]);
  expect(text.splitString("PascalCase")).toEqual([
    "Pascal", //
    "pascal",
    "Case",
    "case",
  ]);
  expect(text.splitString("snake_case")).toEqual([
    "snake", //
    "case",
  ]);
  expect(text.splitString("UPPER_SNAKE_CASE")).toEqual([
    "UPPER", //
    "upper",
    "SNAKE",
    "snake",
    "CASE",
    "case",
  ]);
});

test("", () => {
  const dealWithHyphens = (str) => {
    return text.dealWithHyphens(str, rule.doLetters);
  };

  expect(dealWithHyphens("")).toEqual("");

  // normal hyphen
  expect(dealWithHyphens("abc")).toEqual("abc");
  expect(dealWithHyphens("abc-efg")).toEqual("abc-efg");
  expect(dealWithHyphens("abc-efg-hij")).toEqual("abc-efg-hij");
  expect(dealWithHyphens("abc-\nefg")).toEqual("abcefg");
  expect(dealWithHyphens("abc efg hij")).toEqual("abc efg hij");
  expect(dealWithHyphens("abc-\nefg hij")).toEqual("abcefg hij");
  expect(dealWithHyphens("abc-\nefg hij-\nklm")).toEqual("abcefg hijklm");
  expect(dealWithHyphens("aaa-\nbbb ccc-@*+ddd")).toEqual("aaabbb cccddd");
  expect(dealWithHyphens("aaa-")).toEqual("aaa-");
  expect(dealWithHyphens("emo- ↵tional")).toEqual("emotional");
  expect(dealWithHyphens("emo- @*tional")).toEqual("emotional");

  // non-breaking hyphen(U+2011)
  expect(dealWithHyphens("abc")).toEqual("abc");
  expect(dealWithHyphens("abc‑efg")).toEqual("abc-efg");
  expect(dealWithHyphens("abc‑efg‑hij")).toEqual("abc-efg-hij");
  expect(dealWithHyphens("abc‑\nefg")).toEqual("abcefg");
  expect(dealWithHyphens("abc efg hij")).toEqual("abc efg hij");
  expect(dealWithHyphens("abc‑\nefg hij")).toEqual("abcefg hij");
  expect(dealWithHyphens("abc‑\nefg hij‑\nklm")).toEqual("abcefg hijklm");
  expect(dealWithHyphens("aaa‑\nbbb ccc‑@*+ddd")).toEqual("aaabbb cccddd");
  expect(dealWithHyphens("aaa‑")).toEqual("aaa-");
  expect(dealWithHyphens("emo‑ ↵tional")).toEqual("emotional");
  expect(dealWithHyphens("emo‑ @*tional")).toEqual("emotional");
});

const testList = (actualList, expectedList) => {
  for (let i = 0; i < expectedList.length; i++) {
    const expected = expectedList[i];
    expect(actualList.includes(expected)).toBeTruthy();
  }
};
