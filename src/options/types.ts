/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// Settings types are shared with the main feature
import type { MouseDictionarySettings } from "../main/types";

export type {
  InitialPosition,
  MouseDictionaryAdvancedSettings,
  MouseDictionaryBasicSettings,
  MouseDictionarySettings,
  Replace,
} from "../main/types";

export type UpdateEventHandler = (
  statePatch: Record<string, any> | undefined,
  settingsPatch: Partial<MouseDictionarySettings> | undefined,
) => void;

type EnvForMain = {
  enableWindowStatusSave: boolean;
  enableUserSettings: boolean;
};

type EnvSupport = {
  localGetBytesInUse: boolean;
};

type EnvForOptions = {
  registerRecordsAtOnce: number;
  support: EnvSupport;
};

export type Env = EnvForMain & EnvForOptions;

export type DictionaryFileEncoding = "Shift_JIS" | "UTF-8" | "UTF-16";
export type DictionaryFileFormat = "EIJIRO" | "TSV" | "PDIC_LINE" | "JSON";

export type DictionaryFile = {
  file: File | undefined;
  encoding: DictionaryFileEncoding;
  format: DictionaryFileFormat;
};

// A bundled dictionary pack (one language pair), listed in the generated
// /data/packs.json manifest; `metaFile` holds its shard list.
export type DictionaryPack = {
  id: string;
  metaFile: string;
  label?: string;
};

export type ExternalLinks = {
  windowManipulation: string;
  downloadDictData: string;
  setKeyboardShortcuts: string;
};
