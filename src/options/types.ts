/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type InitialPosition = "left" | "right" | "keep";

export type Scroll = "scroll" | "hidden";

export type MouseDictionaryBasicSettings = {
  initialPosition: InitialPosition;
  scroll: Scroll;
  backgroundColor: string;
  headFontColor: string;
  descFontColor: string;
  headFontSize: string;
  descFontSize: string;
  width: number;
  height: number;
  skipPdfConfirmation: boolean;
};

export type MouseDictionaryAdvancedSettings = {
  shortWordLength: number;
  cutShortWordDescription: number;
  lookupWithCapitalized: boolean;
  parseWordsLimit: number;
  replaceRules: Replace[];
  normalDialogStyles: string;
  movingDialogStyles: string;
  hiddenDialogStyles: string;
  contentWrapperTemplate: string;
  dialogTemplate: string;
  contentTemplate: string;
  pdfUrl: string;
};

export type MouseDictionarySettings = MouseDictionaryBasicSettings & MouseDictionaryAdvancedSettings;

export type Replace = {
  key: string;
  search: string;
  replace: string;
};

export type UpdateEventHandler = (statePatch: Record<string, any>, settingsPatch: Partial<MouseDictionarySettings>) => void;

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

export type DictionaryFileEncoding = "Shift-JIS" | "UTF-8" | "UTF-16";
export type DictionaryFileFormat = "EIJIRO" | "TSV" | "PDIC_LINE" | "JSON";

export type DictionaryFile = {
  file: File;
  encoding: DictionaryFileEncoding;
  format: DictionaryFileFormat;
};

export type ExternalLinks = {
  windowManipulation: string;
  downloadDictData: string;
  setKeyboardShortcuts: string;
};

export declare const BROWSER: "CHROME" | "FIREFOX" | "SAFARI";
