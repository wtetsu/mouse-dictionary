import { LineReader } from "../src/options/logic/linereader";

test("", () => {
  let reader = new LineReader("");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaa\nbbb\nccc");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaa\nbbb\nccc\n");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaa\nbbb\nccc\n\n");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaa\r\nbbb\r\nccc");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaabbbccc");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaabbbccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});

test("", () => {
  let reader = new LineReader("aaabbbccc\n");

  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaabbbccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
  expect(reader.next()).toEqual(false);
  expect(reader.getLine()).toEqual(null);
});
