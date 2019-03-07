/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export default {
  shortWordLength: 2,
  cutShortWordDescription: 30,
  parseWordsLimit: 8,
  lookupWithCapitalized: false,
  initialPosition: "right",
  scroll: "hidden",

  backgroundColor: "#ffffff",
  headFontColor: "#000088",
  descFontColor: "#101010",
  headFontSize: "small",
  descFontSize: "small",

  width: 300,
  height: 400,

  replaceRules: [
    {
      key: "0",
      search: "(■.+)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "1",
      search: "(◆.+)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "2",
      search: "(【.+?】)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "3",
      search: "({.+?})",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "4",
      search: "(《.+?》)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "5",
      search: "(〈.+?〉)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "6",
      search: "(〔.+?〕)",
      replace: '<span style="color:#008000;">$1</span>'
    },
    {
      key: "7",
      search: "(\\[.+?\\])",
      replace: '<strong><font color="#008000">$1</font></strong>'
    },
    {
      key: "8",
      search: "(\\(.+?\\))",
      replace: '<font color="#008000">$1</font>'
    },
    {
      key: "9",
      search: "\\n",
      replace: "<br/>"
    }
  ],

  normalDialogStyles: `{
  "opacity": 0.95,
  "zIndex": 2147483647
}`,

  movingDialogStyles: `{
  "opacity": 0.6
}`,

  hiddenDialogStyles: `{
  "opacity": 0.0,
  "zIndex": -1
}`,

  contentWrapperTemplate: `<div style="text-align:left;"></div>`,

  dialogTemplate: `<div style="all:initial;
            {{systemStyles}}
            width: {{width}}px;
            height: {{height}}px;
            position: fixed;
            overflow-x: hidden;
            overflow-y: {{scroll}};
            top: 5px;
            background-color: {{backgroundColor}};
            z-index: 2147483646;
            padding: 2px 4px 2px 4px;
            border: 1px solid #A0A0A0;"></div>`,

  contentTemplate: `<div style="all:initial;cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
  {{#words}}
    {{^isShort}}
      <span style="font-size:{{headFontSize}};font-weight:bold;color:{{headFontColor}}">{{head}}</span>
      <br/>
      <span style="font-size:{{descFontSize}};color:{{descFontColor}};">
        {{{desc}}}
      </span>
    {{/isShort}}
    {{#isShort}}
      <span style="font-size:{{headFontSize}};font-weight:bold;color:{{headFontColor}}">{{head}}</span>
      <span style="color:#505050;font-size:x-small;">{{shortDesc}}</span>
    {{/isShort}}
    {{^isLast}}
      <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:0;height:1px;" />
    {{/isLast}}
  {{/words}}
</div>`
};
