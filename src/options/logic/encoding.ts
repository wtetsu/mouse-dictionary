/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

type Encoding = "ASCII" | "Shift_JIS" | "UTF-8" | "UTF-16" | "Unknown";

export const detectFileEncoding = async (file: File): Promise<Encoding> => {
  const firstBytes = await getFirstBytes(file, 1024);
  return detectByteArrayEncoding(firstBytes);
};

export const detectByteArrayEncoding = (byteArray: Uint8Array): Encoding => {
  if (byteArray.length === 0) {
    return "Unknown";
  }
  if (isByteArrayAscii(byteArray)) {
    return "ASCII";
  }
  if (byteArrayMayBeUtf8(byteArray)) {
    return "UTF-8";
  }
  if (byteArrayMayBeShiftJis(byteArray)) {
    return "Shift_JIS";
  }
  if (byteArrayMayBeUtf16(byteArray)) {
    return "UTF-16";
  }
  return "Unknown";
};

const byteArrayMayBeShiftJis = (array: Uint8Array | number[]): boolean => {
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

const isByteArrayAscii = (data: Uint8Array): boolean => {
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= 0x80) {
      return false;
    }
  }
  return true;
};

const byteArrayMayBeUtf8 = (data: Uint8Array): boolean => {
  let i = 0;
  while (i < data.length) {
    const byte = data[i];
    if (byte <= 0x7f) {
      i++;
      continue;
    }
    if (byte >= 0xc2 && byte <= 0xdf) {
      if (i + 1 >= data.length || !isContinuation(data[i + 1])) {
        return false;
      }
      i += 2;
      continue;
    }
    if (byte >= 0xe0 && byte <= 0xef) {
      if (i + 2 >= data.length || !isContinuation(data[i + 1]) || !isContinuation(data[i + 2])) {
        return false;
      }
      i += 3;
      continue;
    }
    if (byte >= 0xf0 && byte <= 0xf4) {
      if (
        i + 3 >= data.length ||
        !isContinuation(data[i + 1]) ||
        !isContinuation(data[i + 2]) ||
        !isContinuation(data[i + 3])
      ) {
        return false;
      }
      i += 4;
      continue;
    }
    return false;
  }
  return true;
};

const byteArrayMayBeUtf16 = (data: Uint8Array): boolean => {
  if (data.length < 2) {
    return false;
  }
  return (data[0] === 0xff && data[1] === 0xfe) || (data[0] === 0xfe && data[1] === 0xff);
};

const isContinuation = (byte: number): boolean => {
  return byte >= 0x80 && byte <= 0xbf;
};

const getFirstBytes = async (file: Blob, length: number): Promise<Uint8Array> => {
  const e = await readFile(file);
  const buffer = e.target?.result as ArrayBuffer;
  const actualLength = Math.min(length, buffer.byteLength);
  return new Uint8Array(buffer, 0, actualLength);
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
      if (e instanceof Error) {
        fail(new Error(e.toString()));
      } else {
        fail(new Error(String(e)));
      }
    }
  });
};
