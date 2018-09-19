/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { ChromePicker } from "react-color";
import res from "../resources";
import env from "../../env";

const BasicSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }
  const fontSizes = ["xx-small", "x-small", "smaller", "small", "medium", "large", "larger", "x-large", "xx-large"];
  const positions = [
    {
      name: res("positionLeft"),
      value: "left"
    },
    {
      name: res("positionRight"),
      value: "right"
    }
  ];
  if (!env.disableKeepingWindowStatus) {
    positions.push({
      name: res("positionKeep"),
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
      name: res("scrollOn"),
      value: "scroll"
    },
    {
      name: res("scrollOff"),
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

  const settings1 = (
    <fieldset>
      <h2>{res("basicSettings")}</h2>
      <label>{res("trialText")}</label>
      <input type="text" value={props.trialText} onChange={props.onChangeState.bind(this, "trialText")} />
      <label>{res("abbreviateShortWordDesc")}</label>
      <input
        type="number"
        value={settings.shortWordLength}
        onChange={props.onChange.bind(this, "shortWordLength")}
        style={{ width: 60 }}
      />
      <span> {res("abbreviateShortWordDesc1")} </span>
      <input
        type="number"
        value={settings.cutShortWordDescription}
        onChange={props.onChange.bind(this, "cutShortWordDescription")}
        style={{ width: 60 }}
      />
      <span> {res("abbreviateShortWordDesc2")}</span>
      <label>{res("initialSize")}</label>
      <span>{res("width")}</span>
      <input type="number" value={settings.width} onChange={props.onChange.bind(this, "width")} style={{ width: 90 }} />
      <span> {res("height")}</span>
      <input type="number" value={settings.height} onChange={props.onChange.bind(this, "height")} style={{ width: 90 }} />
      <label>{res("initialPosition")}</label>
      <select
        value={settings.initialPosition}
        onChange={props.onChange.bind(this, "initialPosition")}
        style={{ width: 250 }}
      >
        {positionOptions}
      </select>
      <label>{res("scrollBar")}</label>
      <select value={settings.scroll} onChange={props.onChange.bind(this, "scroll")} style={{ width: 250 }}>
        {scrollOptions}
      </select>
      <hr />
      <h3>{res("colorAndFont")}</h3>
      <label>{res("backgroundColor")}</label>
      <ChromePicker
        color={settings.backgroundColor}
        onChangeComplete={props.onChangeColorSettings.bind(this, "backgroundColor")}
        disableAlpha={true}
      />
      <br />
      <br />

      <label>{res("headFontSize")}</label>
      <select value={settings.headFontSize} onChange={props.onChange.bind(this, "headFontSize")} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>{res("colorAndFont")}</label>
      <ChromePicker
        color={settings.headFontColor}
        onChangeComplete={props.onChangeColorSettings.bind(this, "headFontColor")}
        disableAlpha={true}
      />

      <br />
      <br />

      <label>{res("descFontSize")}</label>
      <select value={settings.descFontSize} onChange={props.onChange.bind(this, "descFontSize")} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>{res("descFontcolor")}</label>
      <ChromePicker
        color={settings.descFontColor}
        onChangeComplete={props.onChangeColorSettings.bind(this, "descFontColor")}
        disableAlpha={true}
      />
    </fieldset>
  );

  return <form>{settings1}</form>;
};

export default BasicSettings;
