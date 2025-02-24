import { beforeAll, expect, test } from "vitest";
import createLookupWordsEn from "../../../src/main/core/entry/en";
import createLookupWordsJa from "../../../src/main/core/entry/ja";
import testdata from "../../testdata";

beforeAll(() => {
  testdata.load();
});

test("Test simple word", () => {
  expect(createLookupWordsEn("Test")).toEqual(expect.arrayContaining(["Test", "test"]));
});

test("Test hyphenated words", () => {
  let r: string[];
  r = createLookupWordsEn("ladies-in-waiting");
  expect(r.includes("ladies-in-waiting")).toBeTruthy();
  expect(r.includes("lady-in-waiting")).toBeTruthy();

  r = createLookupWordsEn("stands-by");
  expect(r.includes("stands-by")).toBeTruthy();
  expect(r.includes("stand-by")).toBeTruthy();
});

test("Test phrases and capitalization", () => {
  expect(createLookupWordsEn("thousand miles down")).toEqual(
    expect.arrayContaining([
      "thousand miles down",
      "thousand miles",
      "thousand",
      "thousand ~ down",
      "thousand down",
      "thousand mile",
    ]),
  );

  expect(createLookupWordsEn("american english")).toEqual(expect.arrayContaining(["american english", "american"]));
  expect(createLookupWordsEn("American English")).toEqual(
    expect.arrayContaining(["American English", "American", "american english", "american"]),
  );

  expect(createLookupWordsEn("Announcement of Hoge")).toEqual(
    expect.arrayContaining([
      "Announcement of Hoge",
      "Announcement of",
      "Announcement",
      "announcement ~ hoge",
      "announcement hoge",
      "announcement of hoge",
      "announcement of",
      "announcement",
      "announcement ~ hoge",
      "announcement hoge",
    ]),
  );

  expect(createLookupWordsEn("wonder if I shall")).toEqual(
    expect.arrayContaining([
      "wonder if i shall",
      "wonder if i",
      "wonder if",
      "wonder",
      "wonder ~ i",
      "wonder i",
      "wonder if ~ shall",
      "wonder ~ i shall",
      "wonder A i B",
      "wonder ~ shall",
      "wonder i shall",
      "wonder if shall",
      "wonder shall",
      "wond",
      "wonder if i shall",
      "wonder if i",
      "wonder ~ i",
      "wonder i",
      "wonder ~ i shall",
      "wonder A i B",
      "wonder i shall",
    ]),
  );

  expect(createLookupWordsEn("in my favor")).toEqual(expect.arrayContaining(["in someone's favor"]));

  expect(createLookupWordsEn("in my best favor")).toEqual(expect.arrayContaining(["in someone's favor"]));
});

test("Test hyphenated and non-breaking hyphen words", () => {
  expect(createLookupWordsEn("blue-gray")).toEqual(
    expect.arrayContaining(["blue-gray", "blue gray", "blue", "gray", "blue-", "-gray", "bluegray"]),
  );

  expect(createLookupWordsEn("third-party")).toEqual(
    expect.arrayContaining(["third-party", "third party", "third", "party", "third-", "-party", "thirdparty"]),
  );

  // non-breaking hyphen(U+2011)
  expect(createLookupWordsEn("blue‑gray")).toEqual(
    expect.arrayContaining([
      "blue-gray", //
      "blue gray",
      "blue",
      "gray",
      "blue-",
      "-gray",
      "bluegray",
    ]),
  );

  expect(createLookupWordsEn("third‑party")).toEqual(
    expect.arrayContaining(["third-party", "third party", "third", "party", "third-", "-party", "thirdparty"]),
  );
});

test("Test compound words", () => {
  expect(createLookupWordsEn("folk tales")).toEqual(
    expect.arrayContaining([
      "folk tales", //
      "folk",
      "folk tale",
    ]),
  );
});

test("Test phrasal verbs", () => {
  expect(createLookupWordsEn("deal with")).toEqual(
    expect.arrayContaining([
      "deal with", //
      "deal",
    ]),
  );
  expect(createLookupWordsEn("dealt with")).toEqual(
    expect.arrayContaining([
      "dealt with", //
      "dealt",
      "deal with",
      "deal",
    ]),
  );
  expect(createLookupWordsEn("dealing with")).toEqual(
    expect.arrayContaining([
      "dealing with", //
      "dealing",
      "deal with",
      "deal",
    ]),
  );

  expect(createLookupWordsEn("run with")).toEqual(
    expect.arrayContaining([
      "run with", //
      "run",
    ]),
  );
  expect(createLookupWordsEn("ran with")).toEqual(
    expect.arrayContaining([
      "ran with", //
      "ran",
      "run with",
      "run",
    ]),
  );
  expect(createLookupWordsEn("running with")).toEqual(
    expect.arrayContaining([
      "running with", //
      "running",
      "run with",
      "run",
    ]),
  );

  expect(createLookupWordsEn("yelled at")).toEqual(
    expect.arrayContaining([
      "yell at", //
      "yell",
    ]),
  );

  expect(createLookupWordsEn("yelling at")).toEqual(
    expect.arrayContaining([
      "yell at", //
      "yell",
    ]),
  );

  expect(createLookupWordsEn("dealt dealt dealt")).toEqual(
    expect.arrayContaining([
      "dealt dealt dealt",
      "dealt dealt",
      "dealt",
      "deal dealt dealt",
      "deal dealt",
      "deal",
      "dealt ~ dealt",
      "deal ~ dealt",
    ]),
  );
});

test("Test phrasal verbs with different tenses", () => {
  expect(createLookupWordsEn("cut back")).toEqual(
    expect.arrayContaining([
      "cut back", //
      "cut",
    ]),
  );
  expect(createLookupWordsEn("cutting back")).toEqual(
    expect.arrayContaining([
      "cutting back", //
      "cutting",
      "cut back",
      "cut",
    ]),
  );

  expect(createLookupWordsEn("die out")).toEqual(
    expect.arrayContaining([
      "die out", //
      "die",
    ]),
  );
  expect(createLookupWordsEn("dying out")).toEqual(
    expect.arrayContaining([
      "dying out", //
      "dying",
      "die out",
      "die",
    ]),
  );

  expect(createLookupWordsEn("play with")).toEqual(
    expect.arrayContaining([
      "play with", //
      "play",
    ]),
  );
  expect(createLookupWordsEn("played with")).toEqual(
    expect.arrayContaining([
      "played with", //
      "played",
      "play with",
      "play",
    ]),
  );

  expect(createLookupWordsEn("pop up")).toEqual(
    expect.arrayContaining([
      "pop up", //
      "pop",
    ]),
  );
  expect(createLookupWordsEn("popped up")).toEqual(
    expect.arrayContaining([
      "popped up", //
      "popped",
      "pop up",
      "pop",
    ]),
  );
});

test("Test underscore words", () => {
  expect(createLookupWordsEn("aaa_bbb")).toEqual(expect.arrayContaining(["aaa_bbb", "aaa bbb", "aaa", "bbb"]));
  expect(createLookupWordsEn("worker_processes")).toEqual(
    expect.arrayContaining([
      "worker_processes",
      "worker_process",
      "worker processes",
      "worker",
      "processes",
      "process",
      "work",
    ]),
  );
});

test("Test possessive and reflexive pronouns", () => {
  expect(createLookupWordsEn("on one's own")).toEqual(
    expect.arrayContaining([
      "on one's own", //
      "on one's",
      "on",
      "on ~ own",
      "on own",
      "on one",
    ]),
  );

  expect(createLookupWordsEn("on his own")).toEqual(
    expect.arrayContaining([
      "on his own",
      "on his",
      "on",
      "on ~ own",
      "on own",
      "on one's own",
      "on one's",
      "on one",
      "on someone's own",
      "on someone's",
      "on someone",
    ]),
  );

  expect(createLookupWordsEn("his only son")).toEqual(
    expect.arrayContaining([
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
      "someone' son",
    ]),
  );

  expect(createLookupWordsEn("Senete's")).toEqual(
    expect.arrayContaining([
      "Senete's", //
      "Senete'",
      "Senete",
      "senete's",
      "senete'",
      "senete",
    ]),
  );

  expect(createLookupWordsEn("by oneself")).toEqual(
    expect.arrayContaining([
      "by oneself", //
      "by",
    ]),
  );
  expect(createLookupWordsEn("by myself")).toEqual(
    expect.arrayContaining([
      "by myself", //
      "by",
      "by oneself",
    ]),
  );

  expect(createLookupWordsEn("brush one's dog")).toEqual(
    expect.arrayContaining(["brush one's dog", "brush one's", "brush", "brush ~ dog", "brush dog", "brush one"]),
  );
  expect(createLookupWordsEn("brush Taro's dog")).toEqual(
    expect.arrayContaining([
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
      "brush taro",
    ]),
  );
});

test("Test British and American English variations", () => {
  expect(createLookupWordsEn("colour")).toEqual(expect.arrayContaining(["colour", "color"]));
  expect(createLookupWordsEn("women")).toEqual(expect.arrayContaining(["women", "woman"]));
});

test("Test case sensitivity", () => {
  expect(createLookupWordsEn("abc.")).toEqual(expect.arrayContaining(["abc"]));
  expect(createLookupWordsEn("abc.", true)).toEqual(expect.arrayContaining(["abc", "ABC"]));
  expect(createLookupWordsEn("abc.", false, true)).toEqual(expect.arrayContaining(["abc"]));
  expect(createLookupWordsEn("abc.", true, true)).toEqual(expect.arrayContaining(["abc", "ABC"]));
});

test("Test slashes in phrases", () => {
  expect(createLookupWordsEn("pros / cons")).toEqual(
    expect.arrayContaining([
      "pros / cons", //
      "pros and cons",
      "pros or cons",
    ]),
  );

  expect(createLookupWordsEn("pros/cons")).toEqual(
    expect.arrayContaining([
      "pros/cons", //
      "pros / cons",
      "pros and cons",
      "pros or cons",
    ]),
  );
});

test("Test sentences with punctuation", () => {
  expect(createLookupWordsEn("in the wild. That is a pen.")).toEqual(
    expect.arrayContaining([
      "in the wild", //
    ]),
  );

  expect(createLookupWordsEn("in the wild, That is a pen.")).toEqual(
    expect.arrayContaining([
      "in the wild", //
    ]),
  );
});

test("Test compound words with no space", () => {
  expect(createLookupWordsEn("self taught")).toEqual(
    expect.arrayContaining([
      "self taught", //
      "selftaught",
    ]),
  );
});

test("Test proper nouns", () => {
  expect(createLookupWordsEn("united kingdom")).toEqual(
    expect.arrayContaining([
      "United", //
      "United Kingdom",
    ]),
  );

  expect(createLookupWordsEn("canadian broadcasting corporation")).toEqual(
    expect.arrayContaining([
      "Canadian", //
      "Canadian Broadcasting",
      "Canadian Broadcasting Corporation",
    ]),
  );
});

test("Test elongated words", () => {
  expect(createLookupWordsEn("craaaaaaaaaaaaaaazy")).toEqual(
    expect.arrayContaining([
      "crazy", //
      "craazy",
    ]),
  );
  expect(createLookupWordsEn("craaazy")).toEqual(
    expect.arrayContaining([
      "crazy", //
      "craazy",
    ]),
  );
});

test("Test empty string", () => {
  expect(createLookupWordsEn("")).toEqual(expect.arrayContaining([]));
});

test("Test Japanese words", () => {
  expect(createLookupWordsJa("動いた")).toEqual(expect.arrayContaining(["動く"]));
  expect(createLookupWordsJa("走った")).toEqual(expect.arrayContaining(["走る"]));
  expect(createLookupWordsJa("おいた")).toEqual(expect.arrayContaining(["おく", "おいる"]));
  expect(createLookupWordsJa("19az")).toEqual(expect.arrayContaining(["１９ａｚ"]));
});
