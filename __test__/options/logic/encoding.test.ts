import { describe, expect, test } from "vitest";
import { detectByteArrayEncoding, detectFileEncoding } from "../../../src/options/logic/encoding";

describe("detectByteArrayEncoding", () => {
  test("empty array returns Unknown", () => {
    expect(detectByteArrayEncoding(new Uint8Array([]))).toBe("Unknown");
  });

  test("ASCII array returns ASCII", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0x41, 0x42, 0x43]))).toBe("ASCII");
  });

  test("valid UTF-8 2-byte returns UTF-8", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xc3, 0xa9]))).toBe("UTF-8");
  });

  test("valid UTF-8 3-byte returns UTF-8", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xe3, 0x81, 0x82]))).toBe("UTF-8");
  });

  test("valid UTF-8 4-byte returns UTF-8", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xf0, 0x9f, 0x92, 0xa9]))).toBe("UTF-8");
  });

  test("incomplete UTF-8 sequence returns Shift_JIS", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xc3]))).toBe("Shift_JIS");
  });

  test("valid Shift_JIS double byte returns Shift_JIS", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0x81, 0x40]))).toBe("Shift_JIS");
  });

  test("valid Shift_JIS sole char returns Shift_JIS", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xa1]))).toBe("Shift_JIS");
  });

  test("incomplete Shift_JIS double byte returns Shift_JIS", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0x81]))).toBe("Shift_JIS");
  });

  test("invalid Shift_JIS returns Unknown", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xff]))).toBe("Unknown");
  });

  test("valid UTF-16 little endian returns UTF-16", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xff, 0xfe, 0x41, 0x00]))).toBe("UTF-16");
  });

  test("valid UTF-16 big endian returns UTF-16", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xfe, 0xff, 0x00, 0x41]))).toBe("UTF-16");
  });

  test("non matching array returns Unknown", () => {
    expect(detectByteArrayEncoding(new Uint8Array([0xff, 0xff]))).toBe("Unknown");
  });
});

describe("detectFileEncoding", () => {
  test("file with ASCII content returns ASCII", async () => {
    const file = new File([new Uint8Array([0x41, 0x42, 0x43])], "ascii.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).resolves.toBe("ASCII");
  });

  test("file with UTF-8 content returns UTF-8", async () => {
    const file = new File([new Uint8Array([0xc3, 0xa9, 0xe3, 0x81, 0x82])], "utf8.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).resolves.toBe("UTF-8");
  });

  test("file with Shift_JIS content returns Shift_JIS", async () => {
    const file = new File([new Uint8Array([0x81, 0x40])], "shiftjis.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).resolves.toBe("Shift_JIS");
  });

  test("file with UTF-16 content returns UTF-16", async () => {
    const fileLE = new File([new Uint8Array([0xff, 0xfe, 0x41, 0x00])], "utf16le.txt", { type: "text/plain" });
    const fileBE = new File([new Uint8Array([0xfe, 0xff, 0x00, 0x41])], "utf16be.txt", { type: "text/plain" });
    await expect(detectFileEncoding(fileLE)).resolves.toBe("UTF-16");
    await expect(detectFileEncoding(fileBE)).resolves.toBe("UTF-16");
  });

  test("file with more than 1024 bytes uses only first 1024 bytes", async () => {
    const first1024 = new Uint8Array(1024).fill(0x41);
    const extra = new Uint8Array(100).fill(0xff);
    const blob = new Blob([first1024, extra]);
    const file = new File([blob], "long.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).resolves.toBe("ASCII");
  });

  test("file with empty content returns Unknown", async () => {
    const file = new File([new Uint8Array([])], "empty.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).resolves.toBe("Unknown");
  });

  test("file read error rejects", async () => {
    const originalFileReader = global.FileReader;
    class FailFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsArrayBuffer() {
        throw new Error("fail");
      }
    }
    // @ts-expect-error
    global.FileReader = FailFileReader;
    const file = new File([new Uint8Array([0x41])], "fail.txt", { type: "text/plain" });
    await expect(detectFileEncoding(file)).rejects.toThrow("fail");
    global.FileReader = originalFileReader;
  });
});
