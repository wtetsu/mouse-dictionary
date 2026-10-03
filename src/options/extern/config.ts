/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */
/* istanbul ignore file */

import orgConfig, { KEY_LOADED, KEY_USER_CONFIG } from "../../main/core/config";
import storage from "../../main/lib/storage";
import type { MouseDictionarySettings } from "../types";

const KEY_BYTES_IN_USE = "**** bytes_in_use ****";

const { loadRawSettings, isDataReady } = orgConfig;

export { isDataReady, loadRawSettings };

export const saveSettings = (settings: MouseDictionarySettings): Promise<void> =>
  storage.sync.set({ [KEY_USER_CONFIG]: JSON.stringify(settings) });

export const setDataReady = (ready: boolean): Promise<void> => storage.local.set({ [KEY_LOADED]: ready });

export const getBytesInUse = (): Promise<number> => storage.local.pick(KEY_BYTES_IN_USE) as Promise<number>;

export const setBytesInUse = (bytes: number): Promise<void> => storage.local.set({ [KEY_BYTES_IN_USE]: bytes });
