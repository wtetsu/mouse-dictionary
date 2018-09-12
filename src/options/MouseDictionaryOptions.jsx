import React from "react";
import res from "./resources";
import SimpleSelect from "./SimpleSelect.jsx";

const Configs = props => {
  const config = props.config;
  const contentTemplate = config && config.contentTemplate;
  return (
    <div>
      <pre>{contentTemplate}</pre>
      <input defaultValue={contentTemplate} onChange={props.onChange} />

      <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
      <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
      <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
      <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
      <textarea value={contentTemplate} style={{ width: 800, height: 350 }} onChange={e => props.onChange("contentTemplate", e)} />
    </div>
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

      <Configs config={props.config} onChange={props.onChange} />
    </div>
  );
};

export default MouseDictionaryOptions;
