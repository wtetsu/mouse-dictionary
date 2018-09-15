import Hogan from "hogan.js";

import text from "./text";
import res from "./resources";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";
import defaultSettings from "./defaultsettings";
import env from "./env";
import mdwindow from "./mdwindow";

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
    if (env.disableKeepingWindowStatus && settings.initialPosition === "keep") {
      settings.initialPosition = "right";
    }
  }
  if (!settings.lookupWithCapitalized) {
    settings.lookupWithCapitalized = defaultSettings.lookupWithCapitalized;
  }
  if (!settings.initialSize) {
    settings.initialSize = defaultSettings.initialSize;
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

  // Since contentTemplate is executed fairly frequently,
  // it's compiled first and should be used the result repeatedly.
  const _contentTemplate = Hogan.compile(_settings.contentTemplate);

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
  _area = mdwindow.create(_settings);
  _area.dialog.id = DIALOG_ID;

  const LAST_POSITION_KEY = "**** last_position ****";

  const fetchInitialPosition = () => {
    return new Promise(resolve => {
      let left;
      switch (_settings.initialPosition) {
        case "right":
          left = document.documentElement.clientWidth - _area.dialog.clientWidth - 5;
          resolve({ left });
          break;
        case "left":
          left = 5;
          resolve({ left });
          break;
        case "keep":
          chrome.storage.sync.get(
            [LAST_POSITION_KEY],
            r => {
              // onGot
              const lastPosition = r[LAST_POSITION_KEY];
              if (lastPosition) {
                if (lastPosition.width < 50) {
                  lastPosition.width = 50;
                }
                if (lastPosition.height < 50) {
                  lastPosition.height = 50;
                }
              }
              resolve(lastPosition || {});
            },
            () => {
              // onError: same as "right"
              left = document.documentElement.clientWidth - _area.dialog.clientWidth - 5;
              resolve({ left });
            }
          );
          break;
        default:
          resolve({});
          left = 5;
      }
    });
  };

  dom.applyStyles(_area.dialog, _settings.hiddenDialogStyles);
  document.body.appendChild(_area.dialog);

  fetchInitialPosition().then(position => {
    if (Number.isFinite(position.left)) {
      _area.dialog.style["left"] = `${position.left}px`;
    }
    if (Number.isFinite(position.top)) {
      _area.dialog.style["top"] = `${position.top}px`;
    }
    if (Number.isFinite(position.width)) {
      _area.dialog.style["width"] = `${position.width}px`;
    }
    if (Number.isFinite(position.height)) {
      _area.dialog.style["height"] = `${position.height}px`;
    }

    dom.applyStyles(_area.dialog, _settings.normalDialogStyles);

    const draggable = new Draggable(_settings.normalDialogStyles, _settings.movingDialogStyles);
    if (!_settings.disableKeepingWindowStatus) {
      draggable.onchange = e => {
        const positionData = {};
        positionData[LAST_POSITION_KEY] = JSON.stringify(e);
        chrome.storage.local.set(positionData, () => {
          // saved
        });
      };
    }
    draggable.add(_area.dialog, _area.header);
  });
};

main();
