/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import res from "./resources";
import dom from "./dom";
import defaultSettings from "./defaultsettings";
import env from "./env";
import mdwindow from "./mdwindow";
import position from "./position";
import storage from "./storage";
import events from "./events";
import Draggable from "./draggable";

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

  const updateContent = (newDom, count) => {
    if (draggable.selectable && count === 0) {
      return;
    }
    _area.content.innerHTML = "";
    _area.content.appendChild(newDom);
  };

  _area = mdwindow.create(_settings);
  _area.dialog.id = DIALOG_ID;

  events.attach(document.body, _settings, _area.dialog, updateContent);

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
};

main();
