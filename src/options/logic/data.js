/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const byteArrayMayBeShiftJis = array => {
  let mayBeShiftJis = true;
  let nextShouldSecondByte = false;
  for (let index = 0; index < array.length; index++) {
    const byte = array[index];
    const isSecondByte = (byte >= 0x40 && byte <= 0x7e) || (byte >= 0x80 && byte <= 0xfc);
    if (!nextShouldSecondByte) {
      const isFirstByte = (byte >= 0x81 && byte <= 0x9f) || (byte >= 0xe0 && byte <= 0xef);
      const isSoleChar = (byte >= 0x00 && byte <= 0x1f) || (byte >= 0x20 && byte <= 0x7f) || (byte >= 0xa1 && byte <= 0xdf);

      if (isFirstByte) {
        nextShouldSecondByte = true;
      } else if (!isSoleChar) {
        mayBeShiftJis = false;
        break;
      }
    } else {
      if (isSecondByte) {
        nextShouldSecondByte = false;
      } else {
        mayBeShiftJis = false;
        break;
      }
    }
  }
  return mayBeShiftJis;
};

export default {
  byteArrayMayBeShiftJis
};
