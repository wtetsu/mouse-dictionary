/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { LineReader } from "./linereader";
import { EijiroParser, SimpleDictParser, JsonDictParser } from "./dictparser";
import { env, storage } from "../extern";
import { DictionaryFileEncoding, DictionaryFileFormat } from "../types";

type ProgressCallback = (wordCount: number, progress: string) => void;

type DictionaryInformation = {
  files: string[];
};

type Callback = (param: CallbackParam) => void;
type ReadingCallback = (param: ReadingCallbackParam) => void;
// type LoadingCallback = (param: LoadingCallbackParam) => void;

type CallbackParam = ReadingCallbackParam | LoadingCallbackParam;

type ReadingCallbackParam = {
  name: "reading";
  loaded: number;
  total: number;
};

type LoadingCallbackParam = {
  name: "loading";
  count: number;
  word: HeadWord;
};

type LoadParam = {
  file: Blob;
  encoding: DictionaryFileEncoding;
  format: DictionaryFileFormat;
};

type HeadWord = {
  head: string;
  desc: string;
};

export const load = async (loadParam: LoadParam, callback: Callback): Promise<number> => {
  const fileContent = await readAsText(loadParam.file, loadParam.encoding, (e) => {
    callback({ name: "reading", loaded: e.loaded, total: e.total });
  });

  const reader = new LineReader(fileContent);

  let dictData = {};
  let wordCount = 0;

  const parser = createDictParser(loadParam.format);
  while (reader.next()) {
    const hd: HeadWord = parser.addLine(reader.getLine());
    if (!hd) {
      continue;
    }
    dictData[hd.head] = hd.desc;
    wordCount += 1;
    if (wordCount === 1 || (wordCount > 1 && wordCount % env.get().registerRecordsAtOnce === 0)) {
      callback({ name: "loading", count: wordCount, word: hd });
      const tmp = dictData;
      dictData = {};
      await storage.local.set(tmp);
    }
  }

  const lastData = parser.flush();
  if (lastData) {
    Object.assign(dictData, lastData);
    wordCount += Object.keys(lastData).length;
  }
  await storage.local.set(dictData);
  return wordCount;
};

const readAsText = async (file: Blob, encoding: string, callback: ReadingCallback): Promise<string> => {
  return new Promise((done, reject) => {
    try {
      const reader = new FileReader();
      reader.onprogress = (e) => {
        callback({ name: "reading", loaded: e.loaded, total: e.total });
      };
      reader.onload = (e) => {
        done(<string>e.target.result);
      };
      reader.readAsText(file, encoding);
    } catch (e) {
      reject(e);
    }
  });
};

const createDictParser = (format: DictionaryFileFormat) => {
  switch (format) {
    case "TSV":
      return new SimpleDictParser("\t");
    case "PDIC_LINE":
      return new SimpleDictParser(" /// ");
    case "EIJIRO":
      return new EijiroParser();
    case "JSON":
      return new JsonDictParser();
  }
  throw new Error("Unknown File Format: " + format);
};

export const registerDefaultDict = async (fnProgress: ProgressCallback): Promise<number> => {
  const dict = (await loadJsonFile("/data/dict.json")) as DictionaryInformation;
  fnProgress(0, "0");
  let wordCount = 0;
  for (let i = 0; i < dict.files.length; i++) {
    wordCount += await registerDict(dict.files[i]);
    const progress = `${i + 1}/${dict.files.length}`;
    fnProgress(wordCount, progress);
  }
  return wordCount;
};

const loadJsonFile = async (fname: string): Promise<Record<string, any>> => {
  const url = chrome.extension.getURL(fname);
  const response = await fetch(url);
  return response.json();
};

const registerDict = async (fname: string): Promise<number> => {
  const dictData = await loadJsonFile(fname);
  const wordCount = Object.keys(dictData).length;
  await storage.local.set(dictData);
  return wordCount;
};
