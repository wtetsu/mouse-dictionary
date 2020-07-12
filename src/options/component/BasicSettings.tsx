/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { ChromePicker } from "react-color";
import * as res from "../logic/resource";
import env from "../../settings/env";
import { MouseDictionarySettings, UpdateEventHandler } from "../types";

type Props = {
  settings: MouseDictionarySettings;
  trialText: string;
  busy: boolean;
  onUpdate: UpdateEventHandler;
  trigger: (type: "loadInitialDict") => void;
};

export const BasicSettings: React.FC<Props> = (props) => {
  const settings = props.settings;
  if (!settings) {
    return <div></div>;
  }

  const positionOptions = createPositionOptions();
  const scrollOptions = createScrollOptions();
  const fontSizeOptions = createFontSizeOptions();

  const changeSettings = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const settingsPatch = { [e.target.name]: value };
    props.onUpdate(null, settingsPatch);
  };

  const changeNumberSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value < 0) {
      return;
    }
    const settingsPatch = { [e.target.name]: value };
    props.onUpdate(null, settingsPatch);
  };

  const changeColor = (name: string, e: { hex: string }) => {
    const settingsPatch = { [name]: e.hex };
    props.onUpdate(null, settingsPatch);
  };

  const settings1 = (
    <fieldset>
      <h2>{res.get("basicSettings")}</h2>
      <label>{res.get("abbreviateShortWordDesc")}</label>
      <span> {res.get("abbreviateShortWordDesc0")} </span>
      <input
        type="number"
        name="shortWordLength"
        value={settings.shortWordLength}
        onChange={changeNumberSettings}
        style={{ width: 60 }}
      />
      <span> {res.get("abbreviateShortWordDesc1")} </span>
      <input
        type="number"
        name="cutShortWordDescription"
        value={settings.cutShortWordDescription}
        onChange={changeNumberSettings}
        style={{ width: 60 }}
      />
      <span> {res.get("abbreviateShortWordDesc2")}</span>
      <label>{res.get("initialSize")}</label>
      <span>{res.get("width")}</span>
      <input type="number" name="width" value={settings.width} onChange={changeNumberSettings} style={{ width: 90 }} />
      <span> {res.get("height")}</span>
      <input
        type="number"
        name="height"
        value={settings.height}
        onChange={changeNumberSettings}
        style={{ width: 90 }}
      />
      <label>{res.get("initialPosition")}</label>
      <select name="initialPosition" value={settings.initialPosition} onChange={changeSettings} style={{ width: 250 }}>
        {positionOptions}
      </select>

      <label>{res.get("scrollBar")}</label>
      <select name="scroll" value={settings.scroll} onChange={changeSettings} style={{ width: 250 }}>
        {scrollOptions}
      </select>

      <br />

      <h3>{res.get("colorAndFont")}</h3>
      <div className="container">
        <div className="row" style={{ width: 690 }}>
          <div className="column">
            <h4>{res.get("headFont")}</h4>
            <ChromePicker
              width={200}
              color={settings.headFontColor}
              onChange={changeColor.bind(this, "headFontColor")}
              disableAlpha={true}
            />
            <br />
            <select name="headFontSize" value={settings.headFontSize} onChange={changeSettings} style={{ width: 200 }}>
              {fontSizeOptions}
            </select>
          </div>
          <div className="column">
            <h4>{res.get("descFont")}</h4>
            <ChromePicker
              width={200}
              color={settings.descFontColor}
              onChange={changeColor.bind(this, "descFontColor")}
              disableAlpha={true}
            />
            <br />
            <select name="descFontSize" value={settings.descFontSize} onChange={changeSettings} style={{ width: 200 }}>
              {fontSizeOptions}
            </select>
          </div>
          <div className="column">
            <h4>{res.get("background")}</h4>
            <ChromePicker
              width={200}
              color={settings.backgroundColor}
              onChange={changeColor.bind(this, "backgroundColor")}
              disableAlpha={true}
            />
          </div>
        </div>
      </div>
      <label>{res.get("dictionaryData")}</label>
      <input
        type="button"
        className="button-outline button-small"
        value={res.get("loadInitialDict")}
        style={{ marginRight: 5, cursor: "pointer" }}
        onClick={() => props.trigger("loadInitialDict")}
        disabled={props.busy}
      />
    </fieldset>
  );

  return <form className="settingsForm">{settings1}</form>;
};

const createPositionOptions = () => {
  const positions = [
    {
      name: res.get("positionLeft"),
      value: "left",
    },
    {
      name: res.get("positionRight"),
      value: "right",
    },
  ];
  if (!env.disableKeepingWindowStatus) {
    positions.push({
      name: res.get("positionKeep"),
      value: "keep",
    });
  }
  return createOptions(positions);
};

const createScrollOptions = () => {
  const scrolls = [
    {
      name: res.get("scrollOn"),
      value: "scroll",
    },
    {
      name: res.get("scrollOff"),
      value: "hidden",
    },
  ];
  return createOptions(scrolls);
};

const FONT_SIZES = [
  {
    name: "xx-small",
    value: "xx-small",
  },
  {
    name: "x-small",
    value: "x-small",
  },
  {
    name: "smaller",
    value: "smaller",
  },
  {
    name: "small",
    value: "small",
  },
  {
    name: "medium",
    value: "medium",
  },
  {
    name: "large",
    value: "large",
  },
  {
    name: "larger",
    value: "larger",
  },
  {
    name: "x-large",
    value: "x-large",
  },
  {
    name: "xx-large",
    value: "xx-large",
  },
];
const createFontSizeOptions = () => createOptions(FONT_SIZES);

const createOptions = (list) => {
  return list.map((it) => (
    <option key={it.value} value={it.value}>
      {it.name}
    </option>
  ));
};
