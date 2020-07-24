/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { LineReader } from "./linereader";
import { EijiroParser, SimpleDictParser, JsonDictParser } from "./dictparser";
import { env, storage } from "../extern";

type ProgressCallback = (wordCount: number, progress: string) => void;

type DictionaryInformation = {
  files: string[];
};

type LoadCallback = (param: LoadCallbackParam) => void;

type LoadCallbackParam =
  | {
      name: "reading";
      loaded: number;
      total: number;
    }
  | {
      name: "loading";
      count: number;
      word: AWord;
    };

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyCallback: LoadCallback = () => {};

type LoadParam = {
  file: File;
  encoding: string;
  format: string;
  event: LoadCallback;
};

type AWord = {
  head: string;
  desc: string;
};

export const load = async ({ file, encoding, format, event }: LoadParam): Promise<number> => {
  let parser = null;
  switch (format) {
    case "TSV":
      parser = new SimpleDictParser("\t");
      break;
    case "PDIC_LINE":
      parser = new SimpleDictParser(" /// ");
      break;
    case "EIJIRO":
      parser = new EijiroParser();
      break;
    case "JSON":
      parser = new JsonDictParser();
      break;
  }
  if (parser === null) {
    throw new Error("Unknown File Format: " + format);
  }

  const ev = event ?? emptyCallback;

  return new Promise((resolve, reject) => {
    let wordCount = 0;
    const reader = new FileReader();
    reader.onprogress = (e) => {
      ev({ name: "reading", loaded: e.loaded, total: e.total });
    };
    reader.onload = (e) => {
      const data = <string>e.target.result;

      let dictData = {};
      const reader = new LineReader(data);
      reader.eachLine(
        (line) => {
          const hd: AWord = parser.addLine(line);
          if (hd) {
            dictData[hd.head] = hd.desc;
            wordCount += 1;

            if (wordCount === 1 || (wordCount >= 1 && wordCount % env.registerRecordsAtOnce === 0)) {
              ev({ name: "loading", count: wordCount, word: hd });
              const tmp = dictData;
              dictData = {};
              return save(tmp);
            }
          }
        },
        () => {
          // finished
          let lastData;
          try {
            lastData = parser.flush();
          } catch (e) {
            reject(e);
          }
          if (lastData) {
            Object.assign(dictData, lastData);
            wordCount += Object.keys(lastData).length;
          }

          save(dictData).then(
            () => {
              resolve(wordCount);
            },
            (error) => {
              throw new Error(`Error: ${error}`);
            }
          );

          dictData = null;
        }
      );
    };
    reader.readAsText(file, encoding);
  });
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
  await save(dictData);
  return wordCount;
};

const save = (dictData: Record<string, string>): Promise<void> => {
  return storage.local.set(dictData);
};
