/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import immer from "immer";
import { MouseDictionarySettings } from "../types";

export const fileMayBeShiftJis = async (file: Blob): Promise<boolean> => {
  const e = await readFile(file);
  const buffer = e.target.result as ArrayBuffer;
  const length = Math.min(512, buffer.byteLength);
  const bytes = new Uint8Array(buffer, 0, length);
  return byteArrayMayBeShiftJis(bytes);
};

export const byteArrayMayBeShiftJis = (array: Uint8Array | number[]): boolean => {
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

const isShiftJisFirstByte = (byte: number) => {
  return (byte >= 0x81 && byte <= 0x9f) || (byte >= 0xe0 && byte <= 0xef);
};

const isShiftJisSecondByte = (byte: number) => {
  return (byte >= 0x40 && byte <= 0x7e) || (byte >= 0x80 && byte <= 0xfc);
};

const isShiftJisSoleChar = (byte: number) => {
  return (byte >= 0x00 && byte <= 0x1f) || (byte >= 0x20 && byte <= 0x7f) || (byte >= 0xa1 && byte <= 0xdf);
};

export const preProcessSettings = (settings: MouseDictionarySettings): MouseDictionarySettings => {
  return immer(settings, (d) => {
    for (let i = 0; i < d?.replaceRules?.length; i++) {
      d.replaceRules[i].key = i.toString();
    }
  });
};

export const postProcessSettings = (settings: MouseDictionarySettings): MouseDictionarySettings => {
  return immer(settings, (d) => {
    for (const replaceRule of d.replaceRules) {
      delete replaceRule.key;
    }
  });
};

const readFile = async (file: Blob): Promise<ProgressEvent<FileReader>> => {
  return new Promise((done, fail) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      done(e);
    };
    try {
      reader.readAsArrayBuffer(file);
    } catch (e) {
      fail(new Error(e.toString()));
    }
  });
};
