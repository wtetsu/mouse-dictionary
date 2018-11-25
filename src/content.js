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
import position from "./position";
import storage from "./storage";

const KEY_USER_CONFIG = "**** config ****";

const loadUserSettings = async () => {
  if (env.disableUserSettings) {
    return {};
  }
  const data = await storage.sync.get(KEY_USER_CONFIG);
  const userSettingsJson = data[KEY_USER_CONFIG];
  const userSettings = userSettingsJson ? JSON.parse(userSettingsJson) : {};
  return userSettings;
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
      parseTextAndLookup(text, true, false);
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
    if (_isLastMouseUpOnTheWindow && _selection) {
      return;
    }
    if (!_isLastMouseUpOnTheWindow && window.getSelection().toString()) {
      return;
    }
    let textAtCursor = atcursor(ev.target, ev.clientX, ev.clientY, _settings.parseWordsLimit);
    if (!textAtCursor) {
      return;
    }
    parseTextAndLookup(textAtCursor, false, true);
  });

  const parseTextAndLookup = (textToLookup, mustIncludeOriginalText, enableShortWord) => {
    if (!mustIncludeOriginalText) {
      if (!textToLookup || _lastText === textToLookup) {
        return;
      }
      const cacheData = _shortCache.get(textToLookup);
      if (cacheData) {
        updateContent(cacheData.dom, cacheData.hitCount);
        return;
      }
    }

    const lookupWords = text.createLookupWords(textToLookup, _settings.lookupWithCapitalized, mustIncludeOriginalText);

    let startTime;
    if (process.env.NODE_ENV !== "production") {
      startTime = new Date().getTime();
    }
    return lookup(lookupWords, enableShortWord).then(({ dom, hitCount }) => {
      _shortCache.put(textToLookup, { dom, hitCount });
      _lastText = textToLookup;

      if (process.env.NODE_ENV !== "production") {
        const time = new Date().getTime() - startTime;
        console.info(`${time}ms:${textToLookup}`);
        console.info(lookupWords);
      }
    });
  };

  const lookup = (lookupWords, enableShortWord) => {
    return _contentGenerator.generate(lookupWords, enableShortWord).then(({ html, hitCount }) => {
      const newDom = dom.create(html);
      updateContent(newDom, hitCount);
      return { dom: newDom, hitCount };
    });
  };

  _area = mdwindow.create(_settings);
  _area.dialog.id = DIALOG_ID;

  dom.applyStyles(_area.dialog, _settings.hiddenDialogStyles);
  document.body.appendChild(_area.dialog);

  const positions = await position.fetchInitialPosition({
    type: _settings.initialPosition,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    documentWidth: document.documentElement.clientWidth,
    documentHeight: document.documentElement.clientHeight,
    dialogWidth: _area.dialog.clientWidth,
    dialogHeight: _area.dialog.clientHeight
  });
  dom.applyStyles(_area.dialog, positions);
  dom.applyStyles(_area.dialog, _settings.normalDialogStyles);

  const draggable = new Draggable(_settings.normalDialogStyles, _settings.movingDialogStyles);
  if (!env.disableKeepingWindowStatus) {
    draggable.onchange = e => position.save(e);
  }
  draggable.add(_area.dialog);

  const updateContent = (newDom, count) => {
    if (draggable.selectable && count === 0) {
      return;
    }
    _area.content.innerHTML = "";
    _area.content.appendChild(newDom);
  };
};

main();
