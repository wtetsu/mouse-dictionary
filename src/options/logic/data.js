/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import immer from "immer";

const byteArrayMayBeShiftJis = (array) => {
  let mayBeShiftJis = true;
  let nextShouldSecondByte = false;
  for (let index = 0; index < array.length; index++) {
    const byte = array[index];
    if (!nextShouldSecondByte) {
      if (isShiftJisFirstByte(byte)) {
        nextShouldSecondByte = true;
      } else if (!isShiftJisSoleChar(byte)) {
        mayBeShiftJis = false;
        break;
      }
    } else {
      if (isShiftJisSecondByte(byte)) {
        nextShouldSecondByte = false;
      } else {
        mayBeShiftJis = false;
        break;
      }
    }
  }
  return mayBeShiftJis;
};

const isShiftJisFirstByte = (byte) => {
  return (byte >= 0x81 && byte <= 0x9f) || (byte >= 0xe0 && byte <= 0xef);
};

const isShiftJisSecondByte = (byte) => {
  return (byte >= 0x40 && byte <= 0x7e) || (byte >= 0x80 && byte <= 0xfc);
};

const isShiftJisSoleChar = (byte) => {
  return (byte >= 0x00 && byte <= 0x1f) || (byte >= 0x20 && byte <= 0x7f) || (byte >= 0xa1 && byte <= 0xdf);
};

const preProcessSettings = (settings) => {
  return immer(settings, (d) => {
    for (let i = 0; i < d.replaceRules.length; i++) {
      d.replaceRules[i].key = i.toString();
    }
  });
};

const postProcessSettings = (settings) => {
  return immer(settings, (d) => {
    for (const replaceRule of d.replaceRules) {
      delete replaceRule.key;
    }
  });
};

export default {
  byteArrayMayBeShiftJis,
  preProcessSettings,
  postProcessSettings,
};
