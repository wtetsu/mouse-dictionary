/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";
import immer from "immer";
import swal from "sweetalert";
import res from "../logic/resource";
import data from "../logic/data";

const EDITOR_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
};

const canReplace = (a, b) => {
  if (Array.isArray(a)) {
    return Array.isArray(b);
  }
  return typeof a === typeof b;
};

const JsonEditor = (props) => {
  const [json, setJson] = React.useState(() => {
    const initialValue = data.postProcessSettings(props.initialValue);
    return JSON.stringify(initialValue, null, 2);
  });

  const createSettings = (json) => {
    const newSettings = data.preProcessSettings(JSON.parse(json));
    const orgSettings = data.postProcessSettings(props.initialValue);
    return immer(orgSettings, (d) => {
      for (const key of Object.keys(d)) {
        if (!canReplace(d[key], newSettings[key])) {
          throw new Error();
        }
        d[key] = newSettings[key];
      }
    });
  };

  return (
    <div style={{ margin: 20 }}>
      <p>{res.get("aboutJsonEditor")}</p>
      <button
        type="button"
        className="button-small button-black"
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={() => {
          try {
            const settings = createSettings(json);
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

      <AceEditor
        mode="json"
        theme="solarized_light"
        onChange={(value) => setJson(value)}
        name="dialogTemplate"
        editorProps={{ $blockScrolling: true }}
        value={json}
        showPrintMargin={false}
        highlightActiveLine={false}
        style={{ ...EDITOR_STYLE, height: 700 }}
      />
      <span
        style={{ cursor: "pointer", textDecoration: "underline", fontSize: "small" }}
        onClick={() => {
          navigator.clipboard.writeText(json);
        }}
      >
        {res.get("clipboardJson")}
      </span>
    </div>
  );
};

export default JsonEditor;
