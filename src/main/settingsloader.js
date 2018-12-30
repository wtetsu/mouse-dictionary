/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import storage from "../lib/storage";
import defaultSettings from "../settings/defaultsettings";
import env from "../settings/env";

const KEY_LAST_POSITION = "**** last_position ****";
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

const loadInitialSettings = async () => {
  const settings = Object.assign({}, defaultSettings);
  processSettings(settings);

  const userSettings = await loadUserSettings();
  processSettings(userSettings);

  for (const item of Object.keys(userSettings)) {
    settings[item] = userSettings[item];
  }
  return settings;
};

const loadInitialPosition = async options => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const documentWidth = document.documentElement.clientWidth;

  let result;
  switch (options.type) {
    case "right":
      {
        const left = documentWidth - options.dialogWidth - 5;
        result = { left: `${left}px` };
      }
      break;
    case "left":
      {
        const left = 5;
        result = { left: `${left}px` };
      }
      break;
    case "keep":
      {
        const data = await storage.sync.get(KEY_LAST_POSITION);
        const lastPositionJson = data[KEY_LAST_POSITION];
        const lastPosition = lastPositionJson ? JSON.parse(lastPositionJson) : {};
        const pos = optimizeInitialPosition(lastPosition, { windowWidth, windowHeight });

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
        result = styles;
      }
      break;
    default:
      result = {};
  }
  return result;
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
    left: max(newLeft, 5),
    top: max(newTop, 5),
    width: range(50, position.width, options.windowWidth - 10),
    height: range(50, position.height, options.windowHeight - 10)
  };
  return newPosition;
};

const range = (minValue, value, maxValue) => {
  let r = value;
  r = min(r, maxValue);
  r = max(r, minValue);
  return r;
};

const max = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.max(a, b);
  } else {
    return null;
  }
};

const min = (a, b) => {
  if (Number.isFinite(a)) {
    return Math.min(a, b);
  } else {
    return null;
  }
};

const savePosition = async e => {
  const positionData = {};
  positionData[KEY_LAST_POSITION] = JSON.stringify(e);
  return storage.sync.set(positionData);
};

export default { loadInitialPosition, loadInitialSettings, savePosition };
