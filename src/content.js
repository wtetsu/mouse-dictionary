import Hogan from "hogan.js";

import text from "./text";
import res from "./resources";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";
import defaultSettings from "./defaultsettings";

const main = () => {
  // Pages which have frames are not supported.
  const frames = document.getElementsByTagName("frame");
  if (frames && frames.length >= 1) {
    alert(res("doesntSupportFrame"));
    return;
  }

  const _configs = {};
  if (!(_configs.shortWordLength >= 0)) {
    _configs.shortWordLength = defaultSettings.shortWordLength;
  }
  if (!(_configs.cutShortWordDescription >= 0)) {
    _configs.cutShortWordDescription = defaultSettings.cutShortWordDescription;
  }
  if (!_configs.replaceRules) {
    _configs.replaceRules = defaultSettings.replaceRules;
  }
  if (!_configs.dialogTemplate) {
    _configs.dialogTemplate = defaultSettings.dialogTemplate;
  }
  if (!_configs.headerTemplate) {
    _configs.headerTemplate = defaultSettings.headerTemplate;
  }
  if (!_configs.contentWrapperTemplate) {
    _configs.contentWrapperTemplate = defaultSettings.contentWrapperTemplate;
  }
  if (!_configs.contentTemplate) {
    _configs.contentTemplate = defaultSettings.contentTemplate;
  }
  if (!_configs.normalDialogStyles) {
    _configs.normalDialogStyles = defaultSettings.normalDialogStyles;
  }
  if (!_configs.movingDialogStyles) {
    _configs.movingDialogStyles = defaultSettings.movingDialogStyles;
  }

  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";
  let _area = document.getElementById(DIALOG_ID);

  if (_area) {
    if (_area.style.opacity <= 0.0) {
      dom.applyStyles(_area, _configs.normalDialogStyles);
    } else {
      _area.style.opacity = 0.0;
    }
    return;
  }

  const _contentTemplate = Hogan.compile(_configs.contentTemplate);
  const _headerTemplate = Hogan.compile(_configs.headerTemplate);

  const consultAndCreateContentHtml = words => {
    return new Promise(resolve => {
      chrome.storage.local.get(words, meanings => {
        const contentHtml = createContentHtml(words, meanings);
        resolve(contentHtml);
      });
    });
  };

  const createContentHtml = (words, meanings) => {
    const data = createContentTemplateData(words, meanings);
    const html = _contentTemplate.render({ words: data });
    return html;
  };

  const createContentTemplateData = (words, meanings) => {
    const data = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const desc = meanings[word];
      if (desc) {
        data.push({
          head: escapeHtml(word),
          desc: createDescriptionHtml(desc),
          isShort: word.length <= _configs.shortWordLength,
          shortText: desc.substring(0, _configs.cutShortWordDescription)
        });
      }
    }
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      d.isFirst = i == 0;
      d.isLast = i == data.length - 1;
    }

    return data;
  };

  const replaceRuleSettings = _configs.replaceRules;

  const replaceRule = [];
  for (let i = 0; i < replaceRuleSettings.length; i++) {
    const rule = replaceRuleSettings[i];
    if (rule.search) {
      replaceRule.push({
        search: new RegExp(rule.search, "g"),
        replace: rule.replace
      });
    }
  }

  const createDescriptionHtml = sourceText => {
    let result = sourceText;
    for (let i = 0; i < replaceRule.length; i++) {
      const rule = replaceRule[i];
      result = result.replace(rule.search, rule.replace);
    }
    return result;
  };

  const escapeHtml = str => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  let _lastText = null;
  const _shortCache = new ShortCache(100);

  document.body.addEventListener("mousemove", ev => {
    const textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY);
    if (!textAtCursor) {
      return;
    }
    if (_lastText == textAtCursor) {
      return;
    }
    const cache = _shortCache.get(textAtCursor);
    if (cache) {
      _area.content.innerHTML = "";
      _area.content.appendChild(cache);
      return;
    }

    const lookupWords = text.createLookupWords(textAtCursor);

    consultAndCreateContentHtml(lookupWords).then(contentHtml => {
      const newDom = dom.create(contentHtml);
      _area.content.innerHTML = "";
      _area.content.appendChild(newDom);
      _shortCache.put(textAtCursor, newDom);
      _lastText = textAtCursor;
    });
  });

  const createDialogElement = () => {
    const dialog = dom.create(_configs.dialogTemplate);
    dom.applyStyles(dialog, defaultSettings.normalDialogStyles);
    return dialog;
  };

  const createHeaderElement = () => {
    const html = _headerTemplate.render({});
    return dom.create(html);
  };

  const createContentWrapperElement = () => {
    const dialog = dom.create(_configs.contentWrapperTemplate);
    return dialog;
  };

  const createArea = () => {
    const dialog = createDialogElement();
    const header = createHeaderElement();
    const content = createContentWrapperElement();
    dialog.appendChild(header);
    dialog.appendChild(content);

    dialog.id = DIALOG_ID;
    return { dialog, header, content };
  };

  _area = createArea();
  document.body.appendChild(_area.dialog);

  const draggable = new Draggable(_configs.normalDialogStyles, _configs.movingDialogStyles);
  draggable.add(_area.dialog, _area.header);
};

main();
