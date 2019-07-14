/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const fileMayBeSjis = async file => {
  return new Promise((done, fail) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buffer = e.target.result;
        const length = Math.min(512, buffer.byteLength);
        const bytes = new Uint8Array(buffer, 0, length);
        const mayBeSjis = byteArrayMayBeSjis(bytes);
        done(mayBeSjis);
      } catch {
        fail();
      }
    };
    try {
      reader.readAsArrayBuffer(file);
    } catch {
      fail();
    }
  });
};

const byteArrayMayBeSjis = array => {
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
  fileMayBeSjis: fileMayBeSjis,
  byteArrayMayBeSjis
};
