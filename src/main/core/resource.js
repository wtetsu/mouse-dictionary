/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

// This resource file is separated from the file of the options UI screen,
// in order to make the main feature lighter and faster.

import utils from "../lib/utils";

const resources = {
  ja: {
    continueProcessingPdf:
      "このPDFファイルをダウンロードし、Mouse Dictionaryの内部ビューアで表示します。よろしいですか？\n(設定画面で、この確認ダイアログ表示をオフにすることもできます)",
    doesntSupportFrame: "Mouse Dictionaryは、フレームのあるページで使用することはできません。",
    downloadingPdf: "📘ダウンロード中...",
    preparingPdf: "📘PDFビューア準備中...",
    nonPdf: "PDFファイルではないようです。処理を中断しました。",
    cannotFetchLocalPdf:
      "⛔Mouse DictionaryはローカルにあるPDFファイル上では起動できません。オプション画面から開けるPDFビューアをご利用ください。",
  },
  en: {
    continueProcessingPdf:
      "Are you sure you want to download this PDF file and view it using Mouse Dictionary's internal viewer?\n(You can disable this confirmation by changing settings)",
    doesntSupportFrame: "Mouse Dictionary doesn't support frame pages.",
    downloadingPdf: "📘Downloading...",
    preparingPdf: "📘Preparing PDF viewer...",
    nonPdf: "This is not a PDF document.",
    cannotFetchLocalPdf: "⛔Mouse Dictionary can't launch on local PDFs. Use the PDF viewer from the options screen.",
  },
};

// Build process removes unrelated messages
if (BROWSER === "chrome") {
  resources.ja.needToPrepareDict = "辞書データをロードしてください(拡張のアイコンを右クリック→「オプション」)";
  resources.en.needToPrepareDict =
    'Please load dictionary data first. Right click on the extension icon and select "Options"';
}

if (BROWSER === "firefox") {
  resources.ja.needToPrepareDict =
    "辞書データをロードしてください(拡張のアイコンを右クリック→「拡張機能を管理」→「...」をクリック→「オプション」)";
  resources.en.needToPrepareDict =
    'Please load dictionary data first. Right click on the extension icon, select "Manage Extension", click "…", and select "Options"';
}

if (BROWSER === "safari") {
  resources.ja.needToPrepareDict = "辞書データをロードしてください(拡張のアイコンを右クリック→「拡張機能」→「設定」)";
  resources.en.needToPrepareDict =
    'Please load dictionary data first. Right click on the extension icon, select "Extensions" tab, and select "Preferences"';
}

const decideLanguage = () => utils.pickLanguage(navigator.languages, Object.keys(resources));

export default (key) => {
  const lang = decideLanguage();
  const res = resources[lang];
  return res[key] ?? null;
};
