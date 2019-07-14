/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { ChromePicker } from "react-color";
import res from "../logic/resource";
import env from "../../settings/env";

const BasicSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }

  const positionOptions = createPositionOptions();
  const scrollOptions = createScrollOptions();
  const fontSizeOptions = createFontSizeOptions();

  const changeState = e => {
    props.changeState(e.target.name, e.target.value);
  };

  const changeSettings = e => {
    const value = e.target.type === "number" ? parseInt(e.target.value, 10) : e.target.value;
    props.changeSettings(e.target.name, value);
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

const createPositionOptions = () => {
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
  return createOptions(positions);
};

const createScrollOptions = () => {
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
  return createOptions(scrolls);
};

const FONT_SIZES = [
  {
    name: "xx-small",
    value: "xx-small"
  },
  {
    name: "x-small",
    value: "x-small"
  },
  {
    name: "smaller",
    value: "smaller"
  },
  {
    name: "small",
    value: "small"
  },
  {
    name: "medium",
    value: "medium"
  },
  {
    name: "large",
    value: "large"
  },
  {
    name: "larger",
    value: "larger"
  },
  {
    name: "x-large",
    value: "x-large"
  },
  {
    name: "xx-large",
    value: "xx-large"
  }
];
const createFontSizeOptions = () => createOptions(FONT_SIZES);

const createOptions = list => {
  return list.map(it => (
    <option key={it.value} value={it.value}>
      {it.name}
    </option>
  ));
};

export default BasicSettings;
