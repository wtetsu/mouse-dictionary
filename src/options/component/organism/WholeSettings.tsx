/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React, { useEffect, useRef, MutableRefObject } from "react";
import AceEditor from "react-ace";
import immer from "immer";
import { Button } from "../atom/Button";
import { res, data, message } from "../../logic";
import { MouseDictionarySettings } from "../../types";
import { dom, defaultSettings } from "../../extern";

const WRAPPER_DIV_STYLE: React.CSSProperties = {
  margin: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1ch",
};

const EDITOR_STYLE: React.CSSProperties = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
};

type SettingsValue = number | string | boolean | [];

const canReplace = (a: SettingsValue, b: SettingsValue) => {
  if (Array.isArray(a)) {
    return Array.isArray(b);
  }
  return typeof a === typeof b;
};

type Props = {
  initialValue: MouseDictionarySettings;
  onChange: (value: MouseDictionarySettings) => void;
};

const COPY_BUTTON_STYLES: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  backgroundColor: "#FFFFFF",
  borderRadius: "0 4px 0 4px",
  cursor: "pointer",
  margin: "-1px -1px 0 0",
  padding: "0px 8px 0px 8px",
  border: "1px solid #ccc",
  fontSize: "large",
  width: "110px",
  textAlign: "center",
};

const COPY_BUTTON_STYLES1 = { ...COPY_BUTTON_STYLES, color: "#808080" } as React.CSSProperties;
const COPY_BUTTON_STYLES2 = { ...COPY_BUTTON_STYLES, color: "#FF4500" } as React.CSSProperties;

export const WholeSettings: React.FC<Props> = (props) => {
  const [json, setJson] = React.useState(() => {
    const initialValue = data.postProcessSettings(props.initialValue);
    return JSON.stringify(initialValue, null, 2);
  });

  const createSettings = (json: string): MouseDictionarySettings => {
    const newSettings = data.preProcessSettings(JSON.parse(json));
    const orgSettings = data.postProcessSettings(defaultSettings.get());
    return immer(orgSettings, (d) => {
      const errors = [];
      for (const key of Object.keys(d)) {
        if (!(key in newSettings)) {
          continue;
        }
        if (!canReplace(d[key], newSettings[key])) {
          errors.push(`Invalid ${key}`);
        }
        d[key] = newSettings[key];
      }
      if (errors.length >= 1) {
        throw new Error(errors.join("\n"));
      }
    });
  };

  const updateAndClose = (json: string) => {
    try {
      const settings = createSettings(json);
      props.onChange(settings);
    } catch (e) {
      message.warn(res.get("JsonImportError") + "\n" + e.message);
    }
  };

  const close = () => {
    props.onChange(null);
  };

  const editor = useRef() as MutableRefObject<AceEditor>;

  useEffect(() => {
    const copyButton = createProcessButton("COPY", COPY_BUTTON_STYLES1, "COPIED!", COPY_BUTTON_STYLES2, () =>
      navigator.clipboard.writeText(json)
    );
    dom.applyStyles(copyButton, COPY_BUTTON_STYLES);
    editor?.current?.refEditor?.appendChild(copyButton);
  }, []);

  return (
    <div style={WRAPPER_DIV_STYLE}>
      <p>{res.get("aboutJsonEditor")}</p>
      <div>
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
          ref={editor}
        />
      </div>
    </div>
  );
};

const createProcessButton = (
  text1: string,
  style1: React.CSSProperties,
  text2: string,
  style2: React.CSSProperties,
  doSomething: () => void
): HTMLElement => {
  let canProcess = true;
  const element = document.createElement("span");
  element.textContent = text1;
  dom.applyStyles(element, style1);
  element.addEventListener("click", () => {
    if (!canProcess) {
      return;
    }
    element.textContent = text2;
    dom.applyStyles(element, style2);
    canProcess = false;

    doSomething();

    setTimeout(() => {
      element.textContent = text1;
      dom.applyStyles(element, style1);
      canProcess = true;
    }, 2000);
  });
  return element;
};
