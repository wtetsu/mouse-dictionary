/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import defaultSettings from "../../main/settings/defaultsettings";
import { MouseDictionarySettings } from "../types";

const defaultSettingsJson = JSON.stringify(defaultSettings);

export const get = (): MouseDictionarySettings => {
  return JSON.parse(defaultSettingsJson) as MouseDictionarySettings;
};
