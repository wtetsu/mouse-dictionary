import testdata from "./testdata";
import generateEntries from "../src/main/entry/en";

beforeAll(() => {
  testdata.load();
});

test("", () => {
  expect(generateEntries("Test")).toEqual(["Test", "test"]);
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
  testList(generateEntries("thousand miles down"), [
    "thousand miles down",
    "thousand miles",
    "thousand",
    "thousand ~ down",
    "thousand down",
    "thousand mile"
  ]);

  testList(generateEntries("american english"), ["american english", "american"]);
  testList(generateEntries("American English"), ["American English", "American", "american english", "american"]);

  testList(generateEntries("Announcement of Hoge"), [
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

  testList(generateEntries("wonder if I shall"), [
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
    "wonder if shall",
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

  testList(generateEntries("in my favor"), expect.arrayContaining(["in someone's favor"]));
  testList(generateEntries("in my best favor"), expect.arrayContaining(["in someone's favor"]));
});

test("", () => {
  testList(generateEntries("blue-gray"), ["blue-gray", "blue gray", "blue", "gray", "blue-", "-gray", "bluegray"]);
  testList(generateEntries("third-party"), [
    "third-party",
    "third party",
    "third",
    "party",
    "third-",
    "-party",
    "thirdparty"
  ]);

  // non-breaking hyphen(U+2011)
  testList(generateEntries("blue‑gray"), ["blue-gray", "blue gray", "blue", "gray", "blue-", "-gray", "bluegray"]);
  testList(generateEntries("third‑party"), [
    "third-party",
    "third party",
    "third",
    "party",
    "third-",
    "-party",
    "thirdparty"
  ]);
});

test("", () => {
  testList(generateEntries("folk tales"), ["folk tales", "folk", "folk tale"]);
});

test("", () => {
  testList(generateEntries("deal with"), ["deal with", "deal"]);
  testList(generateEntries("dealt with"), ["dealt with", "dealt", "deal with", "deal"]);
  testList(generateEntries("dealing with"), ["dealing with", "dealing", "deal with", "deal", "deale with", "deale"]);

  testList(generateEntries("run with"), ["run with", "run"]);
  testList(generateEntries("ran with"), ["ran with", "ran", "run with", "run"]);
  testList(generateEntries("running with"), ["running with", "running", "run with", "run", "runne with", "runne"]);

  testList(generateEntries("dealt dealt dealt"), [
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
  testList(generateEntries("cut back"), ["cut back", "cut"]);
  testList(generateEntries("cutting back"), ["cutting back", "cutting", "cut back", "cut", "cutte back", "cutte"]);

  testList(generateEntries("die out"), ["die out", "die"]);
  testList(generateEntries("dying out"), ["dying out", "dying", "die out", "die"]);

  testList(generateEntries("play with"), ["play with", "play"]);
  testList(generateEntries("played with"), ["played with", "played", "play with", "play", "playe with", "playe"]);

  testList(generateEntries("pop up"), ["pop up", "pop"]);
  testList(generateEntries("popped up"), ["popped up", "popped", "pop up", "pop", "popp up", "popp", "poppe up", "poppe"]);
});

test("", () => {
  expect(generateEntries("aaa_bbb")).toEqual(["aaa_bbb", "aaa bbb", "aaa", "bbb"]);
  expect(generateEntries("worker_processes")).toEqual([
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
  testList(generateEntries("on one's own"), ["on one's own", "on one's", "on", "on ~ own", "on own", "on one"]);

  testList(generateEntries("on his own"), [
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
    "on someone"
  ]);

  testList(generateEntries("his only son"), [
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

  testList(generateEntries("Senete's"), ["Senete's", "Senete'", "Senete", "senete's", "senete'", "senete"]);

  testList(generateEntries("by oneself"), ["by oneself", "by"]);
  testList(generateEntries("by myself"), ["by myself", "by", "by oneself"]);

  testList(generateEntries("brush one's dog"), [
    "brush one's dog",
    "brush one's",
    "brush",
    "brush ~ dog",
    "brush dog",
    "brush one"
  ]);
  testList(generateEntries("brush Taro's dog"), [
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
  expect(generateEntries("colour")).toEqual(["colour", "color"]);
});

const testList = (actualList, expectedList) => {
  for (let i = 0; i < expectedList.length; i++) {
    const expected = expectedList[i];
    expect(actualList.includes(expected)).toBeTruthy();
  }
};
