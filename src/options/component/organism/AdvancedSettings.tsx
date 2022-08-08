/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import immer from "immer";
import { res } from "../../logic";
import { ReplaceRuleEditor } from "./ReplaceRuleEditor";
import { HighlightEditor } from "../atom/HighlightEditor";
import { MouseDictionaryAdvancedSettings, UpdateEventHandler } from "../../types";

type AdvancedSettingsProps = {
  settings: MouseDictionaryAdvancedSettings;
  onUpdate: UpdateEventHandler;
};

export const AdvancedSettings: React.VFC<AdvancedSettingsProps> = (props) => {
  const lookupWithCapitalized = props.settings?.lookupWithCapitalized ?? false;
  const parseWordsLimit = props.settings?.parseWordsLimit ?? 8;
  const pdfUrl = props.settings?.pdfUrl ?? "";
  const contentWrapperTemplate = props.settings?.contentWrapperTemplate ?? "";
  const dialogTemplate = props.settings?.dialogTemplate ?? "";
  const contentTemplate = props.settings?.contentTemplate ?? "";
  const normalDialogStyles = props.settings?.normalDialogStyles ?? "";
  const movingDialogStyles = props.settings?.movingDialogStyles ?? "";
  const hiddenDialogStyles = props.settings?.hiddenDialogStyles ?? "";

  const update = (patch: Partial<MouseDictionaryAdvancedSettings>) => {
    const newPatch = immer(patch, (d) => {
      for (const name of Object.keys(patch)) {
        const value = patch[name];
        if (Number.isNaN(value) || (Number.isInteger(value) && value < 0)) {
          d[name] = 0;
        }
      }
    });
    props.onUpdate(null, newPatch);
  };

  return (
    <form className="settingsForm">
      <fieldset>
        <h2>{res.get("advancedSettings")}</h2>

        <label>{res.get("htmlTemplateDescText")}</label>
        <HighlightEditor
          mode="html"
          theme="xcode"
          onChange={(value) => update({ contentTemplate: value })}
          value={contentTemplate}
          style={{ height: 400 }}
        />
      </fieldset>
    </form>
  );
};
