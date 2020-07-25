/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";
import immer from "immer";
import { Button } from "./Button";
import { res, data, message } from "../logic";
import { MouseDictionarySettings } from "../types";

const EDITOR_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
};

const canReplace = (a: number | string | boolean | [], b: number | string | boolean | []) => {
  if (Array.isArray(a)) {
    return Array.isArray(b);
  }
  return typeof a === typeof b;
};

type Props = {
  initialValue: MouseDictionarySettings;
  onChange: (value: MouseDictionarySettings) => void;
};

type JsonEditorUpdateEvent = {
  payload: { settings?: MouseDictionarySettings; state?: Record<string, any> };
};

export const JsonEditor: React.FC<Props> = (props) => {
  const [json, setJson] = React.useState(() => {
    const initialValue = data.postProcessSettings(props.initialValue);
    return JSON.stringify(initialValue, null, 2);
  });

  const createSettings = (json: string): MouseDictionarySettings => {
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

  const updateAndClose = (json: string) => {
    try {
      const settings = createSettings(json);
      props.onChange(settings);
    } catch {
      message.warn(res.get("JsonImportError"));
    }
  };

  const close = () => {
    props.onChange(null);
  };

  return (
    <div style={{ margin: 20 }}>
      <p>{res.get("aboutJsonEditor")}</p>
      <Button type="cancel" text={res.get("closeJsonEditor")} onClick={() => close()} />
      <Button type="json" text={res.get("importJson")} onClick={() => updateAndClose(json)} />

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
        onClick={() => navigator.clipboard.writeText(json)}
      >
        {res.get("clipboardJson")}
      </span>
    </div>
  );
};
