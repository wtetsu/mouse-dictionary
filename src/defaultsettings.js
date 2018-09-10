export default {
  shortWordLength: 2,
  cutShortWordDescription: 80,

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
    opacity: 0.95
  },

  movingDialogStyles: {
    opacity: 0.35
  },

  headerTemplate: '<div style="margin:0;padding:0;font-style:normal;font-weight:normal;font-size:small;cursor:pointer;background-color:#EBEBEB;">Mouse Dictionary</div>',

  contentWrapperTemplate: "<div></div>",

  dialogTemplate: `<div style="width: 400px;
                               height: 600px;
                               position: fixed;
                               resize: both;
                               overflow: hidden;
                               top: 10px;
                               left: 10px;
                               background-color: #ffffff;
                               z-index: 2147483647;
                               border: 1px solid #A0A0A0;
  "></div>`,

  contentTemplate: `
  <div style="all:initial;font-size:small;">
    {{#words}}
      {{#isShort}}
        {{! 短い単語 }}
        <font color="#000088"><strong>{{head}}</strong></font>
        <font size="-2">{{shortText}}...</font>
      {{/isShort}}
      {{^isShort}}
        {{! 通常の単語 }}
        <font color="#000088"><strong>{{head}}</strong></font><br/>
        {{{desc}}}
      {{/isShort}}
      {{^isLast}}
        <br/><hr style="border:0;border-top:1px solid #E0E0E0;margin:0;height:1px;" />
      {{/isLast}}
    {{/words}}
  </div>
  `
};
