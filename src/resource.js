import sprintf from "sprintf-js";

const LANG = "ja";

const templates = {
  ja: {
    selectDictFile: "辞書ファイルを選択してください。",
    progressRegister: "%d語登録(%s)",
    finishRegister: "登録完了(%d語)",
    clearAllDictData: "登録した辞書データを削除します。",
    finishedClear: "辞書データを削除しました",
    dictDataUsage: "%sKB使用中",
    confirmLoadInitialDict: "まだ辞書データが無いようです。\nフリー辞書のデータを自動登録します。"
  }
};

export default (key, ...params) => {
  let r;
  const lang = templates[LANG];
  const tmpl = lang[key];
  if (tmpl) {
    const sprintfParams = [tmpl].concat(params);
    r = sprintf.sprintf(...sprintfParams);
  } else {
    r = "";
  }
  return r;
};
