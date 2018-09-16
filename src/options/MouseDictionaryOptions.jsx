import React from "react";
import { TwitterPicker } from "react-color";
import res from "./resources";
import SimpleSelect from "./SimpleSelect.jsx";
import env from "../env";

const UserSettings = props => {
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

  const bgColors = ["#F0F0F0", "#FAFAFA", "#FFFFFF"];
  const titleColors = ["#000000", "#ABB8C3", "#FFFFFF"];
  const headColors = ["#000000", "#ABB8C3", "#000088"];
  const descColors = ["#101010", "#A0A0A0", "#000088"];

  const fontSizes = ["xx-small", "x-small", "smaller", "small", "medium", "large", "larger", "x-large", "xx-large"];

  const positions = [];
  positions.push({
    name: res("positionLeft"),
    value: "left"
  });
  positions.push({
    name: res("positionRight"),
    value: "right"
  });

  if (!env.disableKeepingWindowStatus) {
    positions.push({
      name: res("positionKeep"),
      value: "keep"
    });
  }

  const positionOptions = positions.map(p => {
    return (
      <option key={p.value} value={p.value}>
        {p.name}
      </option>
    );
  });

  const fontSizeOptions = fontSizes.map(f => {
    return (
      <option key={f} value={f}>
        {f}
      </option>
    );
  });

  return (
    <form>
      <fieldset>
        <h2>各種設定</h2>

        <input type="button" value="保存する" onClick={props.onClickSaveSettings.bind(this)} />
        <span> </span>
        <input type="button" value="初期状態に戻す" onClick={props.onClickBackToDefaultSettings.bind(this)} />

        <hr />

        <label>お試し用テキスト</label>
        <input type="text" value={props.trialText} onChange={props.onChangeState.bind(this, "trialText")} />

        <label>短い単語の切り詰め</label>
        <input type="number" value={settings.shortWordLength} onChange={props.onChange.bind(this, "shortWordLength")} style={{ width: 60 }} />
        <span> 文字以内の短い単語は、説明を </span>
        <input
          type="number"
          value={settings.cutShortWordDescription}
          onChange={props.onChange.bind(this, "cutShortWordDescription")}
          style={{ width: 60 }}
        />
        <span> 文字に切り詰める</span>
        <label>初期サイズ</label>
        <span>幅:</span>
        <input type="number" value={settings.width} onChange={props.onChange.bind(this, "width")} style={{ width: 90 }} />
        <span> 高さ:</span>
        <input type="number" value={settings.height} onChange={props.onChange.bind(this, "height")} style={{ width: 90 }} />
        <label>初期表示位置</label>
        <select value={settings.initialPosition} onChange={props.onChange.bind(this, "initialPosition")} style={{ width: 250 }}>
          {positionOptions}
        </select>
        <hr />
        <h2>サイズや色等</h2>
        <label>見出し文字サイズ</label>
        <select value={settings.headFontSize} onChange={props.onChange.bind(this, "headFontSize")} style={{ width: 250 }}>
          {fontSizeOptions}
        </select>
        <label>説明文字サイズ</label>
        <select value={settings.descFontSize} onChange={props.onChange.bind(this, "descFontSize")} style={{ width: 250 }}>
          {fontSizeOptions}
        </select>
        <label>背景色</label>
        <TwitterPicker
          color={settings.backgroundColor}
          colors={bgColors}
          onChangeComplete={props.onChangeColorSettings.bind(this, "backgroundColor")}
        />
        <label>タイトルバー色</label>
        <TwitterPicker
          color={settings.titlebarBackgroundColor}
          colors={titleColors}
          onChangeComplete={props.onChangeColorSettings.bind(this, "titlebarBackgroundColor")}
        />
        <label>文字色(見出し)</label>
        <TwitterPicker
          color={settings.headFontColor}
          colors={headColors}
          onChangeComplete={props.onChangeColorSettings.bind(this, "headFontColor")}
        />
        <label>文字色(説明)</label>
        <TwitterPicker
          color={settings.descFontColor}
          colors={descColors}
          onChangeComplete={props.onChangeColorSettings.bind(this, "descFontColor")}
        />
        <hr />
        <h2>HTMLテンプレート</h2>
        <label>Mouse Dictionaryウィンドウ全体</label>
        <textarea value={dialogTemplate} style={{ width: 800, height: 200 }} onChange={e => props.onChange("dialogTemplate", e)} />
        <label>タイトルバー</label>
        <textarea value={titlebarTemplate} style={{ width: 800, height: 100 }} onChange={e => props.onChange("titlebarTemplate", e)} />
        <label>説明全体を囲う領域</label>
        <textarea value={contentWrapperTemplate} style={{ width: 800, height: 30 }} onChange={e => props.onChange("contentWrapperTemplate", e)} />
        <label>説明テキスト</label>
        <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />

        <h2>状態ごとのスタイル</h2>
        <label>スタイル:アクティブ</label>
        <textarea value={normalDialogStyles} style={{ width: 800, height: 90 }} onChange={e => props.onChange("normalDialogStyles", e)} />
        <label>スタイル:移動中</label>
        <textarea value={movingDialogStyles} style={{ width: 800, height: 90 }} onChange={e => props.onChange("movingDialogStyles", e)} />
        <label>スタイル:非アクティブ</label>
        <textarea value={hiddenDialogStyles} style={{ width: 800, height: 90 }} onChange={e => props.onChange("hiddenDialogStyles", e)} />
        <hr />

        <h2>置換ルール</h2>
        {replaceRulesList}
        <button type="button" onClick={props.onClickAddReplaceRule}>
          追加
        </button>
      </fieldset>
    </form>
  );
};

const MouseDictionaryOptions = props => {
  const ENCODINGS = [{ id: "Shift-JIS", name: "Shift-JIS" }, { id: "UTF-8", name: "UTF-8" }, { id: "UTF-16", name: "UTF-16" }];

  const FORMATS = [
    { id: "EIJIRO", name: res("formatEijiroText") },
    { id: "TSV", name: res("formatTsv") },
    { id: "PDIC_LINE", name: res("formatPdicOneLine") },
    { id: "JSON", name: res("formatJson") }
  ];

  return (
    <div>
      <label>{res("dictDataEncoding")}</label>
      <SimpleSelect name="encoding" value={props.encoding} options={ENCODINGS} onChange={props.onChange} />

      <label>{res("dictDataFormat")}</label>
      <SimpleSelect name="format" value={props.format} options={FORMATS} onChange={props.onChange} />

      <label>{res("readDictData")}</label>

      <input type="file" id="dictdata" />

      <br />
      <input type="button" value="load" style={{ marginRight: 5 }} onClick={props.doLoad} disabled={props.busy ? "disabled" : null} />
      <input type="button" value="clear" style={{ marginRight: 5 }} onClick={props.doClear} disabled={props.busy ? "disabled" : null} />
      <img src="loading.gif" width="32" height="32" style={{ verticalAlign: "middle", display: props.busy ? "inline" : "none" }} />

      <div>{props.progress}</div>
      <div style={{ fontSize: "75%" }}>{props.dictDataUsage}</div>

      <hr />

      <UserSettings
        settings={props.settings}
        trialText={props.trialText}
        onChange={props.onChangeSettings}
        onChangeState={props.onChangeState}
        onChangeColorSettings={props.onChangeColorSettings}
        onClickAddReplaceRule={props.onClickAddReplaceRule}
        onChangeReplaceRule={props.onChangeReplaceRule}
        onClickSaveSettings={props.onClickSaveSettings}
        onClickBackToDefaultSettings={props.onClickBackToDefaultSettings}
      />
    </div>
  );
};

export default MouseDictionaryOptions;
