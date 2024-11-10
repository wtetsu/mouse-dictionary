/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { produce } from "immer";
import { res } from "../../logic";
import { env } from "../../extern";
import { Select } from "../atom/Select";
import { MouseDictionaryBasicSettings, UpdateEventHandler, InitialPosition } from "../../types";

type Props = {
  settings: MouseDictionaryBasicSettings;
  busy: boolean;
  onUpdate: UpdateEventHandler;
  children?: React.ReactNode;
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

  const update = (patch: Partial<MouseDictionaryBasicSettings>) => {
    const newPatch = produce(patch, (d) => {
      for (const name of Object.keys(patch)) {
        const value = patch[name];
        if (Number.isNaN(value) || (Number.isInteger(value) && value < 0)) {
          d[name] = 0;
        }
      }
    });
    props.onUpdate(undefined, newPatch);
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
        <label>{res.get("initialSize")}</label>
        <span>{res.get("width")}</span>
        <input
          type="number"
          name="width"
          value={settings.width}
          style={{ width: 90, backgroundColor: settings.initialPosition === "keep" ? "#c0c0c0" : undefined }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <span> {res.get("height")}</span>
        <input
          type="number"
          name="height"
          value={settings.height}
          style={{ width: 90, backgroundColor: settings.initialPosition === "keep" ? "#c0c0c0" : undefined }}
          onChange={(e) => update({ [e.target.name]: parseInt(e.target.value, 10) })}
        />
        <label>{res.get("initialPosition")}</label>
        <Select
          value={settings.initialPosition}
          options={positions}
          style={{ width: 250 }}
          onChange={(value) => update({ initialPosition: value as InitialPosition })}
        />
        <br />
        <h3>{res.get("colorAndFont")}</h3>
        <div className="container">
          <div className="row" style={{ width: 690 }}>
            <div className="column">
              <h4>{res.get("headFont")}</h4>
              <input
                type="color"
                style={{ width: 200 }}
                value={settings.headFontColor}
                onChange={(e) => update({ headFontColor: e.target.value })}
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
              <input
                type="color"
                style={{ width: 200 }}
                value={settings.descFontColor}
                onChange={(e) => update({ descFontColor: e.target.value })}
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
              <input
                type="color"
                style={{ width: 200 }}
                value={settings.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
              />
            </div>
          </div>
        </div>
        {props.children}
      </fieldset>
    </form>
  );
};
