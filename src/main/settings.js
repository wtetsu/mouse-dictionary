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
  scroll: "scroll",
  skipPdfConfirmation: false,
  pdfUrl: "",
  backgroundColor: "#ffffff",
  headFontColor: "#000088",
  descFontColor: "#101010",
  headFontSize: "medium",
  descFontSize: "small",

  width: 350,
  height: 500,

  eitangoEmail: "",
  eitangoPassword: "",

  replaceRules: [
    {
      search: "(■.+|◆.+)",
      replace: '<span style="{{cssReset}};color:#008000;font-size:100%;">$1</span>',
    },
    {
      search: "({.+?}|\\[.+?\\]|\\(.+?\\))",
      replace: '<span style="{{cssReset}};color:#008000;font-size:100%;">$1</span>',
    },
    {
      search: "(【.+?】|《.+?》|〈.+?〉|〔.+?〕)",
      replace: '<span style="{{cssReset}};color:#008000;font-size:100%;">$1</span>',
    },
    {
      search: "\\n|\\\\n",
      replace: "<br/>",
    },
  ],

  normalDialogStyles: `{
  "opacity": 0.96,
  "zIndex": 2147483647
}`,

  movingDialogStyles: `{
  "opacity": 0.6
}`,

  hiddenDialogStyles: `{
  "opacity": 0.0,
  "zIndex": -1
}`,

  contentWrapperTemplate: `<div id="eitango_picker" style="margin: 0; padding: 0; border: 0; vertical-align: baseline; text-align: left; position: relative;">
  <meta name="referrer" content="no-referrer-when-downgrade">
  </div>`,

  dialogTemplate:
  `<div class="notranslate"
     style="all:initial;
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
            border: 1px solid #2F6BC3;">
            <div id="eitango_api_load" style="display: none; align-items: center; justify-content: center; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 1000; margin: auto; width: 100%; height: 100%;">
              <div id="eitango_load_message" style="position: fixed; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.76); color: white; width: 72px; height: 72px; border-radius: 6px;"></div>
            </div>
            <div id="eitango_error_message_box" style="display: none; align-items: center; justify-content: center; position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 2000; margin: auto; color: black; width: 100%; height: 100%;">
              <div id="eitango_error_message" style="position: fixed; max-width: 80%; background-color: #F5E8D7; padding: 10px; border-radius: 4px; font-size: 14px; line-height: 1.6; font-family: monospace, serif;"></div>
            </div>
</div>`,

  contentTemplate: `<div style="{{cssReset}};font-family:'hiragino kaku gothic pro', meiryo, sans-serif;">
  {{#words}}
    {{^isShort}}
      <div>
        <a href="https://www.ldoceonline.com/dictionary/{{head}}" style="{{cssReset}};font-size:{{headFontSize}};color:{{headFontColor}};font-weight:bold;" target="_blank">
          {{head}}
        </a>

        <img src="https://urbanmeetup.tokyo/img/i_play_blue.png" style="display: inline-block; cursor: pointer; width: 12px; height: 12px; vertical-align: baseline;" data-md-pronunciation="{{head}}" data-md-hovervisible>

        <div class="eitango_word_register" style="display: inline-block;">
          <input class="word" type="hidden" value="{{head}}">
          <input class="definition" type="hidden" value="{{shortDesc}}">
          <img alt="つながる英単語に登録" src="https://urbanmeetup.tokyo/img/i_plus_blue.png" style="width: 12px; height: 12px; border: none; cursor: pointer; vertical-align: baseline;">
        </div>
      </div>

      <span style="{{cssReset}};font-size:{{descFontSize}};color:{{descFontColor}};">
        {{{desc}}}
      </span>
    {{/isShort}}

    {{#isShort}}
      <span style="{{cssReset}};font-size:{{headFontSize}};color:{{headFontColor}};font-weight:bold;">
        {{head}}
      </span>
      <span style="{{cssReset}};color:#505050;font-size:x-small;">
        {{shortDesc}}
      </span>
    {{/isShort}}

    {{^isLast}}
      <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:0;height:1px;width:100%;" />
    {{/isLast}}
  {{/words}}
</div>`,
};
