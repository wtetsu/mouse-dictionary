import { expect, test } from "vitest";
import entry from "../../../src/main/core/entry";

test("should detect and generate Japanese text", () => {
  const detector = (text: string) => {
    if (text[0] === "e") {
      return "en";
    }
    if (text[0] === "j") {
      return "ja";
    }
    if (text[0] === "z") {
      return "zh";
    }
    return "default";
  };
  const generators = {
    ja: (text: string) => {
      return text + "(ja)";
    },
    en: (text: string) => {
      return text + "(en)";
    },
    zh: (text: string) => {
      return text + "(zh)";
    },
    default: (text: string) => {
      return text + "(default)";
    },
  };

  const build = entry.build(detector, generators);

  expect({ entries: "jaaaaaaaaaaaaaaaaaaaaaaa(ja)", lang: "ja" }).toEqual(build("jaaaaaaaaaaaaaaaaaaaaaaa"));
  expect({ entries: "eaaaaaaaaaaaaaaaaaaaaaaa(en)", lang: "en" }).toEqual(build("eaaaaaaaaaaaaaaaaaaaaaaa"));
  expect({ entries: "zaaaaaaaaaaaaaaaaaaaaaaa(zh)", lang: "zh" }).toEqual(build("zaaaaaaaaaaaaaaaaaaaaaaa"));
  expect({ entries: "Test(default)", lang: "default" }).toEqual(build("Test"));
});
