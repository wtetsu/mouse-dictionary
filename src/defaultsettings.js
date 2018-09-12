export default {
  shortWordLength: 2,
  cutShortWordDescription: 30,
  lookupWithCapitalized: true,
  initialPosition: "keep",
  initialSize: "keep",

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

  normalDialogStyles: {
    opacity: 0.95,
    zIndex: 2147483647
  },

  movingDialogStyles: {
    opacity: 0.35
  },

  hiddenDialogStyles: {
    opacity: 0.0,
    zIndex: -1
  },

  headerTemplate: `<div style="all:initial;
                               display:block;
                               font-size:small;
                               cursor:pointer;
                               background-color:#EBEBEB;">Mouse Dictionary</div>`,

  contentWrapperTemplate: `<div style="text-align:left;"></div>`,

  dialogTemplate: `<div style="all:initial;
                               width: 300px;
                               height: 400px;
                               position: fixed;
                               resize: both;
                               overflow: hidden;
                               top: 5px;
                               background-color: #ffffff;
                               z-index: 2147483647;
                               border: 1px solid #A0A0A0;
  "></div>`,

  contentTemplate: `
  <div style="all:initial;font-size:small;">
    {{#words}}
      {{#isShort}}
        {{! 短い単語 }}
        <span style="color:#000088;font-weight:bold;">{{head}}</span>
        <span style="color:#505050;font-size:x-small;">{{shortText}}</span>
      {{/isShort}}
      {{^isShort}}
        {{! 通常の単語 }}
        <span style="font-size:small;font-weight:bold;color:#000088">{{head}}</span><br/>
        <span style="font-size:small;color:#101010;">
          {{{desc}}}
        </span>
      {{/isShort}}
      {{^isLast}}
        <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:0;height:1px;" />
      {{/isLast}}
    {{/words}}
  </div>
  `
};
