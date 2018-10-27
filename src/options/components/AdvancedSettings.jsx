/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import res from "../resources";

const AdvancedSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }

  const lookupWithCapitalized = (settings && settings.lookupWithCapitalized) || false;
  const showTitlebar = (settings && settings.showTitlebar) || false;
  const titlebarTemplate = (settings && settings.titlebarTemplate) || "";
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
          style={{ width: 300 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>{res("replaceRule1")}</span>
        <input
          type="text"
          name={`replaceRule.replace.${i}`}
          key={`replaceRule.replace.${i}`}
          defaultValue={r.replace}
          style={{ width: 300 }}
          onChange={props.onChangeReplaceRule}
        />
        <span>{res("replaceRule2")}</span>

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
    <form>
      <fieldset>
        <h2>{res("advancedSettings")}</h2>
        <label>
          {res("lookupWithCapitalized")}
          <input
            type="checkbox"
            checked={lookupWithCapitalized}
            onChange={e => props.onChange("lookupWithCapitalized", e)}
          />
        </label>

        <label>
          {res("showTitlebar")}
          <input type="checkbox" checked={showTitlebar} onChange={e => props.onChange("showTitlebar", e)} />
        </label>

        <label>
          {res("parseWordsLimit")}
          &nbsp;
          <input
            type="number"
            value={settings.parseWordsLimit}
            onChange={props.onChange.bind(this, "parseWordsLimit")}
            style={{ width: 60 }}
          />
        </label>

        <h3>{res("htmlTemplate")}</h3>
        <label>{res("htmlTemplateWindow")}</label>
        <textarea
          value={dialogTemplate}
          style={{ width: 800, height: 200 }}
          onChange={e => props.onChange("dialogTemplate", e)}
        />
        <label>{res("htmlTemplateTitleBar")}</label>
        <textarea
          value={titlebarTemplate}
          style={{ width: 800, height: 110 }}
          onChange={e => props.onChange("titlebarTemplate", e)}
        />
        <label>{res("htmlTemplateDesc")}</label>
        <textarea
          value={contentWrapperTemplate}
          style={{ width: 800, height: 30 }}
          onChange={e => props.onChange("contentWrapperTemplate", e)}
        />
        <label>{res("htmlTemplateDescText")}</label>
        <textarea
          value={contentTemplate}
          style={{ width: 800, height: 350 }}
          onChange={e => props.onChange("contentTemplate", e)}
        />

        <h3>{res("styles")}</h3>
        <label>{res("stylesActive")}</label>
        <textarea
          value={normalDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("normalDialogStyles", e)}
        />
        <label>{res("stylesMoving")}</label>
        <textarea
          value={movingDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("movingDialogStyles", e)}
        />
        <label>{res("stylesInactive")}</label>
        <textarea
          value={hiddenDialogStyles}
          style={{ width: 800, height: 80 }}
          onChange={e => props.onChange("hiddenDialogStyles", e)}
        />
        <hr />

        <h3>{res("replaceRules")}</h3>
        {replaceRulesList}
        <button type="button" onClick={props.onClickAddReplaceRule}>
          {res("add")}
        </button>
      </fieldset>
    </form>
  );
};

export default AdvancedSettings;
