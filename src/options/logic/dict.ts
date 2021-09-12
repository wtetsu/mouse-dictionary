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

const KEY_DICTIONARY_ID = "**** dictionary_id ****";

export const load = async (loadParam: LoadParam, callback: Callback): Promise<number> => {
  const dictionaryId = (await storage.sync.get({ [KEY_DICTIONARY_ID]: 0 }))[KEY_DICTIONARY_ID];
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
    const headWithSuffix = `${hd.head}_${dictionaryId}`;
    dictData[headWithSuffix] = hd.desc;
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
    for (const [head, desc] of Object.entries(lastData)) {
      dictData[`${head}_${dictionaryId}`] = desc;
    }
    wordCount += Object.keys(lastData).length;
  }
  await storage.local.set(dictData);
  await storage.sync.set({ [KEY_DICTIONARY_ID]: dictionaryId + 1 });
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
  const dictionaryId = (await storage.sync.get({ [KEY_DICTIONARY_ID]: 0 }))[KEY_DICTIONARY_ID];
  const dict = (await loadJsonFile("/data/dict.json")) as DictionaryInformation;
  fnProgress(0, "0");
  let wordCount = 0;
  for (let i = 0; i < dict.files.length; i++) {
    wordCount += await registerDict(dict.files[i], dictionaryId);
    const progress = `${i + 1}/${dict.files.length}`;
    fnProgress(wordCount, progress);
  }
  await storage.sync.set({ [KEY_DICTIONARY_ID]: dictionaryId + 1 });
  return wordCount;
};

const loadJsonFile = async (fname: string): Promise<Record<string, any>> => {
  const url = chrome.extension.getURL(fname);
  const response = await fetch(url);
  return response.json();
};

const registerDict = async (fname: string, dictionaryId: number): Promise<number> => {
  const dictData = await loadJsonFile(fname);
  const dictDataWithSuffix = {};
  for (const [head, desc] of Object.entries(dictData)) {
    dictDataWithSuffix[`${head}_${dictionaryId}`] = desc;
  }
  const wordCount = Object.keys(dictDataWithSuffix).length;
  await storage.local.set(dictDataWithSuffix);
  return wordCount;
};
