import * as data from "../../../src/options/logic/data";
import defaultsettings from "../../../src/main/settings";
import type { MouseDictionarySettings } from "../../../src/options/types";

test("byteArrayMayBeShiftJis should correctly identify Shift-JIS byte arrays", () => {
  expect(true).toEqual(data.byteArrayMayBeShiftJis([]));

  expect(true).toEqual(data.byteArrayMayBeShiftJis([0x81, 0x40]));
  expect(true).toEqual(data.byteArrayMayBeShiftJis([0x9f, 0x7e]));
  expect(true).toEqual(data.byteArrayMayBeShiftJis([0xe0, 0xef]));
  expect(true).toEqual(data.byteArrayMayBeShiftJis([0xef, 0xfc]));
  expect(true).toEqual(data.byteArrayMayBeShiftJis([0x00, 0x1f, 0x7f, 0x20, 0x7e, 0xa1, 0xdf]));
  expect(true).toEqual(data.byteArrayMayBeShiftJis([0x40, 0x7e]));

  expect(false).toEqual(data.byteArrayMayBeShiftJis([0x80]));
  expect(false).toEqual(data.byteArrayMayBeShiftJis([0x81, 0x3f]));
  expect(false).toEqual(data.byteArrayMayBeShiftJis([0x9f, 0x7f]));
  expect(false).toEqual(data.byteArrayMayBeShiftJis([0xe0, 0x7f]));
  expect(false).toEqual(data.byteArrayMayBeShiftJis([0xef, 0xfd]));
});

test("preProcessSettings and postProcessSettings should correctly process settings", () => {
  const d1 = defaultsettings as MouseDictionarySettings;
  const d2 = data.preProcessSettings(d1);
  const d3 = data.postProcessSettings(d1);
  expect(false).toEqual(d1 === d2);
  expect(false).toEqual(d2 === d3);

  expect(0).toEqual(d1.replaceRules.filter((r) => r.key).length);
  expect(d1.replaceRules.length).toEqual(d1.replaceRules.length);
  expect(d2.replaceRules.length).toEqual(d2.replaceRules.filter((r) => r.key).length);
  expect(0).toEqual(d3.replaceRules.filter((r) => r.key).length);

  expect(JSON.stringify(d1)).toEqual(JSON.stringify(d3));
});

test("fileMayBeShiftJis should correctly identify Shift-JIS files", async () => {
  const createFile = (content: number[]) => {
    const bytes = new Uint8Array(content);
    return new Blob([bytes.buffer]) as File;
  };

  try {
    await data.fileMayBeShiftJis({} as Blob);
  } catch (e) {
    expect(true).toEqual(e instanceof Error);
  }

  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([])));

  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0x81, 0x40])));
  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0x9f, 0x7e])));
  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0xe0, 0xef])));
  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0xef, 0xfc])));
  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0x00, 0x1f, 0x7f, 0x20, 0x7e, 0xa1, 0xdf])));
  expect(true).toEqual(await data.fileMayBeShiftJis(createFile([0x40, 0x7e])));

  expect(false).toEqual(await data.fileMayBeShiftJis(createFile([0x80])));
  expect(false).toEqual(await data.fileMayBeShiftJis(createFile([0x81, 0x3f])));
  expect(false).toEqual(await data.fileMayBeShiftJis(createFile([0x9f, 0x7f])));
  expect(false).toEqual(await data.fileMayBeShiftJis(createFile([0xe0, 0x7f])));
  expect(false).toEqual(await data.fileMayBeShiftJis(createFile([0xef, 0xfd])));
});
