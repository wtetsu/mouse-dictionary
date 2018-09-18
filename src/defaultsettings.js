/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default {
  shortWordLength: 2,
  cutShortWordDescription: 30,
  lookupWithCapitalized: true,
  initialPosition: "right",
  scroll: "hidden",

  titlebarBackgroundColor: "#EBEBEB",
  backgroundColor: "#ffffff",

  headFontColor: "#000088",
  descFontColor: "#101010",
  headFontSize: "small",
  descFontSize: "small",

  width: 300,
  height: 400,

  replaceRules: [
    {
      search: "(◆.+)",
      replace: '<font color="#008000">$1</font>'
    },
    {
      search: "(■.+)",
      replace: '<font color="#008000">$1</font>'
    },
    {
      search: "(【.+】)",
      replace: '<font color="#008000">$1</font>'
    },
    {
      search: "({.+})",
      replace: '<font color="#008000">$1</font>'
    },
    {
      search: "(《.+》)",
      replace: '<font color="#008000">$1</font>'
    },
    {
      search: "\\n",
      replace: "<br/>"
    }
  ],

  normalDialogStyles: `{
  "opacity": 0.95,
  "zIndex": 2147483647
}`,

  movingDialogStyles: `{
  "opacity": 0.35
}`,

  hiddenDialogStyles: `{
  "opacity": 0.0,
  "zIndex": -1
}`,

  titlebarTemplate: `<div style="all:initial;
            display:block;
            font-size:small;
            cursor:pointer;
            background-color:{{titlebarBackgroundColor}};">Mouse Dictionary</div>`,

  contentWrapperTemplate: `<div style="text-align:left;"></div>`,

  dialogTemplate: `<div style="all:initial;
            width: {{width}}px;
            height: {{height}}px;
            position: fixed;
            resize: both;
            overflow-x: hidden;
            overflow-y: {{scroll}};
            top: 5px;
            background-color: {{backgroundColor}};
            z-index: 2147483647;
            border: 1px solid #A0A0A0;
  "></div>`,

  contentTemplate: `<div style="all:initial;">
  {{#words}}
    {{^isShort}}
      {{! 通常の単語 }}
      <span style="font-size:{{headFontSize}};font-weight:bold;color:{{headFontColor}}">{{head}}</span>
      <br/>
      <span style="font-size:{{descFontSize}};color:{{descFontColor}};">
        {{{desc}}}
      </span>
    {{/isShort}}
    {{#isShort}}
      {{! 短い単語 }}
      <span style="font-size:{{headFontSize}};font-weight:bold;color:{{headFontColor}}">{{head}}</span>
      <span style="color:#505050;font-size:x-small;">{{shortDesc}}</span>
    {{/isShort}}
    {{^isLast}}
      <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:0;height:1px;" />
    {{/isLast}}
  {{/words}}
</div>`
};
