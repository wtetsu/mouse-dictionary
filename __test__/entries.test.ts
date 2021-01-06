import testdata from "./testdata";
import generateEntries from "../src/main/core/entry/en";

beforeAll(() => {
  testdata.load();
});

test("", () => {
  expect(generateEntries("Test")).toEqual(expect.arrayContaining(["Test", "test"]));
});

test("", () => {
  let r;
  r = generateEntries("ladies-in-waiting");
  expect(r.includes("ladies-in-waiting")).toBeTruthy();
  expect(r.includes("lady-in-waiting")).toBeTruthy();

  r = generateEntries("stands-by");
  expect(r.includes("stands-by")).toBeTruthy();
  expect(r.includes("stand-by")).toBeTruthy();
});

test("", () => {
  expect(generateEntries("thousand miles down")).toEqual(
    expect.arrayContaining([
      "thousand miles down",
      "thousand miles",
      "thousand",
      "thousand ~ down",
      "thousand down",
      "thousand mile",
    ])
  );

  expect(generateEntries("american english")).toEqual(expect.arrayContaining(["american english", "american"]));
  expect(generateEntries("American English")).toEqual(
    expect.arrayContaining(["American English", "American", "american english", "american"])
  );

  expect(generateEntries("Announcement of Hoge")).toEqual(
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
    ])
  );

  expect(generateEntries("wonder if I shall")).toEqual(
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
    ])
  );

  expect(generateEntries("in my favor")).toEqual(expect.arrayContaining(["in someone's favor"]));

  expect(generateEntries("in my best favor")).toEqual(expect.arrayContaining(["in someone's favor"]));
});

test("", () => {
  expect(generateEntries("blue-gray")).toEqual(
    expect.arrayContaining(["blue-gray", "blue gray", "blue", "gray", "blue-", "-gray", "bluegray"])
  );

  expect(generateEntries("third-party")).toEqual(
    expect.arrayContaining(["third-party", "third party", "third", "party", "third-", "-party", "thirdparty"])
  );

  // non-breaking hyphen(U+2011)
  expect(generateEntries("blue‑gray")).toEqual(
    expect.arrayContaining([
      "blue-gray", //
      "blue gray",
      "blue",
      "gray",
      "blue-",
      "-gray",
      "bluegray",
    ])
  );

  expect(generateEntries("third‑party")).toEqual(
    expect.arrayContaining(["third-party", "third party", "third", "party", "third-", "-party", "thirdparty"])
  );
});

test("", () => {
  expect(generateEntries("folk tales")).toEqual(
    expect.arrayContaining([
      "folk tales", //
      "folk",
      "folk tale",
    ])
  );
});

test("", () => {
  expect(generateEntries("deal with")).toEqual(
    expect.arrayContaining([
      "deal with", //
      "deal",
    ])
  );
  expect(generateEntries("dealt with")).toEqual(
    expect.arrayContaining([
      "dealt with", //
      "dealt",
      "deal with",
      "deal",
    ])
  );
  expect(generateEntries("dealing with")).toEqual(
    expect.arrayContaining([
      "dealing with", //
      "dealing",
      "deal with",
      "deal",
    ])
  );

  expect(generateEntries("run with")).toEqual(
    expect.arrayContaining([
      "run with", //
      "run",
    ])
  );
  expect(generateEntries("ran with")).toEqual(
    expect.arrayContaining([
      "ran with", //
      "ran",
      "run with",
      "run",
    ])
  );
  expect(generateEntries("running with")).toEqual(
    expect.arrayContaining([
      "running with", //
      "running",
      "run with",
      "run",
    ])
  );

  expect(generateEntries("yelled at")).toEqual(
    expect.arrayContaining([
      "yell at", //
      "yell",
    ])
  );

  expect(generateEntries("yelling at")).toEqual(
    expect.arrayContaining([
      "yell at", //
      "yell",
    ])
  );

  expect(generateEntries("dealt dealt dealt")).toEqual(
    expect.arrayContaining([
      "dealt dealt dealt",
      "dealt dealt",
      "dealt",
      "deal dealt dealt",
      "deal dealt",
      "deal",
      "dealt ~ dealt",
      "deal ~ dealt",
    ])
  );
});

test("", () => {
  expect(generateEntries("cut back")).toEqual(
    expect.arrayContaining([
      "cut back", //
      "cut",
    ])
  );
  expect(generateEntries("cutting back")).toEqual(
    expect.arrayContaining([
      "cutting back", //
      "cutting",
      "cut back",
      "cut",
    ])
  );

  expect(generateEntries("die out")).toEqual(
    expect.arrayContaining([
      "die out", //
      "die",
    ])
  );
  expect(generateEntries("dying out")).toEqual(
    expect.arrayContaining([
      "dying out", //
      "dying",
      "die out",
      "die",
    ])
  );

  expect(generateEntries("play with")).toEqual(
    expect.arrayContaining([
      "play with", //
      "play",
    ])
  );
  expect(generateEntries("played with")).toEqual(
    expect.arrayContaining([
      "played with", //
      "played",
      "play with",
      "play",
    ])
  );

  expect(generateEntries("pop up")).toEqual(
    expect.arrayContaining([
      "pop up", //
      "pop",
    ])
  );
  expect(generateEntries("popped up")).toEqual(
    expect.arrayContaining([
      "popped up", //
      "popped",
      "pop up",
      "pop",
    ])
  );
});

test("", () => {
  expect(generateEntries("aaa_bbb")).toEqual(expect.arrayContaining(["aaa_bbb", "aaa bbb", "aaa", "bbb"]));
  expect(generateEntries("worker_processes")).toEqual(
    expect.arrayContaining([
      "worker_processes",
      "worker_process",
      "worker processes",
      "worker",
      "processes",
      "process",
      "work",
    ])
  );
});

test("", () => {
  expect(generateEntries("on one's own")).toEqual(
    expect.arrayContaining([
      "on one's own", //
      "on one's",
      "on",
      "on ~ own",
      "on own",
      "on one",
    ])
  );

  expect(generateEntries("on his own")).toEqual(
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
    ])
  );

  expect(generateEntries("his only son")).toEqual(
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
    ])
  );

  expect(generateEntries("Senete's")).toEqual(
    expect.arrayContaining([
      "Senete's", //
      "Senete'",
      "Senete",
      "senete's",
      "senete'",
      "senete",
    ])
  );

  expect(generateEntries("by oneself")).toEqual(
    expect.arrayContaining([
      "by oneself", //
      "by",
    ])
  );
  expect(generateEntries("by myself")).toEqual(
    expect.arrayContaining([
      "by myself", //
      "by",
      "by oneself",
    ])
  );

  expect(generateEntries("brush one's dog")).toEqual(
    expect.arrayContaining(["brush one's dog", "brush one's", "brush", "brush ~ dog", "brush dog", "brush one"])
  );
  expect(generateEntries("brush Taro's dog")).toEqual(
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
    ])
  );
});

test("", () => {
  expect(generateEntries("colour")).toEqual(expect.arrayContaining(["colour", "color"]));
  expect(generateEntries("women")).toEqual(expect.arrayContaining(["women", "woman"]));
});

test("", () => {
  expect(generateEntries("abc.")).toEqual(expect.arrayContaining(["abc"]));
  expect(generateEntries("abc.", true)).toEqual(expect.arrayContaining(["abc", "ABC"]));
  expect(generateEntries("abc.", false, true)).toEqual(expect.arrayContaining(["abc"]));
  expect(generateEntries("abc.", true, true)).toEqual(expect.arrayContaining(["abc", "ABC"]));
});

test("", () => {
  expect(generateEntries("pros / cons")).toEqual(
    expect.arrayContaining([
      "pros / cons", //
      "pros and cons",
      "pros or cons",
    ])
  );

  expect(generateEntries("pros/cons")).toEqual(
    expect.arrayContaining([
      "pros/cons", //
      "pros / cons",
      "pros and cons",
      "pros or cons",
    ])
  );
});

test("", () => {
  expect(generateEntries("in the wild. That is a pen.")).toEqual(
    expect.arrayContaining([
      "in the wild", //
    ])
  );

  expect(generateEntries("in the wild, That is a pen.")).toEqual(
    expect.arrayContaining([
      "in the wild", //
    ])
  );
});

test("", () => {
  expect(generateEntries("self taught")).toEqual(
    expect.arrayContaining([
      "self taught", //
      "selftaught",
    ])
  );
});

test("", () => {
  expect(generateEntries("united kingdom")).toEqual(
    expect.arrayContaining([
      "United", //
      "United Kingdom",
    ])
  );

  expect(generateEntries("canadian broadcasting corporation")).toEqual(
    expect.arrayContaining([
      "Canadian", //
      "Canadian Broadcasting",
      "Canadian Broadcasting Corporation",
    ])
  );
});

test("", () => {
  expect(generateEntries("")).toEqual(expect.arrayContaining([]));
});
