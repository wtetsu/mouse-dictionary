import generateEntries from "../src/lib/entry/en";

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
  expect(generateEntries("thousand miles down")).toEqual([
    "thousand miles down",
    "thousand miles",
    "thousand",
    "thousand ~ down",
    "thousand down",
    "thousand mile"
  ]);

  expect(generateEntries("american english")).toEqual(["american english", "american"]);
  expect(generateEntries("American English")).toEqual(["American English", "American", "american english", "american"]);

  expect(generateEntries("Announcement of Hoge")).toEqual([
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

  expect(generateEntries("wonder if I shall")).toEqual([
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

  expect(generateEntries("in my favor")).toEqual(expect.arrayContaining(["in someone's favor"]));
  expect(generateEntries("in my best favor")).toEqual(expect.arrayContaining(["in someone's favor"]));
});

test("", () => {
  expect(generateEntries("blue-gray")).toEqual(["blue-gray", "blue gray", "blue", "gray", "-gray", "bluegray"]);
  expect(generateEntries("third-party")).toEqual(["third-party", "third party", "third", "party", "-party", "thirdparty"]);

  // non-breaking hyphen(U+2011)
  expect(generateEntries("blue‑gray")).toEqual(["blue-gray", "blue gray", "blue", "gray", "-gray", "bluegray"]);
  expect(generateEntries("third‑party")).toEqual(["third-party", "third party", "third", "party", "-party", "thirdparty"]);
});

test("", () => {
  expect(generateEntries("folk tales")).toEqual(["folk tales", "folk", "folk tale"]);
});

test("", () => {
  expect(generateEntries("deal with")).toEqual(["deal with", "deal"]);
  expect(generateEntries("dealt with")).toEqual(["dealt with", "dealt", "deal with", "deal"]);
  expect(generateEntries("dealing with")).toEqual(["dealing with", "dealing", "deal with", "deal", "deale with", "deale"]);

  expect(generateEntries("run with")).toEqual(["run with", "run"]);
  expect(generateEntries("ran with")).toEqual(["ran with", "ran", "run with", "run"]);
  expect(generateEntries("running with")).toEqual(["running with", "running", "run with", "run", "runne with", "runne"]);

  expect(generateEntries("dealt dealt dealt")).toEqual([
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
  expect(generateEntries("cut back")).toEqual(["cut back", "cut"]);
  expect(generateEntries("cutting back")).toEqual(["cutting back", "cutting", "cut back", "cut", "cutte back", "cutte"]);

  expect(generateEntries("die out")).toEqual(["die out", "die"]);
  expect(generateEntries("dying out")).toEqual(["dying out", "dying", "die out", "die"]);

  expect(generateEntries("play with")).toEqual(["play with", "play"]);
  expect(generateEntries("played with")).toEqual(["played with", "played", "play with", "play", "playe with", "playe"]);

  expect(generateEntries("pop up")).toEqual(["pop up", "pop"]);
  expect(generateEntries("popped up")).toEqual([
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
  expect(generateEntries("on one's own")).toEqual([
    "on one's own",
    "on one's",
    "on",
    //"on one",
    "on ~ own",
    "on own",
    "on one"
  ]);
  expect(generateEntries("on his own")).toEqual([
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

  expect(generateEntries("his only son")).toEqual([
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

  expect(generateEntries("Senete's")).toEqual(["Senete's", "Senete'", "Senete", "senete's", "senete'", "senete"]);

  expect(generateEntries("by oneself")).toEqual(["by oneself", "by"]);
  expect(generateEntries("by myself")).toEqual(["by myself", "by", "by oneself"]);

  expect(generateEntries("brush one's dog")).toEqual([
    "brush one's dog",
    "brush one's",
    "brush",
    "brush ~ dog",
    "brush dog",
    "brush one"
  ]);
  expect(generateEntries("brush Taro's dog")).toEqual([
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
