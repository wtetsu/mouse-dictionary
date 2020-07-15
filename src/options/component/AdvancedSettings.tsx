/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import AceEditor from "react-ace";
import * as res from "../logic/resource";
import { MouseDictionaryAdvancedSettings, UpdateEventHandler, Replace } from "../types";
import { ReplaceRuleEditor } from "./ReplaceRuleEditor";

const EDITOR_STYLE = {
  width: 800,
  border: "1px solid #d1d1d1",
  borderRadius: "3px",
  fontSize: 13,
  marginBottom: 20,
};

type AdvancedSettingsProps = {
  settings: MouseDictionaryAdvancedSettings;
  onUpdate: UpdateEventHandler;
};

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = (props) => {
  const lookupWithCapitalized = props.settings?.lookupWithCapitalized ?? false;
  const parseWordsLimit = props.settings?.parseWordsLimit ?? 8;
  const contentWrapperTemplate = props.settings?.contentWrapperTemplate ?? "";
  const dialogTemplate = props.settings?.dialogTemplate ?? "";
  const contentTemplate = props.settings?.contentTemplate ?? "";
  const normalDialogStyles = props.settings?.normalDialogStyles ?? "";
  const movingDialogStyles = props.settings?.movingDialogStyles ?? "";
  const hiddenDialogStyles = props.settings?.hiddenDialogStyles ?? "";

  const update = (patch: Record<string, string | number | boolean | Replace[]>) => {
    props.onUpdate(null, patch);
  };

  return (
    <form className="settingsForm">
      <fieldset>
        <h2>{res.get("advancedSettings")}</h2>
        <label>
          {res.get("lookupWithCapitalized")}
          <input
            type="checkbox"
            name="lookupWithCapitalized"
            onChange={(e) => update({ lookupWithCapitalized: e.target.checked })}
            checked={lookupWithCapitalized}
          />
        </label>
        <label>
          {res.get("parseWordsLimit")}
          &nbsp;
          <input
            type="number"
            name="parseWordsLimit"
            value={parseWordsLimit}
            onChange={(e) => update({ parseWordsLimit: e.target.value })}
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
          onChange={(value) => update({ dialogTemplate: value })}
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
          onChange={(value) => update({ contentWrapperTemplate: value })}
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
          onChange={(value) => update({ contentTemplate: value })}
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
          onChange={(value) => update({ normalDialogStyles: value })}
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
          onChange={(json) => update({ movingDialogStyles: json })}
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
          onChange={(value) => update({ hiddenDialogStyles: value })}
          name="hiddenDialogStyles"
          editorProps={{ $blockScrolling: true }}
          value={hiddenDialogStyles}
          showPrintMargin={false}
          highlightActiveLine={false}
          style={{ ...EDITOR_STYLE, height: 85 }}
        />
        <hr />
        <h3>{res.get("replaceRules")}</h3>
        <ReplaceRuleEditor
          replaceRules={props.settings.replaceRules}
          onUpdate={(rules) => update({ replaceRules: rules })}
        ></ReplaceRuleEditor>
      </fieldset>
    </form>
  );
};
