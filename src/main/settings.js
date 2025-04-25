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
  skipPdfConfirmation: false,
  pdfUrl: "",
  backgroundColor: "#ffffff",
  headFontColor: "#000088",
  descFontColor: "#101010",
  headFontSize: "x-large",
  descFontSize: "small",

  width: 350,
  height: 500,

  replaceRules: [
    {
      search: "(■.+|◆.+)",
      replace: '<span style="color:#003366;margin-left:1em;font-size:0.9em;">$1</span>',
    },
    {
      search: "({.+?}|\\[.+?\\]|\\(.+?\\))",
      replace: '<span style="color:#008000;font-size:100%;">$1</span>',
    },
    {
      search: "(【.+?】|《.+?》|〈.+?〉|〔.+?〕)",
      replace: '<span style="color:#008000;font-size:100%;">$1</span>',
    },
    {
      search: "\\n|\\\\n",
      replace: "<br/>",
    },
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

  contentWrapperTemplate: `<div style="margin:0;padding:0;border:0;vertical-align:baseline;text-align:left;">
</div>`,

  dialogTemplate: `<div class="notranslate"
     style="width: {{width}}px;
            height: {{height}}px;
            position: fixed;
            overflow-x: hidden;
            overflow-y: scroll;
            top: 5px;
            background-color: {{backgroundColor}};
            z-index: 2147483646;
            padding: 2px 4px 2px 4px;
            border: 1px solid #A0A0A0;
            font-weight: normal;">
</div>`,

  contentTemplate: `<div style="cursor:inherit;font-family:'hiragino kaku gothic pro', meiryo, sans-serif; padding:10px;">
  {{#words}}
    {{^isShort}}
      <span style="font-size:{{headFontSize}};color:{{headFontColor}};font-weight:bold;font-family:Georgia;">
        {{head}}
      </span>
      <span style="cursor:pointer;visibility:hidden;" data-md-pronunciation="{{head}}" data-md-hovervisible="true">🔊</span>
      <br/>
      <span style="font-size:{{descFontSize}};color:{{descFontColor}};">
        {{{desc}}}
      </span>
    {{/isShort}}
    {{#isShort}}
      <span style="font-size:{{headFontSize}};color:{{headFontColor}};font-weight:bold;font-family:Georgia;">
        {{head}}
      </span>
      <span style="color:#505050;font-size:x-small;">
        {{shortDesc}}
      </span>
    {{/isShort}}
    {{^isLast}}
      <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:12px 0;height:1px;width:100%;" />
    {{/isLast}}
  {{/words}}
</div>`,
};
