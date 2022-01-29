import defaultSettings from "../../../src/main/settings";
import Generator from "../../../src/main/core/generator";

test("", () => {
  const generator = new Generator(defaultSettings);

  expect(generator.generate([], {}, false)).toEqual({
    hitCount: 0,
    html: `<div style="margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
</div>`,
  });

  expect(generator.generate(["hasOwnProperty"], {}, false)).toEqual({
    hitCount: 0,
    html: `<div style="margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
</div>`,
  });

  expect(generator.generate(["test"], { test: "テスト" }, false)).toEqual({
    hitCount: 1,
    html: `<div style="margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
      <span style=\"margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-size:medium;color:#000088;font-weight:bold;\">
        test
      </span>
      <br/>
      <span style=\"margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-size:small;color:#101010;\">
        テスト
      </span>
</div>`,
  });

  expect(generator.generate(["test"], { test: "テスト ■TEST" }, false)).toEqual({
    hitCount: 1,
    html: `<div style="margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
      <span style=\"margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-size:medium;color:#000088;font-weight:bold;\">
        test
      </span>
      <br/>
      <span style=\"margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;font-size:small;color:#101010;\">
        テスト <span style=\"margin:0;padding:0;border:0;vertical-align:baseline;line-height:normal;text-shadow:none;;color:#008000;font-size:100%;\">■TEST</span>
      </span>
</div>`,
  });
});

test("", () => {
  const settings = {
    ...defaultSettings,
    replaceRules: [{ search: null, replace: "xxx" }],
  };
  new Generator(settings); // No error
});

test("", () => {
  const settings = {
    ...defaultSettings,
    replaceRules: [{ search: "\\", replace: "xxx" }],
  };

  // Fail to compile regexp
  new Generator(settings);
});
