/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// This resource file is separated from the file of the options UI screen,
// in order to make the main feature lighter and faster.

const resources = {
  ja: {
    doesntSupportFrame: "Mouse Dictionaryは、フレームのあるページで使用することはできません。",
  },
  en: {
    doesntSupportFrame: "Mouse Dictionary doesn't support frame pages.",
  },
};

if (BROWSER === "FIREFOX") {
  resources.ja.needToPrepareDict =
    "初めに辞書データをロードしてください(拡張のアイコンを右クリック→「拡張機能を管理」→「...」をクリック→「オプション」)";
  resources.en.needToPrepareDict =
    'Please load dictionary data first. Right click on the extension icon, select "Manage Extension", click "…", and select "Options"';
} else {
  resources.ja.needToPrepareDict = "初めに辞書データをロードしてください(拡張のアイコンを右クリック→「オプション」)";
  resources.en.needToPrepareDict =
    'Please load dictionary data first. Right click on the extension icon and select "Options"';
}

const decideLanguage = () => {
  let result = "en";
  const languages = navigator.languages;
  if (!languages) {
    return result;
  }
  const validLanguages = Object.keys(resources);
  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i].toLowerCase().split("-")[0];
    if (validLanguages.includes(lang)) {
      result = lang;
      break;
    }
  }
  return result;
};

export default (key) => {
  const lang = decideLanguage();
  const res = resources[lang];
  return res[key] ?? null;
};
