import React from "react";
import res from "./resources";
import SimpleSelect from "./SimpleSelect.jsx";

const UserSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }
  const contentTemplate = (settings && settings.contentTemplate) || "";
  return (
    <form>
      <fieldset>
        <label>背景色</label>
        <input type="text" defaultValue={settings.backgroundColor} onChange={props.onChange.bind(this, "backgroundColor")} />
        <label>タイトルバー背景色</label>
        <input type="text" defaultValue={settings.titlebarBackgroundColor} onChange={props.onChange.bind(this, "titlebarBackgroundColor")} />

        <pre>{contentTemplate}</pre>

        <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
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

      <label>お試し用テキスト</label>
      <input type="text" value={props.trialText} onChange={e => props.onChange("trialText", e)} />
      <button type="button" onClick={props.doUpdateTrialWindow}>
        お試し表示の更新
      </button>

      <UserSettings settings={props.settings} onChange={props.onChangeSettings} />
    </div>
  );
};

export default MouseDictionaryOptions;
