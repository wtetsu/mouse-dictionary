import { expect, test } from "vitest";
import { LineReader } from "../../../src/options/logic/linereader";

test("", () => {
  const reader = new LineReader("");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaa\nbbb\nccc");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaa\nbbb\nccc\n");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaa\nbbb\nccc\n\n");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaa\r\nbbb\r\nccc");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaa");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("bbb");
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("ccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaabbbccc");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaabbbccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});

test("", () => {
  const reader = new LineReader("aaabbbccc\n");

  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(true);
  expect(reader.getLine()).toEqual("aaabbbccc");
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
  expect(reader.next()).toEqual(false);
  expect(reader.getLine).toThrowError();
});
