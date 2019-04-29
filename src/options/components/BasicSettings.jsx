/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { ChromePicker } from "react-color";
import res from "../lib/resources";
import env from "../../settings/env";

const BasicSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }
  const fontSizes = ["xx-small", "x-small", "smaller", "small", "medium", "large", "larger", "x-large", "xx-large"];
  const positions = [
    {
      name: res.get("positionLeft"),
      value: "left"
    },
    {
      name: res.get("positionRight"),
      value: "right"
    }
  ];
  if (!env.disableKeepingWindowStatus) {
    positions.push({
      name: res.get("positionKeep"),
      value: "keep"
    });
  }

  const positionOptions = positions.map(p => {
    return (
      <option key={p.value} value={p.value}>
        {p.name}
      </option>
    );
  });

  const scrolls = [
    {
      name: res.get("scrollOn"),
      value: "scroll"
    },
    {
      name: res.get("scrollOff"),
      value: "hidden"
    }
  ];
  const scrollOptions = scrolls.map(p => {
    return (
      <option key={p.value} value={p.value}>
        {p.name}
      </option>
    );
  });

  const fontSizeOptions = fontSizes.map(f => {
    return (
      <option key={f} value={f}>
        {f}
      </option>
    );
  });

  const changeState = e => {
    props.changeState(e.target.name, e.target.value);
  };

  const changeSettings = e => {
    props.changeSettings(e.target.name, e.target.value);
  };

  const changeColor = (name, e) => {
    props.changeSettings(name, e.hex);
  };

  const settings1 = (
    <fieldset>
      <h2>{res.get("basicSettings")}</h2>
      <label>{res.get("trialText")}</label>
      <input type="text" name="trialText" value={props.trialText} onChange={changeState} style={{ width: 560 }} />
      <label>{res.get("abbreviateShortWordDesc")}</label>
      <span> {res.get("abbreviateShortWordDesc0")} </span>
      <input
        type="number"
        name="shortWordLength"
        value={settings.shortWordLength}
        onChange={changeSettings}
        style={{ width: 60 }}
      />
      <span> {res.get("abbreviateShortWordDesc1")} </span>
      <input
        type="number"
        name="cutShortWordDescription"
        value={settings.cutShortWordDescription}
        onChange={changeSettings}
        style={{ width: 60 }}
      />
      <span> {res.get("abbreviateShortWordDesc2")}</span>
      <label>{res.get("initialSize")}</label>
      <span>{res.get("width")}</span>
      <input type="number" name="width" value={settings.width} onChange={changeSettings} style={{ width: 90 }} />
      <span> {res.get("height")}</span>
      <input type="number" name="height" value={settings.height} onChange={changeSettings} style={{ width: 90 }} />
      <label>{res.get("initialPosition")}</label>
      <select name="initialPosition" value={settings.initialPosition} onChange={changeSettings} style={{ width: 250 }}>
        {positionOptions}
      </select>

      <label>{res.get("scrollBar")}</label>
      <select name="scroll" value={settings.scroll} onChange={changeSettings} style={{ width: 250 }}>
        {scrollOptions}
      </select>

      <br />

      <label>{res.get("dictionaryData")}</label>
      <input
        type="button"
        className="button-outline button-small"
        value={res.get("loadInitialDict")}
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={props.doLoadInitialDict}
        disabled={props.busy ? "disabled" : null}
      />
      <p>
        <a
          href="https://github.com/wtetsu/mouse-dictionary/wiki/Download-dictionary-data"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", fontSize: "small" }}
        >
          {res.get("downloadDictData")}
        </a>
      </p>

      <hr />
      <h3>{res.get("colorAndFont")}</h3>
      <label>{res.get("backgroundColor")}</label>
      <ChromePicker
        color={settings.backgroundColor}
        onChangeComplete={changeColor.bind(this, "backgroundColor")}
        disableAlpha={true}
      />
      <br />
      <br />

      <label>{res.get("headFontSize")}</label>
      <select name="headFontSize" value={settings.headFontSize} onChange={changeSettings} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>{res.get("headFontColor")}</label>
      <ChromePicker
        color={settings.headFontColor}
        onChangeComplete={changeColor.bind(this, "headFontColor")}
        disableAlpha={true}
      />

      <br />
      <br />

      <label>{res.get("descFontSize")}</label>
      <select name="descFontSize" value={settings.descFontSize} onChange={changeSettings} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>{res.get("descFontcolor")}</label>
      <ChromePicker
        color={settings.descFontColor}
        onChangeComplete={changeColor.bind(this, "descFontColor")}
        disableAlpha={true}
      />
    </fieldset>
  );

  return <form className="settingsForm">{settings1}</form>;
};

export default BasicSettings;
