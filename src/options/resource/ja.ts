/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { TextResource } from "./types";

const JapaneseTextResource: TextResource = {
  dictDataEncoding: "辞書データの文字コード：",
  dictDataFormat: "辞書データの形式：",
  readDictData: "辞書データの読み込み：",

  selectDictFile: "辞書ファイルを選択してください。",
  progressRegister: "{{count}}語登録({{progress}})",
  finishRegister: "登録完了({{count}}語)",
  clearAllDictData: "登録した辞書データを削除します。",
  finishedClear: "辞書データを削除しました",
  dictDataUsage: "{{size}}KB使用中",
  confirmLoadInitialDict: "まだ辞書データが無いようです。\nフリー辞書のデータを自動登録します。",
  confirmReloadInitialDict: "デフォルト辞書データを再登録します",
  fileMayNotBeShiftJis: "このファイルはShift-JISではないかもしれません。インポート処理を実行しますか？",

  formatEijiroText: "英辞郎テキストデータ(■見出し)",
  formatTsv: "TSV(タブ区切り)",
  formatPdicOneLine: "PDIC1行",
  formatJson: "JSON",

  positionLeft: "左",
  positionRight: "右",
  positionKeep: "前回位置とサイズを記憶",

  scrollOff: "なし",
  scrollOn: "あり",

  saveSettings: "設定を保存する",
  defaultSettings: "初期状態に戻す",
  finishSaving: "保存しました。",

  openBasicSettings: "設定を開く",
  closeBasicSettings: "設定を閉じる",
  openAdvancedSettings: "上級設定を開く",
  closeAdvancedSettings: "上級設定を閉じる",

  basicSettings: "基本設定",
  previewText: "お試し用テキスト",
  abbreviateShortWordDesc: "短い単語の説明を省略",
  abbreviateShortWordDesc0: " ",
  abbreviateShortWordDesc1: "文字以内の短い単語は、説明を",
  abbreviateShortWordDesc2: "文字に切り詰める",

  initialSize: "初期サイズ",
  width: "幅",
  height: "高さ",
  initialPosition: "初期表示位置",
  scrollBar: "スクロールバー",
  dictionaryData: "辞書データ",
  colorAndFont: "色と文字サイズ",
  background: "背景",
  headFont: "見出し",
  descFont: "説明",
  replaceRules: "文字列置換ルール",
  replaceRule1: "を",
  replaceRule2: "に置換",
  advancedSettings: "上級者設定",
  htmlTemplate: "HTMLテンプレート",
  htmlTemplateWindow: "Mouse Dictionaryウィンドウ全体",
  htmlTemplateDesc: "説明全体を囲う領域",
  htmlTemplateDescText: "説明テキスト",
  styles: "状態ごとのスタイル",
  stylesActive: "スタイル:アクティブ",
  stylesMoving: "スタイル:移動中",
  stylesInactive: "スタイル:非アクティブ",
  lookupWithCapitalized: "大文字の辞書データも参照する",
  parseWordsLimit: "一度に解析する単語数",
  add: "追加",
  loadSelectedFile: "LOAD",
  clearLoadedData: "CLEAR",
  loadInitialDict: "デフォルト辞書データの再ロード",
  downloadDictData: "追加辞書データをダウンロードする",
  setKeyboardShortcuts: "キーボードショートカットを設定する",
  openPdfViewer: "PDFビューア",
  openJsonEditor: "JSONエディタを開く",
  closeJsonEditor: "キャンセル",
  importJson: "JSONを設定に反映",
  JsonImportError: "正しいJSONデータになっていません",
  aboutJsonEditor: "Mouse Dictionary設定全体のJSONデータです。バックアップや共有にご利用ください ※辞書データは含みません",
  skipPdfConfirmation: "PDFファイルのダウンロード確認を省略する",
  pdfUrlPattern: "PDFドキュメント判定の上書き(URLに対する正規表現)",
};

export { JapaneseTextResource };
