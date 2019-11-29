/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";
import swal from "sweetalert";
import res from "../logic/resource";

const EDITOR_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
  marginBottom: 20
};

const JsonEditor = props => {
  const [json, setJson] = React.useState(props.json);

  return (
    <div style={{ margin: 20 }}>
      <p>{res.get("aboutJsonEditor")}</p>
      <span
        style={{ cursor: "pointer", textDecoration: "underline", fontSize: "small" }}
        onClick={() => {
          navigator.clipboard.writeText(json);
        }}
      >
        {res.get("clipboardJson")}
      </span>

      <AceEditor
        mode="json"
        theme="solarized_light"
        onChange={value => setJson(value)}
        name="dialogTemplate"
        editorProps={{ $blockScrolling: true }}
        value={json}
        showPrintMargin={false}
        highlightActiveLine={false}
        style={{ ...EDITOR_STYLE, height: 700 }}
      />

      <button
        type="button"
        className="button-small button-black"
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={() => {
          try {
            const settings = JSON.parse(json);
            props.setState({ settings, jsonEditorOpened: false });
          } catch {
            swal({ text: res.get("JsonImportError"), icon: "warning" });
          }
        }}
      >
        {res.get("importJson")}
      </button>
      <button
        type="button"
        className="button-outline button-small button-black"
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={() => props.setState({ jsonEditorOpened: false })}
      >
        {res.get("closeJsonEditor")}
      </button>
    </div>
  );
};

export default JsonEditor;
