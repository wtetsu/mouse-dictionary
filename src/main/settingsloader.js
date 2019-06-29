/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import storage from "../lib/storage";
import defaultSettings from "../settings/defaultsettings";
import env from "../settings/env";

const KEY_USER_CONFIG = "**** config ****";
const KEY_LAST_POSITION = "**** last_position ****";

const JSON_FIELDS = new Set(["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"]);

const load = async () => {
  if (env.disableUserSettings) {
    return {};
  }
  const storedData = await storage.sync.get([KEY_USER_CONFIG, KEY_LAST_POSITION]);

  const settingJson = parseJson(storedData[KEY_USER_CONFIG] || "{}");
  const settings = parseSettings(settingJson);
  const position = parseJson(storedData[KEY_LAST_POSITION] || "{}");
  return { settings, position };
};

const loadInitialSettings = async () => {
  const userSettings = await loadUserSettings();
  const settings = Object.assign({}, defaultSettings, userSettings);
  return parseSettings(settings);
};

const parseSettings = settings => {
  const result = {};
  const keys = Object.keys(settings);
  for (let i = 0; i < keys.length; i++) {
    const field = keys[i];
    const value = settings[field];
    if (value === null || value === undefined) {
      continue;
    }
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

const loadUserSettings = async () => {
  if (env.disableUserSettings) {
    return {};
  }
  const userSettingsJson = (await storage.sync.pickOut(KEY_USER_CONFIG)) || "{}";
  return parseJson(userSettingsJson);
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

const savePosition = async e => {
  return storage.sync.set({
    [KEY_LAST_POSITION]: JSON.stringify(e)
  });
};

export default { load, loadInitialSettings, savePosition };
