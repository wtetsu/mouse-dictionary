/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";

const AdvancedSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }

  const titlebarTemplate = (settings && settings.titlebarTemplate) || "";
  const contentWrapperTemplate = (settings && settings.contentWrapperTemplate) || "";
  const dialogTemplate = (settings && settings.dialogTemplate) || "";
  const contentTemplate = (settings && settings.contentTemplate) || "";

  const normalDialogStyles = (settings && settings.normalDialogStyles) || "";
  const movingDialogStyles = (settings && settings.movingDialogStyles) || "";
  const hiddenDialogStyles = (settings && settings.hiddenDialogStyles) || "";

  const replaceRules = (settings && settings.replaceRules) || [];
  const replaceRulesList = replaceRules.map((r, i) => {
    return (
      <div key={`replaceRule.search.${i}`}>
        <input
          type="text"
          name={`replaceRule.search.${i}`}
          key={`replaceRule.search.${i}`}
          defaultValue={r.search}
          style={{ width: 300 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>を</span>
        <input
          type="text"
          name={`replaceRule.replace.${i}`}
          key={`replaceRule.replace.${i}`}
          defaultValue={r.replace}
          style={{ width: 300 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>に置換</span>
      </div>
    );
  });

  return (
    <form>
      <fieldset>
        <h2>上級者設定</h2>
        <hr />
        <h3>HTMLテンプレート</h3>
        <label>Mouse Dictionaryウィンドウ全体</label>
        <textarea
          value={dialogTemplate}
          style={{ width: 800, height: 200 }}
          onChange={e => props.onChange("dialogTemplate", e)}
        />
        <label>タイトルバー</label>
        <textarea
          value={titlebarTemplate}
          style={{ width: 800, height: 110 }}
          onChange={e => props.onChange("titlebarTemplate", e)}
        />
        <label>説明全体を囲う領域</label>
        <textarea
          value={contentWrapperTemplate}
          style={{ width: 800, height: 30 }}
          onChange={e => props.onChange("contentWrapperTemplate", e)}
        />
        <label>説明テキスト</label>
        <textarea
          value={contentTemplate}
          style={{ width: 800, height: 350 }}
          onChange={e => props.onChange("contentTemplate", e)}
        />

        <h3>状態ごとのスタイル</h3>
        <label>スタイル:アクティブ</label>
        <textarea
          value={normalDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("normalDialogStyles", e)}
        />
        <label>スタイル:移動中</label>
        <textarea
          value={movingDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("movingDialogStyles", e)}
        />
        <label>スタイル:非アクティブ</label>
        <textarea
          value={hiddenDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("hiddenDialogStyles", e)}
        />
        <hr />

        <h3>置換ルール</h3>
        {replaceRulesList}
        <button type="button" onClick={props.onClickAddReplaceRule}>
          追加
        </button>
      </fieldset>
    </form>
  );
};

export default AdvancedSettings;
