/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type InitialPosition = "left" | "right" | "keep";

export type MouseDictionaryBasicSettings = {
  initialPosition: InitialPosition;
  backgroundColor: string;
  headFontColor: string;
  descFontColor: string;
  headFontSize: string;
  descFontSize: string;
  width: number;
  height: number;
  skipPdfConfirmation: boolean;
  dictionaryPacks: string[];
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
  domType: "shadow" | "light";
};

// Settings as stored (the dialog styles are JSON strings)
export type MouseDictionarySettings = MouseDictionaryBasicSettings & MouseDictionaryAdvancedSettings;

export type Replace = {
  key?: string;
  search: string;
  replace: string;
};

export type DialogStyles = Record<string, string | number>;

type DialogStyleFields = "normalDialogStyles" | "movingDialogStyles" | "hiddenDialogStyles";

// Settings used at runtime (the dialog styles are parsed; null if invalid)
export type ParsedSettings = Omit<MouseDictionarySettings, DialogStyleFields> & {
  [K in DialogStyleFields]: DialogStyles | null;
};
