/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import orgConfig from "../../main/core/config";
import storage from "../../main/lib/storage";
import { MouseDictionarySettings } from "../types";

const KEY_USER_CONFIG = "**** config ****";
const KEY_LOADED = "**** loaded ****";
const KEY_BYTES_IN_USE = "**** bytes_in_use ****";

const { loadRawSettings, isDataReady } = orgConfig;

export { loadRawSettings };

export { isDataReady };

export const saveSettings = (settings: MouseDictionarySettings): Promise<void> =>
  storage.sync.set({ [KEY_USER_CONFIG]: JSON.stringify(settings) });

export const setDataReady = (ready: boolean): Promise<void> => storage.local.set({ [KEY_LOADED]: ready });

export const getBytesInUse = (): Promise<number> => storage.local.pick(KEY_BYTES_IN_USE);

export const setBytesInUse = (bytes: number): Promise<void> => storage.local.set({ [KEY_BYTES_IN_USE]: bytes });
