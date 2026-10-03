/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { env, storage } from "../extern";
import type { DictionaryFileEncoding, DictionaryFileFormat, DictionaryPack } from "../types";
import { EijiroParser, JsonDictParser, SimpleDictParser } from "./dictparser";
import { LineReader } from "./linereader";
import { DEFAULT_PACK_IDS, loadPackRegistry, mergeDescriptions, packIdsFromSettings } from "./packs";

const KEY_INSTALLED_PACKS = "***** dict_packs *****";

type ProgressCallback = (wordCount: number, progress: string) => void;

type DictionaryInformation = {
  files: string[];
};

type Callback = (param: CallbackParam) => void;
type ReadingCallback = (param: ReadingCallbackParam) => void;
// type LoadingCallback = (param: LoadingCallbackParam) => void;

export type CallbackParam = ReadingCallbackParam | LoadingCallbackParam;

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

  let dictData: Record<string, string> = {};
  let wordCount = 0;

  const parser = createDictParser(loadParam.format);
  while (reader.next()) {
    const hd = parser.addLine(reader.getLine());
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
        done(<string>e.target?.result);
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
  return await registerPacks(DEFAULT_PACK_IDS, fnProgress);
};

// Pack registry from the generated manifest; small static file, fetched on
// the few user-triggered dictionary operations (no caching needed).
export const getPacks = async (): Promise<DictionaryPack[]> => {
  return await loadPackRegistry();
};

// Register one dictionary pack (shards listed in its metadata file).
export const registerPack = async (pack: DictionaryPack, fnProgress: ProgressCallback): Promise<number> => {
  const dict = (await loadJsonFile(pack.metaFile)) as DictionaryInformation;
  let wordCount = 0;
  for (let i = 0; i < dict.files.length; i++) {
    wordCount += await registerDict(dict.files[i]);
    fnProgress(wordCount, `${i + 1}/${dict.files.length}`);
  }
  return wordCount;
};

// Register multiple packs, merging descriptions when headwords collide.
// Unknown ids are ignored (the id may belong to a pack not bundled here).
export const registerPacks = async (packIds: string[], fnProgress: ProgressCallback): Promise<number> => {
  const registry = await getPacks();
  const packs = registry.filter((p) => packIds.includes(p.id));
  let wordCount = 0;
  for (const pack of packs) {
    wordCount += await registerPack(pack, fnProgress);
  }
  return wordCount;
};

// Synchronize the storage with the desired pack set: drop keys that no
// selected pack provides, then (re-)register every selected pack so values
// are rebuilt cleanly from pack data.
export const syncInstalledPacks = async (
  desiredIds: string[],
  fnProgress: ProgressCallback,
): Promise<{ removed: number; registered: number }> => {
  const registry = await getPacks();
  const desired = packIdsFromSettings(registry, desiredIds);
  const installed = await getInstalledPacks();

  let removed = 0;
  const stale = installed.filter((id) => !desired.includes(id));
  for (const id of stale) {
    // resolve stale ids against the current registry first; a pack removed
    // from the manifest keeps its metaFile convention so we can still drop it
    const pack = registry.find((p) => p.id === id) ?? { id, metaFile: `/data/dict-${id}.json` };
    try {
      removed += await unregisterPack(pack);
    } catch {
      // metadata for an uninstalled pack is gone; keys stay until overwrite
    }
  }

  const registered = await registerPacks(desired, fnProgress);
  await storage.local.set({ [KEY_INSTALLED_PACKS]: desired });
  return { removed, registered };
};

const unregisterPack = async (pack: DictionaryPack): Promise<number> => {
  const dict = (await loadJsonFile(pack.metaFile)) as DictionaryInformation;
  let count = 0;
  for (const file of dict.files) {
    const data = await loadJsonFile(file);
    const keys = Object.keys(data);
    await storage.local.remove(keys);
    count += keys.length;
  }
  return count;
};

export const getInstalledPacks = async (): Promise<string[]> => {
  const packs = await storage.local.pick<string[]>(KEY_INSTALLED_PACKS);
  return Array.isArray(packs) ? packs : [];
};

const loadJsonFile = async (fname: string): Promise<Record<string, any>> => {
  const url = chrome.runtime.getURL(fname);
  const response = await fetch(url);
  return response.json();
};

const registerDict = async (fname: string): Promise<number> => {
  const dictData = await loadJsonFile(fname);
  const wordCount = Object.keys(dictData).length;
  // Merge with values already in storage (another pack may own the same headword).
  const merged: Record<string, string> = {};
  const existing = await storage.local.get(Object.keys(dictData));
  for (const [head, desc] of Object.entries(dictData)) {
    // Own-property check only: keys like "constructor" hit Object.prototype
    // through the chain and would leak built-in functions as "existing" values.
    const prev = Object.hasOwn(existing, head) ? existing[head] : undefined;
    merged[head] = mergeDescriptions(prev, desc);
  }
  await storage.local.set(merged);
  return wordCount;
};
