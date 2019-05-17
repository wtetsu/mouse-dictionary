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

  const changeSettings = e => {
    const value = e.target.type === "number" ? parseInt(e.target.value, 10) : e.target.value;
    props.changeSettings(e.target.name, value);
  };
  const changeBoolSettings = e => {
    props.changeSettings(e.target.name, e.target.checked);
  };

  const replaceRules = (settings && settings.replaceRules) || [];
  const replaceRulesList = replaceRules.map((r, i) => {
    return (
      <div key={r.key || r.search}>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.changeReplaceRule("move", { index: i, offset: -1 })}
          disabled={i === 0}
        >
          ↑
        </button>
        <button
          type="button"
          className="button button-outline button-arrow"
          onClick={() => props.changeReplaceRule("move", { index: i, offset: +1 })}
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
          onChange={e => props.changeReplaceRule("change", { name: e.target.name, value: e.target.value })}
        />
        <span>{res.get("replaceRule1")}</span>
        <input
          type="text"
          name={`replaceRule.replace.${i}`}
          key={`replaceRule.replace.${i}`}
          value={r.replace}
          style={{ width: 370 }}
          onChange={e => props.changeReplaceRule("change", { name: e.target.name, value: e.target.value })}
        />
        <span>{res.get("replaceRule2")}</span>

        <button
          type="button"
          className="button button-arrow"
          onClick={() => props.changeReplaceRule("delete", { index: i })}
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
          <input type="checkbox" name="lookupWithCapitalized" value={lookupWithCapitalized} onChange={changeBoolSettings} />
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
        <textarea
          name="dialogTemplate"
          value={dialogTemplate}
          style={{ width: 800, height: 200 }}
          onChange={changeSettings}
        />
        <label>{res.get("htmlTemplateDesc")}</label>
        <textarea
          name="contentWrapperTemplate"
          value={contentWrapperTemplate}
          style={{ width: 800, height: 30 }}
          onChange={changeSettings}
        />
        <label>{res.get("htmlTemplateDescText")}</label>
        <textarea
          name="contentTemplate"
          value={contentTemplate}
          style={{ width: 800, height: 350 }}
          onChange={changeSettings}
        />

        <h3>{res.get("styles")}</h3>
        <label>{res.get("stylesActive")}</label>
        <textarea
          name="normalDialogStyles"
          value={normalDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={changeSettings}
        />
        <label>{res.get("stylesMoving")}</label>
        <textarea
          name="movingDialogStyles"
          value={movingDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={changeSettings}
        />
        <label>{res.get("stylesInactive")}</label>
        <textarea
          name="hiddenDialogStyles"
          value={hiddenDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={changeSettings}
        />
        <hr />

        <h3>{res.get("replaceRules")}</h3>
        {replaceRulesList}
        <button type="button" onClick={() => props.changeReplaceRule("add")}>
          {res.get("add")}
        </button>
      </fieldset>
    </form>
  );
};

export default AdvancedSettings;
