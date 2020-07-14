export type MouseDictionarySettings = {
  shortWordLength?: number;
  cutShortWordDescription?: number;
  parseWordsLimit?: number;
  lookupWithCapitalized?: boolean;
  initialPosition?: "right" | "left";
  scroll?: "scroll";
  backgroundColor?: string;
  headFontColor?: string;
  descFontColor?: string;
  headFontSize?: string;
  descFontSize?: string;
  width?: number;
  height?: number;
  replaceRules?: Replace[];
  normalDialogStyles?: string;
  movingDialogStyles?: string;
  hiddenDialogStyles?: string;
  contentWrapperTemplate?: string;
  dialogTemplate?: string;
  contentTemplate?: string;
};

export type Replace = {
  key: string;
  search: string;
  replace: string;
};

export type UpdateEventHandler = (statePatch: any, settingsPatch: MouseDictionarySettings) => void;
