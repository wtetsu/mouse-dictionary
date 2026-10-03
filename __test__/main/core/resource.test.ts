import { afterEach, expect, test, vi } from "vitest";
import res from "../../../src/main/core/resource";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

const stubLanguages = (languages: string[] | undefined) => {
  vi.stubGlobal("navigator", { languages });
};

test("should return Japanese messages for Japanese users", () => {
  stubLanguages(["ja-JP", "en-US"]);
  expect(res("doesntSupportFrame")).toEqual("Mouse Dictionaryは、フレームのあるページで使用することはできません。");
});

test("should return English messages for English users", () => {
  stubLanguages(["en-US", "ja-JP"]);
  expect(res("doesntSupportFrame")).toEqual("Mouse Dictionary doesn't support frame pages.");
});

test("should pick the first supported language", () => {
  stubLanguages(["fr-FR", "ja"]);
  expect(res("nonPdf")).toEqual("PDFファイルではないようです。処理を中断しました。");
});

test("should fall back to English", () => {
  stubLanguages(["fr-FR", "de"]);
  expect(res("nonPdf")).toEqual("This is not a PDF document.");

  stubLanguages(undefined);
  expect(res("nonPdf")).toEqual("This is not a PDF document.");
});

test("should return null for unknown keys", () => {
  stubLanguages(["en-US"]);
  expect(res("unknownKey")).toBeNull();
});

test.each([
  ["chrome", 'select "Options"'],
  ["firefox", '"Manage Extension"'],
  ["safari", '"Preferences"'],
])("should have a browser specific message (%s)", async (browser, expected) => {
  vi.stubGlobal("BROWSER", browser);
  stubLanguages(["en-US"]);
  const { default: freshRes } = await import("../../../src/main/core/resource");
  expect(freshRes("needToPrepareDict")).toContain(expected);
});
