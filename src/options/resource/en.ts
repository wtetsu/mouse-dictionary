/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

/**
 * Author: wtetsu
 * Corrector: David, Macropyre, Akarumbra
 */

import { TextResource } from "./types";

const EnglishTextResource: TextResource = {
  dictDataEncoding: "Character set of dictionary data:",
  dictDataFormat: "Format of dictionary data:",
  readDictData: "Load dictionary data:",

  selectDictFile: "Select dictionary data",
  progressRegister: "{{count}} words have been registered({{progress}})",
  finishRegister: "Loading has finished({{count}} words)",
  clearAllDictData: "Are you sure you want to clear all the dictionary data?",
  finishedClear: "All the dictionary data has been removed",
  dictDataUsage: "{{size}} kilobytes used",
  confirmLoadInitialDict: "There is no dictionary data yet.\nDo you want to register free dictionary data?",
  confirmReloadInitialDict: "Are you sure you want to reload the default dictionary data?",
  fileMayNotBeShiftJis: "The selected file may not be Shift-JIS-encoded. Are you sure you want to import the file?",

  formatEijiroText: "EIJIRO text data",
  formatTsv: "TSV(tab-separated text data)",
  formatPdicOneLine: "PDIC",
  formatJson: "JSON",

  positionLeft: "Left",
  positionRight: "Right",
  positionKeep: "Restore the last position and size",

  scrollOff: "Not available",
  scrollOn: "Available",

  saveSettings: "Save settings",
  defaultSettings: "Reset to default",
  finishSaving: "Saving has finished",

  openBasicSettings: "Open settings",
  closeBasicSettings: "Close settings",
  openAdvancedSettings: "Open advanced settings",
  closeAdvancedSettings: "Close advanced settings",

  basicSettings: "Basic settings",
  previewText: "Text for preview",
  abbreviateShortWordDesc: "Truncate short word descriptions",
  abbreviateShortWordDesc0: "Truncate",
  abbreviateShortWordDesc1: "-letter or less word descriptions into",
  abbreviateShortWordDesc2: "characters",

  initialSize: "Initial size",
  width: "Width",
  height: "Height",
  initialPosition: "Initial position",
  scrollBar: "Scroll bar",
  dictionaryData: "Dictionary data",
  colorAndFont: "Font size and color",
  headFont: "Header font",
  descFont: "Description font",
  background: "Background",
  replaceRules: "Rules to replace text",
  replaceRule1: " ",
  replaceRule2: " ",
  advancedSettings: "Advanced settings",
  htmlTemplate: "HTML templates",
  htmlTemplateWindow: "Mouse Dictionary window frame",
  htmlTemplateDesc: "Description frame",
  htmlTemplateDescText: "Description",
  styles: "Style of each state",
  stylesActive: "Style(active)",
  stylesMoving: "Style(moving)",
  stylesInactive: "Style(not active)",
  lookupWithCapitalized: "Lookup both capitalized and non-capitalized headers",
  parseWordsLimit: "Number of words to parse at once",
  add: "Add",
  loadSelectedFile: "LOAD",
  clearLoadedData: "CLEAR",
  loadInitialDict: "Reload default dictionary data",
  downloadDictData: "Download additional dictionary data",
  setKeyboardShortcuts: "Set keyboard shortcuts",
  openPdfViewer: "PDF viewer",
  openJsonEditor: "Open JSON editor",
  closeJsonEditor: "Cancel",
  importJson: "Apply JSON to settings",
  JsonImportError: "Invalid JSON",
  aboutJsonEditor:
    "This is JSON data which expresses the whole Mouse Dictionary's settings. Please use it for backup, sharing and so forth.",
  skipPdfConfirmation: "Skip PDF download confirmation",
  pdfUrlPattern: "Override PDF document judgment (regular expressions for URL)",
};

export { EnglishTextResource };
