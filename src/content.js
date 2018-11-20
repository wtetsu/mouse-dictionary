/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import text from "./text";
import res from "./resources";
import Draggable from "./draggable";
import ShortCache from "./shortcache";
import atcursor from "./atcursor";
import dom from "./dom";
import defaultSettings from "./defaultsettings";
import env from "./env";
import mdwindow from "./mdwindow";

const KEY_USER_CONFIG = "**** config ****";
const KEY_LAST_POSITION = "**** last_position ****";

const loadUserSettings = async () => {
  if (env.disableUserSettings) {
    return {};
  }
  return new Promise(resolve => {
    chrome.storage.sync.get([KEY_USER_CONFIG], d => {
      const userSettingsJson = d[KEY_USER_CONFIG];
      let userSettings = null;
      if (userSettingsJson) {
        userSettings = JSON.parse(userSettingsJson);
      } else {
        userSettings = {};
      }
      resolve(userSettings);
    });
  });
};

const processSettings = settings => {
  const jsonItems = ["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"];
  for (let i = 0; i < jsonItems.length; i++) {
    const item = jsonItems[i];
    if (settings[item]) {
      settings[item] = JSON.parse(settings[item]);
    }
  }
  if (env.disableKeepingWindowStatus && settings.initialPosition === "keep") {
    settings.initialPosition = "right";
  }
};

const initializeSettings = async () => {
  const settings = Object.assign({}, defaultSettings);
  processSettings(settings);

  const userSettings = await loadUserSettings();
  processSettings(userSettings);

  for (const item of Object.keys(userSettings)) {
    settings[item] = userSettings[item];
  }
  return settings;
};

const fetchInitialPosition = options => {
  return new Promise(resolve => {
    let left;
    switch (options.type) {
      case "right":
        left = options.documentWidth - options.dialogWidth - 5;
        resolve({ left: `${left}px` });
        break;
      case "left":
        left = 5;
        resolve({ left: `${left}px` });
        break;
      case "keep":
        chrome.storage.sync.get([KEY_LAST_POSITION], r => {
          // onGot
          const lastPositionJson = r[KEY_LAST_POSITION];
          const lastPosition = lastPositionJson ? JSON.parse(lastPositionJson) : {};
          const pos = optimizeInitialPosition(lastPosition, options);

          const styles = {};
          if (Number.isFinite(pos.left)) {
            styles.left = `${pos.left}px`;
          }
          if (Number.isFinite(pos.top)) {
            styles.top = `${pos.top}px`;
          }
          if (Number.isFinite(pos.width)) {
            styles.width = `${pos.width}px`;
          }
          if (Number.isFinite(pos.height)) {
            styles.height = `${pos.height}px`;
          }
          resolve(styles);
        });
        break;
      default:
        resolve({});
    }
  });
};

const optimizeInitialPosition = (position, options) => {
  let newLeft;
  if (position.left < 0) {
    newLeft = 5;
  } else if (position.left + position.width > options.windowWidth) {
    newLeft = options.windowWidth - position.width - 5;
  } else {
    newLeft = position.left;
  }

  let newTop;
  if (position.top < 0) {
    newTop = 5;
  } else if (position.top + position.height > options.windowHeight) {
    newTop = options.windowHeight - position.height - 5;
  } else {
    newTop = position.top;
  }

  const newPosition = {
    left: newLeft,
    top: newTop,
    width: max(position.width, 50),
    height: max(position.height, 50)
  };
  return newPosition;
};

const max = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.max(a, b);
  } else {
    return null;
  }
};

const main = async () => {
  // Pages which have frames are not supported.
  const frames = document.getElementsByTagName("frame");
  if (frames && frames.length >= 1) {
    alert(res("doesntSupportFrame"));
    return;
  }

  const DIALOG_ID = "____MOUSE_DICTIONARY_GtUfqBap4c8u";
  let _area = document.getElementById(DIALOG_ID);

  const _settings = await initializeSettings();

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

  // Compile templates, regular expressions so that it works fast
  let _contentGenerator;
  try {
    _contentGenerator = new mdwindow.ContentGenerator(_settings);
  } catch (e) {
    _contentGenerator = null;
    console.error(e);
  }

  let _lastText = null;
  const _shortCache = new ShortCache(100);

  let _selection = null;
  let _mouseDown = false;
  let _isLastMouseUpOnTheWindow = false;

  document.body.addEventListener("mousedown", () => {
    _mouseDown = true;
  });

  document.body.addEventListener("mouseup", e => {
    _mouseDown = false;
    _selection = window.getSelection().toString();
    if (_selection) {
      const SELECTION_LENGTH_LIMIT = 128;
      const text = _selection.trim().substring(0, SELECTION_LENGTH_LIMIT);
      parseTextAndLookup(text, true);
    }

    const s = _area.dialog.style;
    const top = parseInt(s.top, 10);
    const left = parseInt(s.left, 10);
    const width = parseInt(s.width, 10);
    const height = parseInt(s.height, 10);
    if (e.clientX >= left && e.clientX <= left + width && (e.clientY >= top && e.clientY <= top + height)) {
      _isLastMouseUpOnTheWindow = true;
    } else {
      _isLastMouseUpOnTheWindow = false;
    }
  });

  document.body.addEventListener("mousemove", ev => {
    if (_mouseDown) {
      return;
    }

    if (_isLastMouseUpOnTheWindow) {
      if (_selection) {
        return;
      }
    } else {
      if (window.getSelection().toString()) {
        return;
      }
    }

    let textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY, _settings.parseWordsLimit);
    if (!textAtCursor) {
      return;
    }
    parseTextAndLookup(textAtCursor, false);
  });

  const parseTextAndLookup = (textToLookup, mustIncludeOriginalText) => {
    if (!mustIncludeOriginalText) {
      if (!textToLookup || _lastText === textToLookup) {
        return;
      }
      const cache = _shortCache.get(textToLookup);
      if (cache) {
        _area.content.innerHTML = "";
        _area.content.appendChild(cache);
        return;
      }
    }

    const lookupWords = text.createLookupWords(textToLookup, _settings.lookupWithCapitalized, mustIncludeOriginalText);

    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }
    return lookup(lookupWords).then(newDom => {
      _shortCache.put(textToLookup, newDom);
      _lastText = textToLookup;

      if (process.env.NODE_ENV !== "production") {
        const time = new Date().getTime() - startTime;
        console.info(`${time}ms:${textToLookup}`);
        console.info(lookupWords);
      }
    });
  };

  const lookup = lookupWords => {
    return _contentGenerator.generate(lookupWords).then(contentHtml => {
      const newDom = dom.create(contentHtml);
      _area.content.innerHTML = "";
      _area.content.appendChild(newDom);
      return newDom;
    });
  };

  _area = mdwindow.create(_settings);
  _area.dialog.id = DIALOG_ID;

  dom.applyStyles(_area.dialog, _settings.hiddenDialogStyles);
  document.body.appendChild(_area.dialog);

  const position = await fetchInitialPosition({
    type: _settings.initialPosition,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    documentWidth: document.documentElement.clientWidth,
    documentHeight: document.documentElement.clientHeight,
    dialogWidth: _area.dialog.clientWidth,
    dialogHeight: _area.dialog.clientHeight
  });
  dom.applyStyles(_area.dialog, position);
  dom.applyStyles(_area.dialog, _settings.normalDialogStyles);

  const draggable = new Draggable(_settings.normalDialogStyles, _settings.movingDialogStyles);
  if (!env.disableKeepingWindowStatus) {
    draggable.onchange = e => {
      const positionData = {};
      positionData[KEY_LAST_POSITION] = JSON.stringify(e);
      chrome.storage.sync.set(positionData, () => {
        // saved
      });
    };
  }
  draggable.add(_area.dialog);
};

main();
