import utils from "../src/options/lib/utils";

test("", () => {
  expect(true).toEqual(utils.byteArrayMayBeSjis([]));

  expect(true).toEqual(utils.byteArrayMayBeSjis([0x81, 0x40]));
  expect(true).toEqual(utils.byteArrayMayBeSjis([0x9f, 0x7e]));
  expect(true).toEqual(utils.byteArrayMayBeSjis([0xe0, 0xef]));
  expect(true).toEqual(utils.byteArrayMayBeSjis([0xef, 0xfc]));
  expect(true).toEqual(utils.byteArrayMayBeSjis([0x00, 0x1f, 0x7f, 0x20, 0x7e, 0xa1, 0xdf]));
  expect(true).toEqual(utils.byteArrayMayBeSjis([0x40, 0x7e]));

  expect(false).toEqual(utils.byteArrayMayBeSjis([0x80]));
  expect(false).toEqual(utils.byteArrayMayBeSjis([0x81, 0x3f]));
  expect(false).toEqual(utils.byteArrayMayBeSjis([0x9f, 0x7f]));
  expect(false).toEqual(utils.byteArrayMayBeSjis([0xe0, 0x7f]));
  expect(false).toEqual(utils.byteArrayMayBeSjis([0xef, 0xfd]));
});
