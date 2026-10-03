import { beforeAll, expect, test } from "vitest";
import entryDefault from "../../../src/main/core/entry/default";
import testdata from "../../testdata";

beforeAll(() => {
  testdata.load();
});

test("should use the English generator for English text", () => {
  const build = entryDefault();
  const { entries, lang } = build("dogs", false, false);
  expect(lang).toEqual("en");
  expect(entries).toEqual(expect.arrayContaining(["dogs", "dog"]));
});

test("should treat special hyphens and joiners as English", () => {
  const build = entryDefault();
  expect(build("well‑known", false, false).lang).toEqual("en");
  expect(build("a‌b", false, false).lang).toEqual("en");
});

test("should use the Japanese generator for Japanese text", () => {
  const build = entryDefault();
  const { entries, lang } = build("走った", false, false);
  expect(lang).toEqual("ja");
  expect(entries).toEqual(expect.arrayContaining(["走った", "走る"]));
});
