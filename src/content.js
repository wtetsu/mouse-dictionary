import Hogan from "hogan.js";

import text from "./text";
import res from "./resources";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";
import defaultSettings from "./defaultsettings";

const initializeSettings = () => {
  const settings = {};
  if (!(settings.shortWordLength >= 0)) {
    settings.shortWordLength = defaultSettings.shortWordLength;
  }
  if (!(settings.cutShortWordDescription >= 0)) {
    settings.cutShortWordDescription = defaultSettings.cutShortWordDescription;
  }
  if (!settings.replaceRules) {
    settings.replaceRules = defaultSettings.replaceRules;
  }
  if (!settings.dialogTemplate) {
    settings.dialogTemplate = defaultSettings.dialogTemplate;
  }
  if (!settings.headerTemplate) {
    settings.headerTemplate = defaultSettings.headerTemplate;
  }
  if (!settings.contentWrapperTemplate) {
    settings.contentWrapperTemplate = defaultSettings.contentWrapperTemplate;
  }
  if (!settings.contentTemplate) {
    settings.contentTemplate = defaultSettings.contentTemplate;
  }
  if (!settings.normalDialogStyles) {
    settings.normalDialogStyles = defaultSettings.normalDialogStyles;
  }
  if (!settings.movingDialogStyles) {
    settings.movingDialogStyles = defaultSettings.movingDialogStyles;
  }
  if (!settings.hiddenDialogStyles) {
    settings.hiddenDialogStyles = defaultSettings.hiddenDialogStyles;
  }
  if (!settings.initialPosition) {
    settings.initialPosition = defaultSettings.initialPosition;
  }
  if (!settings.lookupWithCapitalized) {
    settings.lookupWithCapitalized = defaultSettings.lookupWithCapitalized;
  }

  return settings;
};

const main = () => {
  // Pages which have frames are not supported.
  const frames = document.getElementsByTagName("frame");
  if (frames && frames.length >= 1) {
    alert(res("doesntSupportFrame"));
    return;
  }

  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";
  let _area = document.getElementById(DIALOG_ID);

  const _settings = initializeSettings();

  if (_area) {
    const isHidden = _area.getAttribute("data-mouse-dictionary-hidden");
    if (isHidden === "true") {
      dom.applyStyles(_area, _settings.normalDialogStyles);
      _area.setAttribute("data-mouse-dictionary-hidden", "false");
    } else {
      dom.applyStyles(_area, _settings.hiddenDialogStyles);
      _area.setAttribute("data-mouse-dictionary-hidden", "true");
    }
    return;
  }

  const _contentTemplate = Hogan.compile(_settings.contentTemplate);
  const _headerTemplate = Hogan.compile(_settings.headerTemplate);

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
          isShort: word.length <= _settings.shortWordLength,
          shortText: desc.substring(0, _settings.cutShortWordDescription)
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

  const replaceRuleSettings = _settings.replaceRules;

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

  let _selection = null;

  document.body.addEventListener("mouseup", () => {
    _selection = window.getSelection().toString();
    lookup(_selection);
  });

  document.body.addEventListener("mousemove", ev => {
    let textAtCursor;
    if (_selection) {
      textAtCursor = _selection;
    } else {
      textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY);
    }
    if (!textAtCursor) {
      return;
    }

    lookup(textAtCursor);
  });

  const lookup = textToLookup => {
    if (!textToLookup || _lastText == textToLookup) {
      return;
    }

    const cache = _shortCache.get(textToLookup);
    if (cache) {
      _area.content.innerHTML = "";
      _area.content.appendChild(cache);
      return;
    }

    const lookupWords = text.createLookupWords(textToLookup, _settings.lookupWithCapitalized);

    consultAndCreateContentHtml(lookupWords).then(contentHtml => {
      const newDom = dom.create(contentHtml);
      _area.content.innerHTML = "";
      _area.content.appendChild(newDom);
      _shortCache.put(textToLookup, newDom);
      _lastText = textToLookup;
    });
  };

  const createDialogElement = () => {
    const dialog = dom.create(_settings.dialogTemplate);
    dom.applyStyles(dialog, defaultSettings.normalDialogStyles);
    return dialog;
  };

  const createHeaderElement = () => {
    const html = _headerTemplate.render({});
    return dom.create(html);
  };

  const createContentWrapperElement = () => {
    const dialog = dom.create(_settings.contentWrapperTemplate);
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

  let left;
  switch (_settings.initialPosition) {
    case "right":
      left = document.documentElement.clientWidth - _area.dialog.clientWidth - 5;
      break;
    default:
      left = 5;
  }
  if (Number.isFinite(left)) {
    _area.dialog.style["left"] = `${left}px`;
  }

  const draggable = new Draggable(_settings.normalDialogStyles, _settings.movingDialogStyles);
  draggable.add(_area.dialog, _area.header);
};

main();
