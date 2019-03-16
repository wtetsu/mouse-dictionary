/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import res from "../lib/resources";

const AdvancedSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }

  const lookupWithCapitalized = (settings && settings.lookupWithCapitalized) || false;
  const contentWrapperTemplate = (settings && settings.contentWrapperTemplate) || "";
  const dialogTemplate = (settings && settings.dialogTemplate) || "";
  const contentTemplate = (settings && settings.contentTemplate) || "";

  const normalDialogStyles = (settings && settings.normalDialogStyles) || "";
  const movingDialogStyles = (settings && settings.movingDialogStyles) || "";
  const hiddenDialogStyles = (settings && settings.hiddenDialogStyles) || "";

  const replaceRules = (settings && settings.replaceRules) || [];
  const replaceRulesList = replaceRules.map((r, i) => {
    return (
      <div key={r.key || r.search}>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.onClickMoveReplaceRule(i, -1)}
          disabled={i === 0}
        >
          ↑
        </button>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.onClickMoveReplaceRule(i, +1)}
          disabled={i === replaceRules.length - 1}
        >
          ↓
        </button>
        <input
          type="text"
          name={`replaceRule.search.${i}`}
          key={`replaceRule.search.${i}`}
          defaultValue={r.search}
          style={{ width: 200 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>{res.get("replaceRule1")}</span>
        <input
          type="text"
          name={`replaceRule.replace.${i}`}
          key={`replaceRule.replace.${i}`}
          defaultValue={r.replace}
          style={{ width: 300 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>{res.get("replaceRule2")}</span>

        <button
          type="button"
          className="button button-arrow"
          onClick={() => props.onClickRemoveReplaceRule(i)}
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
            checked={lookupWithCapitalized}
            onChange={e => props.onChange("lookupWithCapitalized", e)}
          />
        </label>

        <label>
          {res.get("parseWordsLimit")}
          &nbsp;
          <input
            type="number"
            value={settings.parseWordsLimit}
            onChange={props.onChange.bind(this, "parseWordsLimit")}
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
        <textarea
          value={dialogTemplate}
          style={{ width: 800, height: 200 }}
          onChange={e => props.onChange("dialogTemplate", e)}
        />
        <label>{res.get("htmlTemplateDesc")}</label>
        <textarea
          value={contentWrapperTemplate}
          style={{ width: 800, height: 30 }}
          onChange={e => props.onChange("contentWrapperTemplate", e)}
        />
        <label>{res.get("htmlTemplateDescText")}</label>
        <textarea
          value={contentTemplate}
          style={{ width: 800, height: 350 }}
          onChange={e => props.onChange("contentTemplate", e)}
        />

        <h3>{res.get("styles")}</h3>
        <label>{res.get("stylesActive")}</label>
        <textarea
          value={normalDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("normalDialogStyles", e)}
        />
        <label>{res.get("stylesMoving")}</label>
        <textarea
          value={movingDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("movingDialogStyles", e)}
        />
        <label>{res.get("stylesInactive")}</label>
        <textarea
          value={hiddenDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("hiddenDialogStyles", e)}
        />
        <hr />

        <h3>{res.get("replaceRules")}</h3>
        {replaceRulesList}
        <button type="button" onClick={props.onClickAddReplaceRule}>
          {res.get("add")}
        </button>
      </fieldset>
    </form>
  );
};

export default AdvancedSettings;
