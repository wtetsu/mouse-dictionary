/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import React from "react";
import { TwitterPicker } from "react-color";
import res from "../resources";
import env from "../../env";

const BasicSettings = props => {
  const settings = props.settings;
  if (!settings) {
    return "<div></div>";
  }

  const bgColors = ["#F0F0F0", "#FAFAFA", "#FFFFFF"];
  const headColors = ["#000000", "#ABB8C3", "#000088"];
  const descColors = ["#101010", "#A0A0A0", "#000088"];

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
      <h2>基本設定</h2>
      <label>お試し用テキスト</label>
      <input type="text" value={props.trialText} onChange={props.onChangeState.bind(this, "trialText")} />
      <label>短い単語の説明を省略</label>
      <input
        type="number"
        value={settings.shortWordLength}
        onChange={props.onChange.bind(this, "shortWordLength")}
        style={{ width: 60 }}
      />
      <span> 文字以内の短い単語は、説明を </span>
      <input
        type="number"
        value={settings.cutShortWordDescription}
        onChange={props.onChange.bind(this, "cutShortWordDescription")}
        style={{ width: 60 }}
      />
      <span> 文字に切り詰める</span>
      <label>初期サイズ</label>
      <span>幅:</span>
      <input type="number" value={settings.width} onChange={props.onChange.bind(this, "width")} style={{ width: 90 }} />
      <span> 高さ:</span>
      <input type="number" value={settings.height} onChange={props.onChange.bind(this, "height")} style={{ width: 90 }} />
      <label>初期表示位置</label>
      <select
        value={settings.initialPosition}
        onChange={props.onChange.bind(this, "initialPosition")}
        style={{ width: 250 }}
      >
        {positionOptions}
      </select>
      <label>スクロールバー</label>
      <select value={settings.scroll} onChange={props.onChange.bind(this, "scroll")} style={{ width: 250 }}>
        {scrollOptions}
      </select>
      <hr />
      <h3>サイズや色等</h3>
      <label>見出し文字サイズ</label>
      <select value={settings.headFontSize} onChange={props.onChange.bind(this, "headFontSize")} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>説明文字サイズ</label>
      <select value={settings.descFontSize} onChange={props.onChange.bind(this, "descFontSize")} style={{ width: 250 }}>
        {fontSizeOptions}
      </select>
      <label>背景色</label>
      <TwitterPicker
        color={settings.backgroundColor}
        colors={bgColors}
        onChangeComplete={props.onChangeColorSettings.bind(this, "backgroundColor")}
      />
      <label>文字色(見出し)</label>
      <TwitterPicker
        color={settings.headFontColor}
        colors={headColors}
        onChangeComplete={props.onChangeColorSettings.bind(this, "headFontColor")}
      />
      <label>文字色(説明)</label>
      <TwitterPicker
        color={settings.descFontColor}
        colors={descColors}
        onChangeComplete={props.onChangeColorSettings.bind(this, "descFontColor")}
      />
    </fieldset>
  );

  return <form>{settings1}</form>;
};

export default BasicSettings;
