import { expect, test } from "vitest";
import Generator from "../../../src/main/core/generator";
import defaultSettings from "../../../src/main/settings";

test("Generator should return empty HTML when no words are provided", () => {
  const generator = new Generator(defaultSettings);

  expect(generator.generate([], {}, false)).toEqual({
    hitCount: 0,
    html: `<div style="cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif; padding:10px;">
</div>`,
  });

  expect(generator.generate(["hasOwnProperty"], {}, false)).toEqual({
    hitCount: 0,
    html: `<div style="cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif; padding:10px;">
</div>`,
  });

  expect(generator.generate(["test"], { test: "テスト" }, false)).toEqual({
    hitCount: 1,
    html: `<div style="cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif; padding:10px;">
      <span style="font-size:x-large;color:#000088;font-weight:bold;font-family:Georgia;">
        test
      </span>
      <span style="cursor:pointer;visibility:hidden;" data-md-pronunciation="test" data-md-hovervisible="true">🔊</span>
      <br/>
      <span style="font-size:small;color:#101010;">
        テスト
      </span>
</div>`,
  });

  expect(generator.generate(["test"], { test: "テスト ■TEST" }, false)).toEqual({
    hitCount: 1,
    html: `<div style="cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif; padding:10px;">
      <span style="font-size:x-large;color:#000088;font-weight:bold;font-family:Georgia;">
        test
      </span>
      <span style="cursor:pointer;visibility:hidden;" data-md-pronunciation="test" data-md-hovervisible="true">🔊</span>
      <br/>
      <span style="font-size:small;color:#101010;">
        テスト <span style="color:#003366;margin-left:1em;font-size:0.9em;">■TEST</span>
      </span>
</div>`,
  });
});

test("Generator should handle null search in replaceRules without error", () => {
  const settings = {
    ...defaultSettings,
    replaceRules: [{ search: null, replace: "xxx" }],
  };
  new Generator(settings); // No error
});

test("Generator should fail to compile regexp with invalid search pattern", () => {
  const settings = {
    ...defaultSettings,
    replaceRules: [{ search: "\\", replace: "xxx" }],
  };

  // Fail to compile regexp
  new Generator(settings);
});
