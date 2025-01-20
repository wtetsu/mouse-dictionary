import config from "../../../src/main/core/config";
import env from "../../../src/main/env";
import Chrome from "../chrome";

beforeEach(() => {
  global.chrome = new Chrome() as any;
});

afterEach(() => {
  env.enableUserSettings = true;
  env.enableWindowStatusSave = true;
});

test("loadAll should return consistent settings and position", async () => {
  const { settings, position } = await config.loadAll();
  expect(await config.loadAll()).toEqual({ settings, position });
  expect(await config.loadAll()).toEqual({ settings: await config.loadSettings(), position });

  env.enableUserSettings = false;
  expect(await config.loadAll()).toEqual({ settings, position });
  expect(await config.loadAll()).toEqual({ settings: await config.loadSettings(), position });
});

test("parseSettings should handle various input cases", async () => {
  expect(config.parseSettings({})).toEqual({});

  expect(
    config.parseSettings({
      shortWordLength: 2,
      null: null,
      empty: "",
      zero: 0,
      normalDialogStyles: null,
      movingDialogStyles: "",
      hiddenDialogStyles: "{",
    })
  ).toEqual({
    shortWordLength: 2,
    empty: "",
    zero: 0,
    movingDialogStyles: null,
    hiddenDialogStyles: null,
  });
});

test("parseSettings should handle initialPosition and window status save", async () => {
  expect(config.parseSettings({})).toEqual({});

  expect(config.parseSettings({ initialPosition: "right" })).toEqual({ initialPosition: "right" });
  expect(config.parseSettings({ initialPosition: "keep" })).toEqual({ initialPosition: "keep" });
  env.enableWindowStatusSave = false;
  expect(config.parseSettings({ initialPosition: "right" })).toEqual({ initialPosition: "right" });
  expect(config.parseSettings({ initialPosition: "keep" })).toEqual({ initialPosition: "right" });
});

test("savePosition should save and load position correctly", async () => {
  global.chrome = chrome as any;

  expect((await config.loadAll()).position).toEqual({});

  await config.savePosition({ x: 123, y: 345 });
  expect((await config.loadAll()).position).toEqual({ x: 123, y: 345 });

  env.enableUserSettings = false;
  await config.savePosition({ x: 999, y: 999 });
  env.enableUserSettings = true;
  expect((await config.loadAll()).position).toEqual({ x: 123, y: 345 });
});
