/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import env from "../env";
import storage from "../lib/storage";
import defaultSettings from "../settings";
import type { MouseDictionarySettings, ParsedSettings } from "../types";

export type Position = { left: number; top: number; width: number; height: number };
type StoredData = Record<string, Record<string, unknown>>;

const KEY_USER_CONFIG = "**** config ****";
const KEY_LAST_POSITION = "**** last_position ****";
const KEY_LOADED = "**** loaded ****";

const JSON_FIELDS = new Set(["normalDialogStyles", "movingDialogStyles", "hiddenDialogStyles"]);

const loadAll = async (): Promise<{ settings: ParsedSettings; position: Position }> => {
  if (!env.enableUserSettings) {
    return { settings: parseSettings(defaultSettings), position: {} as Position };
  }
  const data = await getStoredData([KEY_USER_CONFIG, KEY_LAST_POSITION]);
  const mergedSettings = { ...defaultSettings, ...data[KEY_USER_CONFIG] };
  const settings = parseSettings(mergedSettings);

  const position = data[KEY_LAST_POSITION] as Position;
  return { settings, position };
};

const loadSettings = async (): Promise<ParsedSettings> => {
  const rawSettings = await loadRawSettings();
  return parseSettings(rawSettings);
};

const loadRawSettings = async (): Promise<MouseDictionarySettings> => {
  if (!env.enableUserSettings) {
    return { ...defaultSettings };
  }

  const data = await getStoredData([KEY_USER_CONFIG]);
  const userSettings = data[KEY_USER_CONFIG];
  return { ...defaultSettings, ...userSettings };
};

const parseSettings = (settings: MouseDictionarySettings): ParsedSettings => {
  const result: Record<string, unknown> = {};
  const keys = Object.keys(settings) as (keyof MouseDictionarySettings)[];
  for (let i = 0; i < keys.length; i++) {
    const field = keys[i];
    const value = settings[field];
    if (value === null || value === undefined) {
      continue;
    }
    result[field] = JSON_FIELDS.has(field) ? parseJson(value as string) : value;
  }
  if (!env.enableWindowStatusSave && settings.initialPosition === "keep") {
    result.initialPosition = "right";
  }
  return result as ParsedSettings;
};

const parseJson = (json: string) => {
  if (!json) {
    return null;
  }
  let result: unknown;
  try {
    result = JSON.parse(json);
  } catch (e) {
    result = null;
    console.error("Failed to parse json:" + json);
    console.error(e);
  }
  return result;
};

const savePosition = async (e: object): Promise<void> => {
  if (!env.enableUserSettings || !env.enableWindowStatusSave) {
    return;
  }
  return storage.sync.set({
    [KEY_LAST_POSITION]: JSON.stringify(e),
  });
};

const getStoredData = async (keys: string[]): Promise<StoredData> => {
  const result: StoredData = {};
  const storedData = await storage.sync.get(keys);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const json = (storedData[key] as string | undefined) ?? "{}";
    result[key] = (parseJson(json) as Record<string, unknown> | null) ?? {};
  }

  return result;
};

const isDataReady = (): Promise<boolean | undefined> => storage.local.pick<boolean>(KEY_LOADED);

export { KEY_LOADED, KEY_USER_CONFIG };

export default {
  loadAll,
  loadSettings,
  loadRawSettings,
  parseSettings,
  savePosition,
  isDataReady,
};
