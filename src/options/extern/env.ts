/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import env from "../../main/env";
import { BROWSER, Env } from "../types";

const optionsEnv = { ...env } as Env;

if (BROWSER === "FIREFOX") {
  // Larger registerRecordsAtOnce causes memory hog
  // when loading large dictionary data in Firefox.
  optionsEnv.registerRecordsAtOnce = 1000;
} else {
  optionsEnv.registerRecordsAtOnce = 100000;
}

export const get = (): Env => {
  return optionsEnv;
};
