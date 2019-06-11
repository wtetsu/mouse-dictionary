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

const JSON_FIELDS = new Set(["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"]);

const loadUserSettings = async () => {
  if (env.disableUserSettings) {
    return {};
  }
  const data = await storage.sync.get(KEY_USER_CONFIG);
  const userSettingsJson = data[KEY_USER_CONFIG];
  const userSettings = userSettingsJson ? JSON.parse(userSettingsJson) : {};
  return userSettings;
};

const loadInitialSettings = async () => {
  const settings = parseSettings(defaultSettings);
  const userSettings = parseSettings(await loadUserSettings());

  for (const item of Object.keys(userSettings)) {
    const value = userSettings[item];
    if (value !== null && value !== undefined) {
      settings[item] = value;
    }
  }
  return settings;
};

const parseSettings = settings => {
  const result = {};
  for (let field of Object.keys(settings)) {
    const value = settings[field];
    if (JSON_FIELDS.has(field)) {
      result[field] = parseJson(value);
    } else {
      result[field] = value;
    }
  }
  if (env.disableKeepingWindowStatus && settings.initialPosition === "keep") {
    result.initialPosition = "right";
  }
  return result;
};

const parseJson = json => {
  if (!json) {
    return null;
  }
  let result;
  try {
    result = JSON.parse(json);
  } catch (e) {
    result = null;
    console.error("Failed to parse json:" + json);
    console.error(e);
  }
  return result;
};

const loadInitialPosition = async options => {
  const position = {};
  switch (options.type) {
    case "right":
      position.left = document.documentElement.clientWidth - options.dialogWidth - 5;
      break;
    case "left":
      position.left = 5;
      break;
    case "keep":
      Object.assign(position, await restoreInitialPosition());
      break;
  }

  const result = {};
  for (let key of Object.keys(position)) {
    const n = position[key];
    if (Number.isFinite(n)) {
      result[key] = `${n}px`;
    }
  }
  return result;
};

const restoreInitialPosition = async () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const lastPositionJson = await storage.sync.pickOut(KEY_LAST_POSITION);
  const lastPosition = lastPositionJson ? JSON.parse(lastPositionJson) : {};
  const optimizedPosition = optimizeInitialPosition(lastPosition, { windowWidth, windowHeight });

  return optimizedPosition;
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
  return storage.sync.set({
    [KEY_LAST_POSITION]: JSON.stringify(e)
  });
};

export default { loadInitialPosition, loadInitialSettings, savePosition };
