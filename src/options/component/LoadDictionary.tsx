/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import SimpleSelect from "./SimpleSelect";
import res from "../logic/resource";
import env from "../../settings/env";

const LoadDictionary = (props) => {
  const ENCODINGS = [
    { id: "Shift-JIS", name: "Shift-JIS" },
    { id: "UTF-8", name: "UTF-8" },
    { id: "UTF-16", name: "UTF-16" },
  ];

  const FORMATS = [
    { id: "EIJIRO", name: res.get("formatEijiroText") },
    { id: "TSV", name: res.get("formatTsv") },
    { id: "PDIC_LINE", name: res.get("formatPdicOneLine") },
    { id: "JSON", name: res.get("formatJson") },
  ];

  const changeState = (name, e) => {
    props.changeState(name, e.target.value);
  };

  return (
    <div>
      <label>{res.get("dictDataEncoding")}</label>
      <SimpleSelect name="encoding" value={props.encoding} options={ENCODINGS} onChange={changeState} />
      <label>{res.get("dictDataFormat")}</label>
      <SimpleSelect name="format" value={props.format} options={FORMATS} onChange={changeState} />
      <label>{res.get("readDictData")}</label>
      <input type="file" id="dictdata" />
      <br />
      <input
        type="button"
        value={res.get("loadSelectedFile")}
        style={{ marginRight: 5 }}
        onClick={props.doLoad}
        disabled={props.busy ? "disabled" : null}
      />
      {!env.disableClearDataButton && (
        <input
          type="button"
          value={res.get("clearLoadedData")}
          style={{ marginRight: 5 }}
          onClick={props.doClear}
          disabled={props.busy ? "disabled" : null}
        />
      )}
      <img
        src="loading.gif"
        width="32"
        height="32"
        style={{ verticalAlign: "middle", display: props.busy ? "inline" : "none" }}
      />
      <div style={{ fontSize: "75%" }}>
        {props.dictDataUsage && <div>{res.get("dictDataUsage", props.dictDataUsage)}</div>}
        <div>
          <span>{props.progress}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadDictionary;
