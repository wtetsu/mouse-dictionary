import { afterEach, beforeEach, expect, test, vi } from "vitest";
import sound from "../../../src/main/lib/sound";

let speak: ReturnType<typeof vi.fn>;

beforeEach(() => {
  speak = vi.fn();
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      text: string;
      lang = "";
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  vi.stubGlobal("speechSynthesis", { speak });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("should pronounce English text in en-US", () => {
  sound.pronounce("hello");
  expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "hello", lang: "en-US" }));
});

test("should pronounce Japanese text in ja-JP", () => {
  sound.pronounce("こんにちは");
  expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "こんにちは", lang: "ja-JP" }));
});

test("should do nothing for empty text", () => {
  sound.pronounce("");
  sound.pronounce(undefined);
  expect(speak).not.toHaveBeenCalled();
});
