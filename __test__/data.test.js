import data from "../src/options/logic/data";

test("", () => {
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
