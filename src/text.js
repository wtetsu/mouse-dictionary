import _ from "lodash";
import sprintf from "sprintf-js";

const LANG = "ja";

const templates = {
  ja: {
    selectDictFile: "辞書ファイルを選択してください。",
    progressRegister: "%d語登録(%s)",
    finishRegister: "登録完了(%d語)",
    clearAllDictData: "登録した辞書データを削除します。",
    finishedClear: "辞書データを削除しました"
  }
};

const sprintfWithArgs = _.spread(sprintf.sprintf);

export default (key, ...params) => {
  let r;
  const lang = templates[LANG];
  const tmpl = lang[key];
  if (tmpl) {
    r = sprintfWithArgs(_.concat([tmpl], params));
  } else {
    r = "";
  }
  return r;
};
