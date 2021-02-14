/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { ChromePicker } from "react-color";
import immer from "immer";
import { res } from "../../logic";
import { env } from "../../extern";
import { Select } from "../atom/Select";
import { MouseDictionaryBasicSettings, UpdateEventHandler, InitialPosition, Scroll } from "../../types";

type Props = {
  settings: MouseDictionaryBasicSettings;
  busy: boolean;
  onUpdate: UpdateEventHandler;
};

const FONT_SIZES = [
  { name: "xx-small", value: "xx-small" },
  { name: "x-small", value: "x-small" },
  { name: "smaller", value: "smaller" },
  { name: "small", value: "small" },
  { name: "medium", value: "medium" },
  { name: "large", value: "large" },
  { name: "larger", value: "larger" },
  { name: "x-large", value: "x-large" },
  { name: "xx-large", value: "xx-large" },
];

export const BasicSettings: React.FC<Props> = (props) => {
  const settings = props.settings;
  if (!settings) {
    return <div></div>;
  }

  const positions = [
    { name: res.get("positionLeft"), value: "left" },
    { name: res.get("positionRight"), value: "right" },
  ];
  if (env.get().enableWindowStatusSave) {
    positions.push({
      name: res.get("positionKeep"),
      value: "keep",
    });
  }

  const scrolls = [
    { name: res.get("scrollOn"), value: "scroll" },
    { name: res.get("scrollOff"), value: "hidden" },
  ];

  const update = (patch: Partial<MouseDictionaryBasicSettings>) => {
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

  type ColorPickerChangeEvent = {
    hex: string;
  };

  return (
    <form className="settingsForm">
      <fieldset>
        <h2>{res.get("basicSettings")}</h2>
        <label>
          {res.get("skipPdfConfirmation")}
          <input
            type="checkbox"
            name="lookupWithCapitalized"
            onChange={(e) => update({ skipPdfConfirmation: e.target.checked })}
            checked={settings.skipPdfConfirmation}
          />
        </label>

        <label>{res.get("abbreviateShortWordDesc")}</label>
        <span> {res.get("abbreviateShortWordDesc0")} </span>
        <input
          type="number"
          name="shortWordLength"
          value={settings.shortWordLength}
          style={{ width: 60 }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <span> {res.get("abbreviateShortWordDesc1")} </span>
        <input
          type="number"
          name="cutShortWordDescription"
          value={settings.cutShortWordDescription}
          style={{ width: 60 }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <span> {res.get("abbreviateShortWordDesc2")}</span>
        <label>{res.get("initialSize")}</label>
        <span>{res.get("width")}</span>
        <input
          type="number"
          name="width"
          value={settings.width}
          style={{ width: 90, backgroundColor: settings.initialPosition === "keep" ? "#c0c0c0" : null }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <span> {res.get("height")}</span>
        <input
          type="number"
          name="height"
          value={settings.height}
          style={{ width: 90, backgroundColor: settings.initialPosition === "keep" ? "#c0c0c0" : null }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <label>{res.get("initialPosition")}</label>
        <Select
          value={settings.initialPosition}
          options={positions}
          style={{ width: 250 }}
          onChange={(value) => update({ initialPosition: value as InitialPosition })}
        />

        <label>{res.get("scrollBar")}</label>
        <Select
          value={settings.scroll}
          options={scrolls}
          style={{ width: 250 }}
          onChange={(value) => update({ scroll: value as Scroll })}
        />

        <br />

        <h3>{res.get("colorAndFont")}</h3>
        <div className="container">
          <div className="row" style={{ width: 690 }}>
            <div className="column">
              <h4>{res.get("headFont")}</h4>
              <ChromePicker
                width={200}
                color={settings.headFontColor}
                disableAlpha={true}
                onChange={(e: ColorPickerChangeEvent) => update({ headFontColor: e.hex })}
              />
              <br />
              <Select
                value={settings.headFontSize}
                options={FONT_SIZES}
                style={{ width: 200 }}
                onChange={(value) => update({ headFontSize: value })}
              />
            </div>
            <div className="column">
              <h4>{res.get("descFont")}</h4>
              <ChromePicker
                width={200}
                color={settings.descFontColor}
                disableAlpha={true}
                onChange={(e: ColorPickerChangeEvent) => update({ descFontColor: e.hex })}
              />
              <br />
              <Select
                value={settings.descFontSize}
                options={FONT_SIZES}
                style={{ width: 200 }}
                onChange={(value) => update({ descFontSize: value })}
              />
            </div>
            <div className="column">
              <h4>{res.get("background")}</h4>
              <ChromePicker
                width={200}
                color={settings.backgroundColor}
                disableAlpha={true}
                onChange={(e: ColorPickerChangeEvent) => update({ backgroundColor: e.hex })}
              />
            </div>
          </div>
        </div>
        {props.children}
      </fieldset>
    </form>
  );
};
