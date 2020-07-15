/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */
export type MouseDictionaryBasicSettings = {
  shortWordLength: number;
  cutShortWordDescription: number;
  initialPosition: "right" | "left";
  scroll: "scroll";
  backgroundColor: string;
  headFontColor: string;
  descFontColor: string;
  headFontSize: string;
  descFontSize: string;
  width: number;
  height: number;
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
};

export type MouseDictionarySettings = MouseDictionaryBasicSettings & MouseDictionaryAdvancedSettings;

export type Replace = {
  key: string;
  search: string;
  replace: string;
};

export type UpdateEventHandler = (statePatch: any, settingsPatch: Partial<MouseDictionarySettings>) => void;
