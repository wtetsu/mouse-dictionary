/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export type MouseDictionaryBasicSettings = {
  shortWordLength: number;
  cutShortWordDescription: number;
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

export type InitialPosition = "left" | "right" | "keep";

export type Scroll = "scroll" | "hidden";

export type MouseDictionarySettings = MouseDictionaryBasicSettings & MouseDictionaryAdvancedSettings;

export type Replace = {
  key: string;
  search: string;
  replace: string;
};

export type UpdateEventHandler = (
  statePatch: Record<string, any>,
  settingsPatch: Partial<MouseDictionarySettings>
) => void;
