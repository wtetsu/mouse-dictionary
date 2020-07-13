/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";
import * as res from "../logic/resource";
import { MouseDictionarySettings, UpdateEventHandler } from "../types";

const EDITOR_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
  marginBottom: 20,
};

type AdvancedSettingsProps = {
  settings: MouseDictionarySettings;
  onUpdate: UpdateEventHandler;
  changeReplaceRule: (e: AdvancedSettingsChangeReplaceRuleEvent) => void;
};

export type AdvancedSettingsChangeReplaceRuleEvent =
  | {
      type: "add";
    }
  | {
      type: "change";
      payload: {
        index: number;
        target: "search" | "replace";
        value: string;
      };
    }
  | {
      type: "move";
      payload: {
        index: number;
        offset: number;
      };
    }
  | {
      type: "delete";
      payload: {
        index: number;
      };
    };

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = (props) => {
  const settings = props.settings;
  if (!settings) {
    return <div></div>;
  }

  const lookupWithCapitalized = settings?.lookupWithCapitalized ?? false;
  const contentWrapperTemplate = settings?.contentWrapperTemplate ?? "";
  const dialogTemplate = settings?.dialogTemplate ?? "";
  const contentTemplate = settings?.contentTemplate ?? "";

  const normalDialogStyles = settings?.normalDialogStyles ?? "";
  const movingDialogStyles = settings?.movingDialogStyles ?? "";
  const hiddenDialogStyles = settings?.hiddenDialogStyles ?? "";

  const changeSettings = (e) => {
    const value = e.target.type === "number" ? parseInt(e.target.value, 10) : e.target.value;
    const settingsPatch = { [e.target.name]: value };
    props.onUpdate(null, settingsPatch);
  };
  const changeBoolSettings = (e) => {
    const settingsPatch = { [e.target.name]: e.target.checked };
    props.onUpdate(null, settingsPatch);
  };

  const replaceRules = settings?.replaceRules ?? [];
  const replaceRulesList = replaceRules.map((r, i) => {
    return (
      <div key={r.key ?? r.search}>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.changeReplaceRule({ type: "move", payload: { index: i, offset: -1 } })}
          disabled={i === 0}
        >
          ↑
        </button>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.changeReplaceRule({ type: "move", payload: { index: i, offset: +1 } })}
          disabled={i === replaceRules.length - 1}
        >
          ↓
        </button>
        <input
          type="text"
          name={`replaceRule.search.${i}`}
          key={`replaceRule.search.${i}`}
          value={r.search}
          style={{ width: 230 }}
          onChange={(e) =>
            props.changeReplaceRule({
              type: "change",
              payload: { index: i, target: "search", value: e.target.value },
            })
          }
        />
        <span>{res.get("replaceRule1")}</span>
        <input
          type="text"
          name={`replaceRule.replace.${i}`}
          key={`replaceRule.replace.${i}`}
          value={r.replace}
          style={{ width: 370 }}
          onChange={(e) =>
            props.changeReplaceRule({
              type: "change",
              payload: { index: i, target: "replace", value: e.target.value },
            })
          }
        />
        <span>{res.get("replaceRule2")}</span>

        <button
          type="button"
          className="button button-arrow"
          onClick={() => props.changeReplaceRule({ type: "delete", payload: { index: i } })}
          style={{ marginLeft: 3 }}
        >
          ×
        </button>
      </div>
    );
  });

  return (
    <form className="settingsForm">
      <fieldset>
        <h2>{res.get("advancedSettings")}</h2>
        <label>
          {res.get("lookupWithCapitalized")}
          <input
            type="checkbox"
            name="lookupWithCapitalized"
            onChange={changeBoolSettings}
            checked={lookupWithCapitalized}
          />
        </label>
        <label>
          {res.get("parseWordsLimit")}
          &nbsp;
          <input
            type="number"
            name="parseWordsLimit"
            value={settings.parseWordsLimit}
            onChange={changeSettings}
            style={{ width: 60 }}
          />
        </label>
        <h3>
          {res.get("htmlTemplate")}
          <a
            href="https://github.com/wtetsu/mouse-dictionary/wiki/HTML-templates"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", fontSize: "medium" }}
          >
            ?
          </a>
        </h3>

        <label>{res.get("htmlTemplateWindow")}</label>
        <AceEditor
          mode="html"
          theme="xcode"
          onChange={(value) => props.onUpdate(null, { dialogTemplate: value })}
          name="dialogTemplate"
          editorProps={{ $blockScrolling: true }}
          value={dialogTemplate}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 250 }}
        />

        <label>{res.get("htmlTemplateDesc")}</label>
        <AceEditor
          mode="html"
          theme="xcode"
          onChange={(value) => props.onUpdate(null, { contentWrapperTemplate: value })}
          name="contentWrapperTemplate"
          editorProps={{ $blockScrolling: true }}
          value={contentWrapperTemplate}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 70 }}
        />

        <label>{res.get("htmlTemplateDescText")}</label>
        <AceEditor
          mode="html"
          theme="xcode"
          onChange={(value) => props.onUpdate(null, { contentTemplate: value })}
          name="contentTemplate"
          editorProps={{ $blockScrolling: true }}
          value={contentTemplate}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 400 }}
        />

        <h3>{res.get("styles")}</h3>
        <label>{res.get("stylesActive")}</label>
        <AceEditor
          mode="json"
          theme="tomorrow"
          onChange={(value) => props.onUpdate(null, { normalDialogStyles: value })}
          name="normalDialogStyles"
          editorProps={{ $blockScrolling: true }}
          value={normalDialogStyles}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 85 }}
        />

        <label>{res.get("stylesMoving")}</label>
        <AceEditor
          mode="json"
          theme="tomorrow"
          onChange={(json) => props.onUpdate(null, { movingDialogStyles: json })}
          name="movingDialogStyles"
          editorProps={{ $blockScrolling: true }}
          value={movingDialogStyles}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 85 }}
        />

        <label>{res.get("stylesInactive")}</label>
        <AceEditor
          mode="json"
          theme="tomorrow"
          onChange={(value) => props.onUpdate(null, { hiddenDialogStyles: value })}
          name="hiddenDialogStyles"
          editorProps={{ $blockScrolling: true }}
          value={hiddenDialogStyles}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 85 }}
        />
        <hr />
        <h3>{res.get("replaceRules")}</h3>
        {replaceRulesList}
        <button type="button" onClick={() => props.changeReplaceRule({ type: "add" })}>
          {res.get("add")}
        </button>
      </fieldset>
    </form>
  );
};
