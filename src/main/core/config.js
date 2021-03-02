/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import storage from "../lib/storage";
import defaultSettings from "../settings";
import env from "../env";

const KEY_USER_CONFIG = "**** config ****";
const KEY_LAST_POSITION = "**** last_position ****";
const KEY_LOADED = "**** loaded ****";

const JSON_FIELDS = new Set(["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"]);

const loadAll = async () => {
  if (!env.enableUserSettings) {
    return { settings: parseSettings(defaultSettings), position: {} };
  }
  const data = await getStoredData([KEY_USER_CONFIG, KEY_LAST_POSITION]);
  const mergedSettings = { ...defaultSettings, ...data[KEY_USER_CONFIG] };
  const settings = parseSettings(mergedSettings);

  const position = data[KEY_LAST_POSITION];
  return { settings, position };
};

const loadSettings = async () => {
  const rawSettings = await loadRawSettings();
  return parseSettings(rawSettings);
};

const loadRawSettings = async () => {
  if (!env.enableUserSettings) {
    return { ...defaultSettings };
  }

  const data = await getStoredData([KEY_USER_CONFIG]);
  const userSettings = data[KEY_USER_CONFIG];
  return { ...defaultSettings, ...userSettings };
};

const parseSettings = (settings) => {
  const result = {};
  const keys = Object.keys(settings);
  for (let i = 0; i < keys.length; i++) {
    const field = keys[i];
    const value = settings[field];
    if (value === null || value === undefined) {
      continue;
    }
    result[field] = JSON_FIELDS.has(field) ? parseJson(value) : value;
  }
  if (!env.enableWindowStatusSave && settings.initialPosition === "keep") {
    result.initialPosition = "right";
  }
  return result;
};

const parseJson = (json) => {
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

const savePosition = async (e) => {
  if (!env.enableUserSettings || !env.enableWindowStatusSave) {
    return;
  }
  return storage.sync.set({
    [KEY_LAST_POSITION]: JSON.stringify(e),
  });
};

const getStoredData = async (keys) => {
  const result = {};
  const storedData = await storage.sync.get(keys);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const json = storedData[key] ?? "{}";
    result[key] = parseJson(json) ?? {};
  }

  return result;
};

const isDataReady = () => storage.local.pick(KEY_LOADED);

export default {
  loadAll,
  loadSettings,
  loadRawSettings,
  savePosition,
  isDataReady,
};
