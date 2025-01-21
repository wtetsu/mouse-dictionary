import testdata from "../../testdata";
import text from "../../../src/main/lib/text";
import rule from "../../../src/main/core/rule";

beforeAll(() => {
  testdata.load();
});

test("splitIntoWords function test", () => {
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

test("linkWords function test", () => {
  testList(text.linkWords([]), []);
  testList(text.linkWords(["word0"]), ["word0"]);
  testList(text.linkWords(["word0", "word1"]), ["word0 word1", "word0"]);
  testList(text.linkWords(["word0", "word1", "word2"]), ["word0 word1 word2", "word0 word1", "word0", "word0 ~ word2", "word0 word2"]);
  testList(text.linkWords(["announcement", "of", "hoge"]), ["announcement of hoge", "announcement of", "announcement", "announcement ~ hoge", "announcement hoge"]);
  testList(text.linkWords(["Announcement", "of", "Hoge"]), ["Announcement of Hoge", "Announcement of", "Announcement", "Announcement ~ Hoge", "Announcement Hoge"]);
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

test("splitString function test", () => {
  expect(text.splitString("word", 2)).toEqual([]);
  expect(text.splitString("camelCase", 2)).toEqual([
    "camel", //
    "Case",
    "case",
  ]);
  expect(text.splitString("PascalCase", 2)).toEqual([
    "Pascal", //
    "pascal",
    "Case",
    "case",
  ]);
  expect(text.splitString("snake_case", 2)).toEqual([
    "snake", //
    "case",
  ]);
  expect(text.splitString("UPPER_SNAKE_CASE", 2)).toEqual([
    "UPPER", //
    "upper",
    "SNAKE",
    "snake",
    "CASE",
    "case",
  ]);

  expect(text.splitString("Material-UI", 2)).toEqual([
    "Material", //
    "material",
    "UI",
    "ui",
  ]);

  expect(text.splitString("Super_HTML-MASTER", 2)).toEqual([
    "Super", //
    "super",
    "HTML",
    "html",
    "MASTER",
    "master",
  ]);

  expect(text.splitString("this_is_a_pen", 2)).toEqual([
    "this", //
    "is",
    "pen",
  ]);

  expect(text.splitString("this_is_a_pen", 1)).toEqual([
    "this", //
    "is",
    "a",
    "pen",
  ]);
});

test("dealWithHyphens function test", () => {
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

test("extractRefPatternsInText basic cases", () => {
  const e = text.extractRefPatternsInText;

  expect(e("")).toEqual([]);
  expect(e("This is a test.")).toEqual([]);
  expect(e("The disease <→actinobacillosis> occurred.")).toEqual(["actinobacillosis"]);
  expect(e("Find <→pattern1> and <→pattern2> in text.")).toEqual(["pattern1", "pattern2"]);
  expect(e("Caused by ＝fungus.")).toEqual(["fungus"]);
  expect(e("Affected by ＝bacteria and ＝virus.")).toEqual(["bacteria and", "virus"]);
  expect(e("Found <→object> and caused by ＝reason.")).toEqual(["object", "reason"]);
});

test("extractRefPatternsInText complex cases", () => {
  const e = text.extractRefPatternsInText;

  expect(e("Nested <→outer<→inner>> pattern.")).toEqual(["outer<→inner"]);
  expect(e("Check ＝valid valid.")).toEqual(["valid valid"]);
  expect(e("Found ＝some pattern.")).toEqual(["some pattern"]);
  expect(e("Special <→characters like @# > are skipped.")).toEqual(["characters like @#"]);
  expect(e("Example with trailing ＝word")).toEqual(["word"]);
  expect(e("Example with trailing ＝word.")).toEqual(["word"]);
  expect(e("Unfinished <→pattern left open.")).toEqual([]);
  expect(e("Check this ＝!invalid.")).toEqual([]);
});

test("extractRefPatternsInText edge cases", () => {
  const e = text.extractRefPatternsInText;

  expect(e("Duplicate <→same> and <→same> patterns.")).toEqual(["same", "same"]);
  expect(e("Repeated ＝test & ＝test.")).toEqual(["test", "test"]);
  expect(e("Upper ＝Case & ＝case.")).toEqual(["Case", "case"]);
});

test("extractRefPatternsInText tricky cases", () => {
  const e = text.extractRefPatternsInText;

  expect(e("<→open and =wrongly formatted>")).toEqual(["open and =wrongly formatted"]);
  expect(e("Mismatched <→open and no closing")).toEqual([]);
  expect(e("Nested weirdness <→<→inner> outer>>")).toEqual(["<→inner"]);

  expect(e("<→special@chars!>")).toEqual(["special@chars!"]);
  expect(e("＝including 123 numbers ")).toEqual(["including 123 numbers"]);
  expect(e("Spaces <→ surrounded by > extra")).toEqual(["surrounded by"]);
  expect(e("＝   leading spaces")).toEqual(["leading spaces"]);
  expect(e("＝ spaces  in  the  middle  are  kept ")).toEqual(["spaces  in  the  middle  are  kept"]);

  expect(e("Non-ASCII <→あいうえお>")).toEqual(["あいうえお"]);
  expect(e("Mixing ASCII and ＝日本語 patterns")).toEqual([]);

  expect(e(`<→${"x".repeat(1000)}>`)).toEqual([`${"x".repeat(1000)}`]);
  expect(e(`＝${"y".repeat(1000)} with trailing space`)).toEqual([`${"y".repeat(1000)} with trailing space`]);

  expect(e("＝pattern with trailing: colon")).toEqual(["pattern with trailing"]);
  expect(e("<→pattern ending with punctuation.")).toEqual([]);
});
